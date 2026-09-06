import { zodResolver } from "@hookform/resolvers/zod";
import { faBan, faCircleCheck, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AdminActionGroup, AdminActionIconButton } from "@/components/admin/AdminActionIconButton";
import { DataTable } from "@/components/DataTable";
import { SearchField } from "@/components/SearchField";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { useSiteData } from "@/contexts/site-data-context";
import { getErrorMessage, isApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { buildMeta } from "@/lib/meta";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProduct,
  fetchAdminProducts,
  getProductTone,
  uploadAdminMediaAsset,
  updateAdminProduct,
  updateAdminProductAvailability,
  type Category,
  type MediaAsset,
  type Product,
  type ProductInput,
} from "@/lib/visemfood-api";

const productTypeOptions = [
  { value: "menu_item", label: "Menu Item" },
  { value: "bowl", label: "Bowl" },
  { value: "tray", label: "Tray" },
  { value: "cooler", label: "Cooler" },
  { value: "hosting_pack", label: "Hosting Pack" },
] as const;

const publicationStatusOptions = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

const availabilityOptions = [
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited" },
  { value: "unavailable", label: "Unavailable" },
] as const;

const featuredFilterOptions = [
  { value: "all", label: "All feature states" },
  { value: "featured", label: "Featured only" },
  { value: "standard", label: "Standard only" },
] as const;

const numericPattern = /^\d+(\.\d{1,2})?$/;
const integerPattern = /^\d+$/;

const variantSchema = z.object({
  variantId: z.string().trim(),
  name: z.string().trim().min(1, "Variant name is required.").max(150, "Variant name is too long."),
  sku: z.string().trim().max(120, "SKU is too long."),
  portionLabel: z.string().trim().max(120, "Serving label is too long."),
  description: z.string().trim().max(2000, "Variant description is too long."),
  price: z.string().trim().regex(numericPattern, "Variant price must be a valid amount."),
  salePrice: z
    .string()
    .trim()
    .refine((value) => value === "" || numericPattern.test(value), "Variant sale price must be a valid amount."),
  availabilityStatus: z.enum(availabilityOptions.map((option) => option.value) as [string, ...string[]]),
  isDefault: z.boolean(),
  sortOrder: z.string().trim().refine((value) => value === "" || integerPattern.test(value), "Sort order must be a whole number."),
});

const productSchema = z
  .object({
    name: z.string().trim().min(2, "Product name is required.").max(150, "Product name is too long."),
    slug: z.string().trim().max(180, "Slug is too long."),
    categoryId: z.string().trim().regex(/^\d+$/, "Select a category."),
    productType: z.enum(productTypeOptions.map((option) => option.value) as [string, ...string[]]),
    shortDescription: z.string().trim().max(255, "Short description is too long."),
    description: z.string().trim().max(10000, "Description is too long."),
    basePrice: z.string().trim().regex(numericPattern, "Base price must be a valid amount."),
    salePrice: z
      .string()
      .trim()
      .refine((value) => value === "" || numericPattern.test(value), "Sale price must be a valid amount."),
    servingSize: z.string().trim().max(120, "Serving size is too long."),
    status: z.enum(publicationStatusOptions.map((option) => option.value) as [string, ...string[]]),
    availabilityStatus: z.enum(availabilityOptions.map((option) => option.value) as [string, ...string[]]),
    featured: z.boolean(),
    availableForOrder: z.boolean(),
    preparationTimeMinutes: z
      .string()
      .trim()
      .refine((value) => value === "" || integerPattern.test(value), "Preparation time must be a whole number."),
    sortOrder: z.string().trim().refine((value) => value === "" || integerPattern.test(value), "Sort order must be a whole number."),
    orderingNotes: z.string().trim().max(10000, "Ordering notes are too long."),
    primaryMediaId: z
      .string()
      .trim()
      .refine((value) => value === "" || /^\d+$/.test(value), "Media asset ID must be numeric."),
    variants: z.array(variantSchema).min(1, "Add at least one variant."),
  })
  .superRefine((values, context) => {
    const basePrice = Number(values.basePrice);
    const salePrice = values.salePrice === "" ? null : Number(values.salePrice);

    if (salePrice !== null && salePrice > basePrice) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Sale price cannot exceed the base price.",
      });
    }

    values.variants.forEach((variant, index) => {
      const variantPrice = Number(variant.price);
      const variantSalePrice = variant.salePrice === "" ? null : Number(variant.salePrice);

      if (variantSalePrice !== null && variantSalePrice > variantPrice) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants", index, "salePrice"],
          message: "Variant sale price cannot exceed the variant price.",
        });
      }
    });

    if (!values.variants.some((variant) => variant.isDefault)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variants", 0, "isDefault"],
        message: "Select one default variant.",
      });
    }
  });

type ProductFormValues = z.infer<typeof productSchema>;

export const Route = createFileRoute("/admin/catalog")({
  head: () =>
    buildMeta({
      title: "Catalog | VISEMFOOD Admin",
      description: "Manage live products, variants, pricing, availability, and product imagery inside the VISEMFOOD admin suite.",
    }),
  component: CatalogAdminPage,
});

function CatalogAdminPage() {
  const { refresh: refreshSiteData } = useSiteData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState<(typeof featuredFilterOptions)[number]["value"]>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [galleryAssets, setGalleryAssets] = useState<MediaAsset[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: createBlankProductFormValues(),
  });
  const watchedName = form.watch("name");

  useEffect(() => {
    const nextSlug = createSlug(watchedName);

    if (form.getValues("slug") !== nextSlug) {
      form.setValue("slug", nextSlug);
    }
  }, [form, watchedName]);

  const variantsFieldArray = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const isSubmitting = form.formState.isSubmitting;
  const blockingError = loadError && !productsLoading && products.length === 0;
  const inlineError = loadError && products.length > 0;
  const availableCount = useMemo(() => products.filter((product) => product.availability === "Available").length, [products]);
  const limitedCount = useMemo(() => products.filter((product) => product.availability === "Limited").length, [products]);
  const unavailableCount = useMemo(() => products.filter((product) => product.availability === "Sold Out").length, [products]);
  const canCreateProducts = categories.length > 0;

  async function loadCategories() {
    setCategoriesLoading(true);

    try {
      const result = await fetchAdminCategories({ perPage: 100 });
      setCategories(result.items);
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, "Unable to load categories right now."));
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function loadProducts() {
    setProductsLoading(true);

    try {
      const result = await fetchAdminProducts({
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        availabilityStatus: availabilityFilter === "all" ? undefined : availabilityFilter,
        productType: productTypeFilter === "all" ? undefined : productTypeFilter,
        featured:
          featuredFilter === "all"
            ? undefined
            : featuredFilter === "featured",
        search: deferredSearch.trim() || undefined,
        perPage: 100,
      });
      setProducts(result.items);
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, "Unable to load catalog records right now."));
    } finally {
      setProductsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [categoryFilter, statusFilter, availabilityFilter, productTypeFilter, featuredFilter, deferredSearch]);

  function openCreateEditor() {
    setIsEditorOpen(true);
    setEditorMode("create");
    setSelectedProductId(null);
    setGalleryAssets([]);
    setIsImageUploading(false);
    setLastSavedAt(null);
    setIsEditorLoading(false);
    form.reset(createBlankProductFormValues(getNextProductSortOrder(products)));
  }

  async function openEditEditor(productId: number) {
    setIsEditorOpen(true);
    setIsEditorLoading(true);
    setIsImageUploading(false);

    try {
      const product = await fetchAdminProduct(productId);
      setEditorMode("edit");
      setSelectedProductId(product.id);
      setGalleryAssets(product.media.length > 0 ? product.media : product.primaryImage ? [product.primaryImage] : []);
      setLastSavedAt(product.updatedAt);
      form.reset(toProductFormValues(product));
    } catch (error) {
      closeEditor();
      toast.error("Unable to load product", {
        description: getErrorMessage(error, "The product could not be loaded for editing."),
      });
    } finally {
      setIsEditorLoading(false);
    }
  }

  function closeEditor(nextSortOrder = getNextProductSortOrder(products)) {
    setIsEditorOpen(false);
    setEditorMode("create");
    setSelectedProductId(null);
    setGalleryAssets([]);
    setIsImageUploading(false);
    setLastSavedAt(null);
    setIsEditorLoading(false);
    form.reset(createBlankProductFormValues(nextSortOrder));
  }

  async function refreshAfterMutation() {
    await Promise.all([loadProducts(), refreshSiteData()]);
  }

  async function handleImageUpload(file: File | null) {
    if (!file) {
      return;
    }

    setIsImageUploading(true);

    try {
      const result = await uploadAdminMediaAsset(file, {
        spec: "product",
        altText: form.getValues("name").trim() || file.name,
      });

      setGalleryAssets([result.asset]);
      form.setValue("primaryMediaId", String(result.asset.id), {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast.success("Image uploaded", {
        description: "Save the product to keep this image attached.",
      });
    } catch (error) {
      toast.error("Unable to upload image", {
        description: getErrorMessage(error, "Please use a JPG, PNG, or WebP image up to 5MB."),
      });
    } finally {
      setIsImageUploading(false);
    }
  }

  function setDefaultVariant(index: number) {
    variantsFieldArray.fields.forEach((_, fieldIndex) => {
      form.setValue(`variants.${fieldIndex}.isDefault`, fieldIndex === index, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  }

  function appendVariant() {
    variantsFieldArray.append(createBlankVariant(variantsFieldArray.fields.length, variantsFieldArray.fields.length === 0));
  }

  function removeVariant(index: number) {
    if (variantsFieldArray.fields.length === 1) {
      toast.error("At least one variant is required", {
        description: "Keep one variant on every product so pricing and ordering remain stable.",
      });
      return;
    }

    const wasDefault = form.getValues(`variants.${index}.isDefault`);
    variantsFieldArray.remove(index);

    if (wasDefault) {
      setTimeout(() => {
        if (form.getValues("variants").length > 0) {
          setDefaultVariant(0);
        }
      }, 0);
    }
  }

  async function handleAvailabilityToggle(product: Product) {
    const nextAvailability = product.availabilityStatus === "unavailable" ? "available" : "unavailable";

    try {
      const result = await updateAdminProductAvailability(product.id, {
        availabilityStatus: nextAvailability,
        status: product.status,
        availableForOrder: nextAvailability !== "unavailable",
      });
      await refreshAfterMutation();

      if (selectedProductId === product.id) {
        form.setValue("availabilityStatus", result.product.availabilityStatus, { shouldDirty: false });
        form.setValue("availableForOrder", result.product.availableForOrder, { shouldDirty: false });
        setLastSavedAt(result.product.updatedAt ?? new Date().toISOString());
      }

      toast.success(nextAvailability === "available" ? "Product reactivated" : "Product marked unavailable", {
        description: result.message,
      });
    } catch (error) {
      toast.error("Unable to update product availability", {
        description: getErrorMessage(error, "Please try again."),
      });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      const message = await deleteAdminProduct(deleteTarget.id);
      await refreshAfterMutation();

      if (selectedProductId === deleteTarget.id) {
        closeEditor();
      }

      setDeleteTarget(null);
      toast.success("Product deleted", {
        description: message,
      });
    } catch (error) {
      setDeleteTarget(null);
      toast.error("Unable to delete product", {
        description: getErrorMessage(error, "Please try again."),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      const payload = toProductPayload(values, galleryAssets);
      const result =
        editorMode === "edit" && selectedProductId !== null
          ? await updateAdminProduct(selectedProductId, payload)
          : await createAdminProduct(payload);

      await refreshAfterMutation();

      if (editorMode === "edit") {
        closeEditor();
      } else {
        closeEditor(getNextProductSortOrder([...products, result.product]));
      }

      toast.success(editorMode === "edit" ? "Product updated" : "Product created", {
        description: result.message,
      });
    } catch (error) {
      mapProductServerErrors(error, form);
      toast.error(editorMode === "edit" ? "Unable to update product" : "Unable to create product", {
        description: getErrorMessage(error, "Please review the product details and try again."),
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-soft)] sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeading
            eyebrow="Admin"
            title="Product catalog management"
            body="Create live menu products, adjust real USD pricing, manage variants, and control whether each item is publicly orderable."
            as="h1"
          />

          <div className="flex flex-wrap gap-3">
            <StatusChip tone="olive">{products.length} loaded</StatusChip>
            <StatusChip tone="success">{availableCount} available</StatusChip>
            <StatusChip tone="warning">{limitedCount} limited</StatusChip>
            <StatusChip tone="danger">{unavailableCount} unavailable</StatusChip>
            <button
              type="button"
              className="btn-primary w-full rounded-full px-6 sm:w-auto"
              onClick={() => openCreateEditor()}
              disabled={isSubmitting || isEditorLoading || isImageUploading || !canCreateProducts}
            >
              <span className="material-symbols-rounded text-base">add</span>
              Add Product
            </button>
          </div>
        </div>
      </div>

      {!canCreateProducts && !categoriesLoading ? (
        <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
          Create at least one category before adding products. Products are stored against a real category ID and cannot remain uncategorized.
        </div>
      ) : null}

      {inlineError ? (
        <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{loadError}</p>
            <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => void loadProducts()}>
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {blockingError ? (
        <div className="card-surface max-w-3xl p-8 text-center sm:mx-auto sm:p-10">
          <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Unable to load products</h2>
          <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
            {loadError ?? "The live product manager is temporarily unavailable."}
          </p>
          <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={() => void loadProducts()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="space-y-4 xl:col-span-12">
            <div className="card-surface space-y-4 p-4 sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_220px_220px]">
                <SearchField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products, slugs, descriptions, or notes"
                  ariaLabel="Search products"
                  className="xl:col-span-1"
                />

                <label className="relative block">
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="select-field appearance-none pr-12"
                    aria-label="Filter by category"
                  >
                    <option value="all">{categoriesLoading ? "Loading categories..." : "All categories"}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
                    <span className="material-symbols-rounded">expand_more</span>
                  </span>
                </label>

                <label className="relative block">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="select-field appearance-none pr-12"
                    aria-label="Filter by publication status"
                  >
                    <option value="all">All publication states</option>
                    {publicationStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
                    <span className="material-symbols-rounded">expand_more</span>
                  </span>
                </label>
              </div>

              <div className="grid gap-4 xl:grid-cols-[220px_220px_220px_auto]">
                <label className="relative block">
                  <select
                    value={availabilityFilter}
                    onChange={(event) => setAvailabilityFilter(event.target.value)}
                    className="select-field appearance-none pr-12"
                    aria-label="Filter by availability"
                  >
                    <option value="all">All availability</option>
                    {availabilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {titleCase(option.label)}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
                    <span className="material-symbols-rounded">expand_more</span>
                  </span>
                </label>

                <label className="relative block">
                  <select
                    value={productTypeFilter}
                    onChange={(event) => setProductTypeFilter(event.target.value)}
                    className="select-field appearance-none pr-12"
                    aria-label="Filter by product type"
                  >
                    <option value="all">All product types</option>
                    {productTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
                    <span className="material-symbols-rounded">expand_more</span>
                  </span>
                </label>

                <label className="relative block">
                  <select
                    value={featuredFilter}
                    onChange={(event) => setFeaturedFilter(event.target.value as (typeof featuredFilterOptions)[number]["value"])}
                    className="select-field appearance-none pr-12"
                    aria-label="Filter by featured state"
                  >
                    {featuredFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
                    <span className="material-symbols-rounded">expand_more</span>
                  </span>
                </label>

                <button
                  type="button"
                  className="btn-ghost w-full rounded-full sm:w-auto"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                    setAvailabilityFilter("all");
                    setProductTypeFilter("all");
                    setFeaturedFilter("all");
                  }}
                >
                  <span className="material-symbols-rounded text-base">refresh</span>
                  Reset
                </button>
              </div>

              <p className="text-sm text-soft">
                Public guests receive only published, orderable products in active categories. Products and variants both stay under backend control for pricing and availability.
              </p>
            </div>

            {productsLoading && products.length === 0 ? (
              <div className="card-surface p-6 text-sm text-soft">Loading live products...</div>
            ) : products.length === 0 ? (
              <div className="card-surface p-8 text-center sm:p-10">
                <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">No products yet</h2>
                <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                  No products have been added yet. Create the first live menu item, bowl, tray, or hosting pack here.
                </p>
                <button
                  type="button"
                  className="btn-primary mt-6 w-full sm:w-auto"
                  onClick={() => openCreateEditor()}
                  disabled={!canCreateProducts}
                >
                  Create First Product
                </button>
              </div>
            ) : (
              <DataTable
                rows={products}
                columns={[
                  {
                    key: "name",
                    header: "Product",
                    cell: (row) => (
                      <div className="flex items-center gap-3">
                        {row.image ? (
                          <img
                            src={row.image}
                            alt={row.name}
                            className="h-12 w-12 rounded-[var(--vf-radius-sm)] object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--vf-radius-sm)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] text-[var(--vf-primary)]">
                            <span className="material-symbols-rounded text-xl">inventory_2</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--vf-text)]">{row.name}</p>
                          <p className="truncate text-xs uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">{row.slug}</p>
                          {row.shortDescription ? <p className="mt-1 text-xs text-soft">{row.shortDescription}</p> : null}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "category",
                    header: "Category",
                    cell: (row) => (
                      <div>
                        <p className="font-medium text-[var(--vf-text)]">{row.category}</p>
                        <p className="text-xs text-soft">{formatProductType(row.productType)}</p>
                      </div>
                    ),
                  },
                  {
                    key: "price",
                    header: "Pricing",
                    cell: (row) => (
                      <div>
                        <p className="font-semibold text-[var(--vf-text)]">
                          {formatCurrency(row.price, { currency: row.currencyCode })}
                        </p>
                        <p className="text-xs text-soft">
                          {row.variants.length} variant{row.variants.length === 1 ? "" : "s"} | {row.servingSize}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "availability",
                    header: "Availability",
                    cell: (row) => <StatusChip tone={getProductTone(row.availability)}>{row.availability}</StatusChip>,
                  },
                  {
                    key: "status",
                    header: "Publication",
                    cell: (row) => <StatusChip tone={getPublicationTone(row.status)}>{titleCase(row.status)}</StatusChip>,
                  },
                  {
                    key: "featured",
                    header: "Featured",
                    cell: (row) =>
                      row.featured ? (
                        <StatusChip tone="olive">Featured</StatusChip>
                      ) : (
                        <span className="text-sm text-[var(--vf-text-soft)]">Standard</span>
                      ),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    cell: (row) => (
                      <AdminActionGroup>
                        <AdminActionIconButton
                          label="Edit product"
                          title="Edit"
                          icon={faPenToSquare}
                          onClick={() => void openEditEditor(row.id)}
                        />
                        <AdminActionIconButton
                          label={row.availabilityStatus === "unavailable" ? "Make product available" : "Mark product unavailable"}
                          title={row.availabilityStatus === "unavailable" ? "Make Available" : "Mark Unavailable"}
                          icon={row.availabilityStatus === "unavailable" ? faCircleCheck : faBan}
                          tone={row.availabilityStatus === "unavailable" ? "success" : "secondary"}
                          onClick={() => void handleAvailabilityToggle(row)}
                        />
                        <AdminActionIconButton
                          label="Delete product"
                          title="Delete"
                          icon={faTrashCan}
                          tone="danger"
                          onClick={() => setDeleteTarget(row)}
                        />
                      </AdminActionGroup>
                    ),
                  },
                ]}
              />
            )}
          </section>

          {isEditorOpen ? (
            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-5 sm:px-6">
              <button
                type="button"
                className="absolute inset-0 bg-[var(--vf-backdrop)]/80 backdrop-blur-sm"
                aria-label="Close product editor"
                onClick={() => {
                  if (!isSubmitting && !isEditorLoading) {
                    closeEditor();
                  }
                }}
              />
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-editor-title"
                className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-float)]"
              >
                <div className="flex flex-col gap-4 border-b border-[var(--vf-border-soft)] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">
                  {editorMode === "edit" ? "Edit Product" : "New Product"}
                </p>
                <h2 id="product-editor-title" className="heading-display mt-2 text-3xl font-bold text-[var(--vf-text)]">
                  {editorMode === "edit" ? "Update product details" : "Create a product"}
                </h2>
                <p className="mt-2 text-sm leading-7 text-soft">
                  Product prices are stored in USD and each variant carries its own backend identity for later server-side checkout validation.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <div className="rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] px-4 py-2 text-xs font-medium text-[var(--vf-text-soft)]">
                  {lastSavedAt ? `Last updated ${new Date(lastSavedAt).toLocaleString("en-US")}` : "Not saved yet"}
                </div>
                {editorMode === "edit" ? (
                  <button type="button" className="btn-ghost rounded-full px-5" onClick={() => openCreateEditor()}>
                    Create New Instead
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn-ghost rounded-full px-5"
                  onClick={() => closeEditor()}
                  disabled={isSubmitting || isEditorLoading || isImageUploading}
                >
                  Close
                </button>
              </div>
            </div>

                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  {isEditorLoading ? (
              <div className="rounded-[var(--vf-radius-md)] bg-[var(--vf-surface)] p-4 text-sm text-soft">
                Loading product details...
              </div>
            ) : null}

            <form onSubmit={submit} className="space-y-5">
              <Field label="Product Name" error={form.formState.errors.name?.message}>
                <>
                  <input className="field" {...form.register("name")} placeholder="Signature Jollof Rice" />
                  <input type="hidden" {...form.register("slug")} />
                </>
              </Field>

              <p className="text-sm text-soft">Slug is generated automatically from the product name.</p>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Category" error={form.formState.errors.categoryId?.message}>
                  <select className="select-field" {...form.register("categoryId")} disabled={categoriesLoading || !canCreateProducts}>
                    <option value="">{categoriesLoading ? "Loading categories..." : "Select category"}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Product Type" error={form.formState.errors.productType?.message}>
                  <select className="select-field" {...form.register("productType")}>
                    {productTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Short Description" error={form.formState.errors.shortDescription?.message}>
                <textarea
                  className="textarea-field"
                  rows={3}
                  {...form.register("shortDescription")}
                  placeholder="Signature smoky jollof rice prepared with house spices."
                />
              </Field>

              <Field label="Full Description" error={form.formState.errors.description?.message}>
                <textarea
                  className="textarea-field"
                  rows={5}
                  {...form.register("description")}
                  placeholder="A detailed product description for the product detail page."
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Base Price (USD)" error={form.formState.errors.basePrice?.message}>
                  <input className="field" {...form.register("basePrice")} inputMode="decimal" placeholder="25.00" />
                </Field>

                <Field label="Sale Price (USD)" error={form.formState.errors.salePrice?.message}>
                  <input className="field" {...form.register("salePrice")} inputMode="decimal" placeholder="20.00" />
                </Field>

                <Field label="Serving Size" error={form.formState.errors.servingSize?.message}>
                  <input className="field" {...form.register("servingSize")} placeholder="Small bowl" />
                </Field>

                <Field label="Preparation Time (mins)" error={form.formState.errors.preparationTimeMinutes?.message}>
                  <input className="field" {...form.register("preparationTimeMinutes")} inputMode="numeric" placeholder="45" />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Publication Status" error={form.formState.errors.status?.message}>
                  <select className="select-field" {...form.register("status")}>
                    {publicationStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Availability" error={form.formState.errors.availabilityStatus?.message}>
                  <select className="select-field" {...form.register("availabilityStatus")}>
                    {availabilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {titleCase(option.label)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Sort Order" error={form.formState.errors.sortOrder?.message}>
                  <input className="field" {...form.register("sortOrder")} inputMode="numeric" placeholder="0" />
                </Field>

                <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                  <p className="text-sm font-semibold text-[var(--vf-text)]">Currency</p>
                  <p className="mt-2 text-sm text-soft">USD is fixed for this phase. Prices are formatted publicly through the shared currency utility.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--vf-primary)]" {...form.register("featured")} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--vf-text)]">Featured Product</p>
                    <p className="mt-1 text-sm text-soft">Featured items can be highlighted across the public experience and future homepage merchandising.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--vf-primary)]" {...form.register("availableForOrder")} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--vf-text)]">Available For Order</p>
                    <p className="mt-1 text-sm text-soft">Turn this off when you want the product saved but hidden from active ordering flows.</p>
                  </div>
                </label>
              </div>

              <Field label="Ordering Notes" error={form.formState.errors.orderingNotes?.message}>
                <textarea
                  className="textarea-field"
                  rows={4}
                  {...form.register("orderingNotes")}
                  placeholder="Add useful ordering guidance, lead time notes, or service reminders."
                />
              </Field>

              <Field label="Product Image" error={form.formState.errors.primaryMediaId?.message}>
                <>
                  <input type="hidden" {...form.register("primaryMediaId")} />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="field min-w-0 cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-[var(--vf-primary-light)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--vf-primary)]"
                    disabled={isImageUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      void handleImageUpload(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </>
              </Field>

              <p className="text-sm text-soft">
                {isImageUploading
                  ? "Uploading image..."
                  : galleryAssets.length > 0
                    ? "Image uploaded. Save the product to keep it."
                    : "Upload a product image, then save the product."}
              </p>

              <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--vf-text)]">Product variants</p>
                    <p className="mt-1 text-sm text-soft">
                      Variants carry real backend IDs and prices so the cart can distinguish product + variant combinations safely.
                    </p>
                  </div>
                  <button type="button" className="btn-secondary rounded-full px-5" onClick={appendVariant}>
                    <span className="material-symbols-rounded text-base">add</span>
                    Add Variant
                  </button>
                </div>

                {typeof form.formState.errors.variants?.message === "string" ? (
                  <p className="mt-3 text-sm text-[var(--vf-danger)]">{form.formState.errors.variants.message}</p>
                ) : null}

                <div className="mt-4 space-y-4">
                  {variantsFieldArray.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[var(--vf-text)]">
                            Variant {index + 1}
                            {form.watch(`variants.${index}.variantId`) ? ` | ID ${form.watch(`variants.${index}.variantId`)}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-[var(--vf-text-soft)]">
                            One option should remain default so direct product links and cards have a stable starting price.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={form.watch(`variants.${index}.isDefault`) ? "btn-primary rounded-full px-4 py-2 text-xs" : "btn-ghost rounded-full px-4 py-2 text-xs"}
                            onClick={() => setDefaultVariant(index)}
                          >
                            {form.watch(`variants.${index}.isDefault`) ? "Default Variant" : "Make Default"}
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-[var(--vf-danger)]/25 px-4 py-2 text-xs font-semibold text-[var(--vf-danger)] transition-colors hover:bg-[var(--vf-danger-soft)]"
                            onClick={() => removeVariant(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Variant Name" error={form.formState.errors.variants?.[index]?.name?.message}>
                          <input className="field" {...form.register(`variants.${index}.name`)} placeholder="Small" />
                        </Field>

                        <Field label="Serving Label" error={form.formState.errors.variants?.[index]?.portionLabel?.message}>
                          <input className="field" {...form.register(`variants.${index}.portionLabel`)} placeholder="Small bowl" />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Field label="Price (USD)" error={form.formState.errors.variants?.[index]?.price?.message}>
                          <input className="field" {...form.register(`variants.${index}.price`)} inputMode="decimal" placeholder="25.00" />
                        </Field>

                        <Field label="Sale Price (USD)" error={form.formState.errors.variants?.[index]?.salePrice?.message}>
                          <input className="field" {...form.register(`variants.${index}.salePrice`)} inputMode="decimal" placeholder="20.00" />
                        </Field>

                        <Field label="Availability" error={form.formState.errors.variants?.[index]?.availabilityStatus?.message}>
                          <select className="select-field" {...form.register(`variants.${index}.availabilityStatus`)}>
                            {availabilityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {titleCase(option.label)}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Sort Order" error={form.formState.errors.variants?.[index]?.sortOrder?.message}>
                          <input className="field" {...form.register(`variants.${index}.sortOrder`)} inputMode="numeric" placeholder={String(index)} />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="SKU" error={form.formState.errors.variants?.[index]?.sku?.message}>
                          <input className="field" {...form.register(`variants.${index}.sku`)} placeholder="VF-JOLLOF-SM" />
                        </Field>

                        <Field label="Variant Notes" error={form.formState.errors.variants?.[index]?.description?.message}>
                          <textarea
                            className="textarea-field"
                            rows={3}
                            {...form.register(`variants.${index}.description`)}
                            placeholder="Optional detail about the serving or packaging."
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="btn-primary w-full sm:w-auto"
                  disabled={isSubmitting || isEditorLoading || isImageUploading || !canCreateProducts}
                >
                  {isSubmitting ? "Saving..." : editorMode === "edit" ? "Save Product" : "Create Product"}
                </button>
                <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => { if (editorMode === "edit" && selectedProductId !== null) { void openEditEditor(selectedProductId); } else { openCreateEditor(); } }} disabled={isSubmitting || isEditorLoading || isImageUploading}>
                  Reset Form
                </button>
                <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => closeEditor()} disabled={isSubmitting || isEditorLoading || isImageUploading}>
                  Cancel
                </button>
              </div>
            </form>
                </div>
              </section>
            </div>
          ) : null}
        </div>
      )}


      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--vf-backdrop)] backdrop-blur-sm"
            aria-label="Close delete product dialog"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-float)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-danger)]">Confirm Delete</p>
            <h2 className="heading-display mt-3 text-3xl font-bold text-[var(--vf-text)]">
              Delete {deleteTarget.name}?
            </h2>
            <p className="mt-3 text-sm leading-7 text-soft">
              Products already referenced by historical orders are protected. If this item has existing transactions, the API will block deletion and you should archive or deactivate it instead.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-full bg-[var(--vf-danger)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-95"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Product"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function createSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function createBlankVariant(index: number, isDefault = false): ProductFormValues["variants"][number] {
  return {
    variantId: "",
    name: "",
    sku: "",
    portionLabel: "",
    description: "",
    price: "",
    salePrice: "",
    availabilityStatus: "available",
    isDefault,
    sortOrder: String(index),
  };
}

function createBlankProductFormValues(sortOrder = 0): ProductFormValues {
  return {
    name: "",
    slug: "",
    categoryId: "",
    productType: "menu_item",
    shortDescription: "",
    description: "",
    basePrice: "",
    salePrice: "",
    servingSize: "",
    status: "published",
    availabilityStatus: "available",
    featured: false,
    availableForOrder: true,
    preparationTimeMinutes: "",
    sortOrder: String(sortOrder),
    orderingNotes: "",
    primaryMediaId: "",
    variants: [createBlankVariant(0, true)],
  };
}

function getNextProductSortOrder(products: Product[]) {
  const highest = products.reduce((max, product) => Math.max(max, product.sortOrder), -1);
  return highest + 1;
}

function toProductFormValues(product: Product): ProductFormValues {
  const variants = product.variants.length > 0 ? product.variants : [product.defaultVariant].filter(Boolean);

  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId ? String(product.categoryId) : "",
    productType: product.productType as ProductFormValues["productType"],
    shortDescription: product.shortDescription,
    description: product.description,
    basePrice: String(product.basePrice),
    salePrice: product.salePrice !== null ? String(product.salePrice) : "",
    servingSize: product.servingSize,
    status: product.status as ProductFormValues["status"],
    availabilityStatus: product.availabilityStatus as ProductFormValues["availabilityStatus"],
    featured: product.featured,
    availableForOrder: product.availableForOrder,
    preparationTimeMinutes:
      product.preparationTimeMinutes !== null ? String(product.preparationTimeMinutes) : "",
    sortOrder: String(product.sortOrder),
    orderingNotes: product.orderingNotes ?? "",
    primaryMediaId: product.primaryImage?.id ? String(product.primaryImage.id) : "",
    variants: variants.map((variant, index) => ({
      variantId: variant?.id ? String(variant.id) : "",
      name: variant?.name ?? "",
      sku: variant?.sku ?? "",
      portionLabel: variant?.portionLabel ?? "",
      description: variant?.description ?? "",
      price: variant ? String(variant.basePrice) : "",
      salePrice: variant?.salePrice !== null && variant?.salePrice !== undefined ? String(variant.salePrice) : "",
      availabilityStatus: (variant?.availabilityStatus ?? "available") as ProductFormValues["variants"][number]["availabilityStatus"],
      isDefault: Boolean(variant?.isDefault ?? index === 0),
      sortOrder: variant?.sortOrder !== undefined ? String(variant.sortOrder) : String(index),
    })),
  };
}

function toProductPayload(values: ProductFormValues, galleryAssets: MediaAsset[]): ProductInput {
  const primaryMediaId = values.primaryMediaId ? Number(values.primaryMediaId) : null;

  return {
    categoryId: Number(values.categoryId),
    productType: values.productType,
    name: values.name,
    slug: createSlug(values.name) || undefined,
    shortDescription: values.shortDescription || undefined,
    description: values.description || undefined,
    basePrice: Number(values.basePrice),
    salePrice: values.salePrice === "" ? null : Number(values.salePrice),
    servingSize: values.servingSize || undefined,
    status: values.status,
    availabilityStatus: values.availabilityStatus,
    featured: values.featured,
    availableForOrder: values.availableForOrder,
    preparationTimeMinutes: values.preparationTimeMinutes === "" ? null : Number(values.preparationTimeMinutes),
    sortOrder: values.sortOrder === "" ? 0 : Number(values.sortOrder),
    orderingNotes: values.orderingNotes || undefined,
    primaryMediaId,
    mediaIds: galleryAssets.map((asset) => asset.id),
    variants: values.variants.map((variant, index) => ({
      id: variant.variantId ? Number(variant.variantId) : undefined,
      name: variant.name,
      sku: variant.sku || undefined,
      portionLabel: variant.portionLabel || undefined,
      description: variant.description || undefined,
      price: Number(variant.price),
      salePrice: variant.salePrice === "" ? null : Number(variant.salePrice),
      availabilityStatus: variant.availabilityStatus,
      isDefault: variant.isDefault,
      sortOrder: variant.sortOrder === "" ? index : Number(variant.sortOrder),
    })),
  };
}

function mapProductServerErrors(error: unknown, form: UseFormReturn<ProductFormValues>) {
  if (!isApiError(error) || !error.errors) {
    return;
  }

  Object.entries(error.errors).forEach(([field, messages]) => {
    const message = messages[0];

    if (!message) {
      return;
    }

    form.setError(toFieldPath(field) as never, {
      type: "server",
      message,
    });
  });
}

function toFieldPath(field: string): string {
  return field
    .replace(/^slug$/, "name")
    .replace(/^category_id$/, "categoryId")
    .replace(/^product_type$/, "productType")
    .replace(/^short_description$/, "shortDescription")
    .replace(/^base_price$/, "basePrice")
    .replace(/^compare_price$/, "salePrice")
    .replace(/^serving_size$/, "servingSize")
    .replace(/^availability_status$/, "availabilityStatus")
    .replace(/^available_for_order$/, "availableForOrder")
    .replace(/^preparation_time_minutes$/, "preparationTimeMinutes")
    .replace(/^sort_order$/, "sortOrder")
    .replace(/^ordering_notes$/, "orderingNotes")
    .replace(/^primary_media_id$/, "primaryMediaId")
    .replace(/^variants\.(\d+)\.id$/, "variants.$1.variantId")
    .replace(/^variants\.(\d+)\.portion_label$/, "variants.$1.portionLabel")
    .replace(/^variants\.(\d+)\.compare_price$/, "variants.$1.salePrice")
    .replace(/^variants\.(\d+)\.availability_status$/, "variants.$1.availabilityStatus")
    .replace(/^variants\.(\d+)\.sort_order$/, "variants.$1.sortOrder");
}

function getPublicationTone(status: string) {
  if (status === "published") {
    return "success" as const;
  }

  if (status === "archived") {
    return "danger" as const;
  }

  return "neutral" as const;
}

function formatProductType(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}


function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-sm text-[var(--vf-danger)]">{error}</span> : null}
    </label>
  );
}












