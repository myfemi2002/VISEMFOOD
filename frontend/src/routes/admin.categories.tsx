import { zodResolver } from "@hookform/resolvers/zod";
import { faBan, faCircleCheck, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AdminActionGroup, AdminActionIconButton } from "@/components/admin/AdminActionIconButton";
import { DataTable } from "@/components/DataTable";
import { SearchField } from "@/components/SearchField";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { useSiteData } from "@/contexts/site-data-context";
import { getErrorMessage, isApiError } from "@/lib/api";
import { buildMeta } from "@/lib/meta";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  fetchAdminCategory,
  updateAdminCategory,
  updateAdminCategoryStatus,
  uploadAdminMediaAsset,
  type Category,
  type CategoryInput,
  type MediaAsset,
} from "@/lib/visemfood-api";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required.").max(120, "Category name is too long."),
  slug: z.string().trim().max(150, "Slug is too long."),
  description: z.string().trim().max(5000, "Description is too long."),
  status: z.enum(["active", "inactive"]),
  sortOrder: z.number().int("Sort order must be a whole number.").min(0, "Sort order cannot be negative."),
  imageMediaId: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), "Media asset ID must be numeric."),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export const Route = createFileRoute("/admin/categories")({
  head: () =>
    buildMeta({
      title: "Categories | VISEMFOOD Admin",
      description: "Manage live menu categories, activation, order, and category visibility across the public menu.",
    }),
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const { refresh: refreshSiteData } = useSiteData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilterOptions)[number]["value"]>("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [selectedImageAsset, setSelectedImageAsset] = useState<MediaAsset | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: createBlankFormValues(0),
  });
  const watchedName = form.watch("name");

  useEffect(() => {
    const nextSlug = createSlug(watchedName);

    if (form.getValues("slug") !== nextSlug) {
      form.setValue("slug", nextSlug);
    }
  }, [form, watchedName]);

  const isSubmitting = form.formState.isSubmitting;
  const activeCount = useMemo(() => categories.filter((category) => category.status === "active").length, [categories]);
  const inactiveCount = useMemo(() => categories.filter((category) => category.status === "inactive").length, [categories]);
  const blockingError = loadError && !isLoading && categories.length === 0;
  const inlineError = loadError && categories.length > 0;

  async function loadCategories() {
    setIsLoading(true);

    try {
      const result = await fetchAdminCategories({
        search: deferredSearch.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        perPage: 100,
      });
      setCategories(result.items);
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, "Unable to load categories right now."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, [deferredSearch, statusFilter]);

  function openCreateEditor(nextSortOrder = getNextSortOrder(categories)) {
    setIsEditorOpen(true);
    setEditorMode("create");
    setSelectedCategoryId(null);
    setSelectedImageAsset(null);
    setLastSavedAt(null);
    setIsEditorLoading(false);
    form.reset(createBlankFormValues(nextSortOrder));
  }

  async function openEditEditor(categoryId: string) {
    setIsEditorOpen(true);
    setIsEditorLoading(true);

    try {
      const category = await fetchAdminCategory(categoryId);
      setEditorMode("edit");
      setSelectedCategoryId(category.id);
      setSelectedImageAsset(category.image);
      setLastSavedAt(category.updatedAt);
      form.reset(toFormValues(category));
    } catch (error) {
      closeEditor();
      toast.error("Unable to load category", {
        description: getErrorMessage(error, "The category could not be loaded for editing."),
      });
    } finally {
      setIsEditorLoading(false);
    }
  }

  function closeEditor(nextSortOrder = getNextSortOrder(categories)) {
    setIsEditorOpen(false);
    setEditorMode("create");
    setSelectedCategoryId(null);
    setSelectedImageAsset(null);
    setLastSavedAt(null);
    setIsEditorLoading(false);
    form.reset(createBlankFormValues(nextSortOrder));
  }

  async function refreshAfterMutation() {
    await loadCategories();
    await refreshSiteData();
  }

  async function handleImageUpload(file: File | null) {
    if (!file) {
      return;
    }

    setIsImageUploading(true);

    try {
      const result = await uploadAdminMediaAsset(file, {
        spec: "category",
        altText: form.getValues("name").trim() || file.name,
      });

      setSelectedImageAsset(result.asset);
      form.setValue("imageMediaId", String(result.asset.id), {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast.success("Image uploaded", {
        description: result.message,
      });
    } catch (error) {
      toast.error("Unable to upload image", {
        description: getErrorMessage(error, "Please review the file and try again."),
      });
    } finally {
      setIsImageUploading(false);
    }
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      const payload = toCategoryPayload(values);
      const result =
        editorMode === "edit" && selectedCategoryId
          ? await updateAdminCategory(selectedCategoryId, payload)
          : await createAdminCategory(payload);

      await refreshAfterMutation();

      if (editorMode === "edit") {
        closeEditor();
      } else {
        closeEditor(getNextSortOrder([...categories, result.category]));
      }

      toast.success(editorMode === "edit" ? "Category updated" : "Category created", {
        description: result.message,
      });
    } catch (error) {
      mapCategoryServerErrors(error, form);
      toast.error(editorMode === "edit" ? "Unable to update category" : "Unable to create category", {
        description: getErrorMessage(error, "Please review the form and try again."),
      });
    }
  });

  async function handleStatusToggle(category: Category) {
    const nextStatus = category.status === "active" ? "inactive" : "active";

    try {
      const result = await updateAdminCategoryStatus(category, nextStatus);
      await refreshAfterMutation();

      if (selectedCategoryId === category.id) {
        form.setValue("status", result.category.status);
        setLastSavedAt(result.category.updatedAt ?? new Date().toISOString());
      }

      toast.success(nextStatus === "active" ? "Category reactivated" : "Category deactivated", {
        description: result.message,
      });
    } catch (error) {
      toast.error("Unable to change category status", {
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
      const message = await deleteAdminCategory(deleteTarget.id);
      await refreshAfterMutation();

      if (selectedCategoryId === deleteTarget.id) {
        closeEditor();
      }

      setDeleteTarget(null);
      toast.success("Category deleted", {
        description: message,
      });
    } catch (error) {
      setDeleteTarget(null);
      toast.error("Unable to delete category", {
        description: getErrorMessage(error, "Please try again."),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-soft)] sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeading
            title="Category management"
            body="Create, order, activate, and retire real menu categories that power the public VISEMFOOD experience."
            as="h1"
          />

          <div className="flex flex-wrap gap-3">
            <StatusChip tone="olive">{categories.length} loaded</StatusChip>
            <StatusChip tone="success">{activeCount} active</StatusChip>
            <StatusChip tone="neutral">{inactiveCount} inactive</StatusChip>
            <button
              type="button"
              className="btn-primary w-full rounded-full px-6 sm:w-auto"
              onClick={() => openCreateEditor()}
              disabled={isSubmitting || isEditorLoading}
            >
              <span className="material-symbols-rounded text-base">add</span>
              Add Category
            </button>
          </div>
        </div>
      </div>

      {inlineError ? (
        <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{loadError}</p>
            <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => void loadCategories()}>
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {blockingError ? (
        <div className="card-surface max-w-3xl p-8 text-center sm:mx-auto sm:p-10">
          <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Unable to load categories</h2>
          <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
            {loadError ?? "The live category manager is temporarily unavailable."}
          </p>
          <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={() => void loadCategories()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="space-y-4 xl:col-span-12">
            <div className="card-surface space-y-4 p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
                <SearchField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search category names, slugs, or descriptions"
                  ariaLabel="Search categories"
                />

                <label className="relative block">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as (typeof statusFilterOptions)[number]["value"])}
                    className="select-field appearance-none pr-12"
                    aria-label="Filter categories by status"
                  >
                    {statusFilterOptions.map((option) => (
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
                    setStatusFilter("all");
                  }}
                >
                  <span className="material-symbols-rounded text-base">refresh</span>
                  Reset
                </button>
              </div>

              <p className="text-sm text-soft">
                Public guests receive only active categories, ordered by sort order, and products in inactive categories disappear from the public menu automatically.
              </p>
            </div>

            {isLoading && categories.length === 0 ? (
              <div className="card-surface p-6 text-sm text-soft">Loading live categories...</div>
            ) : categories.length === 0 ? (
              <div className="card-surface p-8 text-center sm:p-10">
                <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">No categories yet</h2>
                <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                  No categories have been created yet. Add the first collection to power public menu filters and catalog organization.
                </p>
                <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={() => openCreateEditor()}>
                  Create First Category
                </button>
              </div>
            ) : (
              <DataTable
                rows={categories}
                columns={[
                  {
                    key: "name",
                    header: "Category",
                    cell: (row) => (
                      <div className="flex items-center gap-3">
                        {row.imageUrl ? (
                          <img
                            src={row.imageUrl}
                            alt={row.name}
                            className="h-12 w-12 rounded-[var(--vf-radius-sm)] object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--vf-radius-sm)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] text-[var(--vf-primary)]">
                            <span className="material-symbols-rounded text-xl">category</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--vf-text)]">{row.name}</p>
                          <p className="truncate text-xs uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">{row.slug}</p>
                          {row.description ? <p className="mt-1 text-xs text-soft">{row.description}</p> : null}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "products",
                    header: "Products",
                    cell: (row) => <span className="text-sm font-medium text-[var(--vf-text)]">{row.productsCount}</span>,
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (row) => <StatusChip tone={row.status === "active" ? "success" : "neutral"}>{titleCase(row.status)}</StatusChip>,
                  },
                  {
                    key: "sortOrder",
                    header: "Order",
                    cell: (row) => <span className="text-sm text-[var(--vf-text)]">{row.sortOrder}</span>,
                  },
                  {
                    key: "updatedAt",
                    header: "Updated",
                    cell: (row) => <span className="text-sm text-soft">{formatDateTime(row.updatedAt)}</span>,
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    cell: (row) => (
                      <AdminActionGroup>
                        <AdminActionIconButton
                          label="Edit category"
                          title="Edit"
                          icon={faPenToSquare}
                          onClick={() => void openEditEditor(row.id)}
                        />
                        <AdminActionIconButton
                          label={row.status === "active" ? "Deactivate category" : "Activate category"}
                          title={row.status === "active" ? "Deactivate" : "Activate"}
                          icon={row.status === "active" ? faBan : faCircleCheck}
                          tone={row.status === "active" ? "secondary" : "success"}
                          onClick={() => void handleStatusToggle(row)}
                        />
                        <AdminActionIconButton
                          label="Delete category"
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
        </div>
      )}

      {isEditorOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-5 sm:px-6">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--vf-backdrop)]/80 backdrop-blur-sm"
            aria-label="Close category editor"
            onClick={() => {
              if (!isSubmitting && !isEditorLoading && !isImageUploading) {
                closeEditor();
              }
            }}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-editor-title"
            className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-float)]"
          >
            <div className="flex flex-col gap-4 border-b border-[var(--vf-border-soft)] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">
                    {editorMode === "edit" ? "Edit Category" : "New Category"}
                  </p>
                  <h2 id="category-editor-title" className="heading-display mt-2 text-3xl font-bold text-[var(--vf-text)]">
                    {editorMode === "edit" ? "Update category details" : "Create a category"}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-soft">
                    Slugs stay stable unless you explicitly change them, and active categories appear publicly in the menu filters.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] px-4 py-2 text-xs font-medium text-[var(--vf-text-soft)]">
                    {lastSavedAt ? `Last updated ${new Date(lastSavedAt).toLocaleString("en-US")}` : "Not saved yet"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editorMode === "edit" ? (
                      <button type="button" className="btn-ghost rounded-full px-5" onClick={() => openCreateEditor()}>
                        Create New Instead
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn-ghost w-full rounded-full px-5 sm:w-auto"
                      onClick={() => closeEditor()}
                      disabled={isSubmitting || isEditorLoading || isImageUploading}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {isEditorLoading ? <div className="rounded-[var(--vf-radius-md)] bg-[var(--vf-surface)] p-4 text-sm text-soft">Loading category details...</div> : null}

              <form onSubmit={submit} className="space-y-5">
                <Field label="Name" error={form.formState.errors.name?.message}>
                  <>
                    <input className="field" {...form.register("name")} placeholder="Rice Dishes" />
                    <input type="hidden" {...form.register("slug")} />
                  </>
                </Field>

                <p className="text-sm text-soft">Slug is generated automatically from the category name.</p>


                <Field label="Description" error={form.formState.errors.description?.message}>
                  <textarea
                    className="textarea-field"
                    rows={4}
                    {...form.register("description")}
                    placeholder="Traditional and signature rice dishes."
                  />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Status" error={form.formState.errors.status?.message}>
                    <select className="select-field" {...form.register("status")}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </Field>

                  <Field label="Sort Order" error={form.formState.errors.sortOrder?.message}>
                    <input className="field" type="number" min={0} step={1} {...form.register("sortOrder", { valueAsNumber: true })} />
                  </Field>
                </div>

                <Field label="Category Image" error={form.formState.errors.imageMediaId?.message}>
                  <>
                    <input type="hidden" {...form.register("imageMediaId")} />
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
                    : selectedImageAsset
                      ? "Image uploaded. Save the category to keep it."
                      : "Upload an image, then save the category."}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      className="btn-ghost w-full sm:w-auto"
                      onClick={() => {
                        if (editorMode === "edit" && selectedCategoryId) {
                          void openEditEditor(selectedCategoryId);
                        } else {
                          openCreateEditor();
                        }
                      }}
                      disabled={isSubmitting || isEditorLoading || isImageUploading}
                    >
                      Reset Form
                    </button>
                    <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => closeEditor()} disabled={isSubmitting || isEditorLoading || isImageUploading}>
                      Cancel
                    </button>
                  </div>

                  <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting || isEditorLoading || isImageUploading}>
                    {isSubmitting ? "Saving..." : editorMode === "edit" ? "Save Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      ) : null}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--vf-backdrop)] backdrop-blur-sm"
            aria-label="Close delete category dialog"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-float)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-danger)]">Confirm Delete</p>
            <h2 className="heading-display mt-3 text-3xl font-bold text-[var(--vf-text)]">
              Delete {deleteTarget.name}?
            </h2>
            <p className="mt-3 text-sm leading-7 text-soft">
              Categories with attached products are protected and cannot be deleted. If this category is still in use, the API will block deletion and ask you to deactivate it instead.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-full bg-[var(--vf-danger)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-95"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Category"}
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
    .slice(0, 150);
}

function createBlankFormValues(sortOrder: number): CategoryFormValues {
  return {
    name: "",
    slug: "",
    description: "",
    status: "active",
    sortOrder,
    imageMediaId: "",
  };
}

function getNextSortOrder(categories: Category[]) {
  const highest = categories.reduce((max, category) => Math.max(max, category.sortOrder), -1);
  return highest + 1;
}

function toFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    status: category.status,
    sortOrder: category.sortOrder,
    imageMediaId: category.imageMediaId ? String(category.imageMediaId) : "",
  };
}

function toCategoryPayload(values: CategoryFormValues): CategoryInput {
  return {
    name: values.name,
    slug: createSlug(values.name) || undefined,
    description: values.description || undefined,
    status: values.status,
    sortOrder: values.sortOrder,
    imageMediaId: values.imageMediaId ? Number(values.imageMediaId) : null,
  };
}

function toFieldPath(field: string): string {
  return field
    .replace(/^slug$/, "name")
    .replace(/^sort_order$/, "sortOrder")
    .replace(/^image_media_id$/, "imageMediaId");
}

function mapCategoryServerErrors(error: unknown, form: UseFormReturn<CategoryFormValues>) {
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

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("en-US") : "Not updated";
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

















