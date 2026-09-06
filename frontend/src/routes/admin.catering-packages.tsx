import { zodResolver } from "@hookform/resolvers/zod";
import { faBan, faCircleCheck, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AdminActionGroup, AdminActionIconButton } from "@/components/admin/AdminActionIconButton";
import { MediaLibraryDialog } from "@/components/admin/MediaLibraryDialog";
import { useAdminMediaSpecs } from "@/components/admin/useAdminMediaSpecs";
import { DataTable } from "@/components/DataTable";
import { SearchField } from "@/components/SearchField";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { getErrorMessage, isApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { formatFileSize, getMediaAltText, getMediaVariantUrl } from "@/lib/media";
import { buildMeta } from "@/lib/meta";
import {
  createAdminCateringPackage,
  deleteAdminCateringPackage,
  fetchAdminCateringPackage,
  fetchAdminCateringPackages,
  updateAdminCateringPackage,
  type CateringPackage,
  type CateringPackageInput,
  type MediaAsset,
} from "@/lib/visemfood-api";

const numericPattern = /^\d+(\.\d{1,2})?$/;
const integerPattern = /^\d+$/;
const statusFilterOptions = ["all", "active", "inactive"] as const;
const featuredFilterOptions = ["all", "featured", "standard"] as const;

const packageSchema = z
  .object({
    name: z.string().trim().min(2, "Package name is required.").max(150, "Package name is too long."),
    slug: z.string().trim().max(180, "Slug is too long."),
    shortDescription: z.string().trim().max(255, "Short description is too long."),
    description: z.string().trim().max(10000, "Description is too long."),
    startingPrice: z.string().trim().regex(numericPattern, "Starting price must be a valid amount."),
    minimumGuests: z.string().trim().regex(integerPattern, "Minimum guests must be a whole number."),
    maximumGuests: z.string().trim().refine((value) => value === "" || integerPattern.test(value), "Maximum guests must be a whole number."),
    inclusionsText: z.string().trim().max(4000, "Inclusions are too long."),
    status: z.enum(["active", "inactive"]),
    featured: z.boolean(),
    sortOrder: z.string().trim().refine((value) => value === "" || integerPattern.test(value), "Sort order must be a whole number."),
    imageMediaId: z.string().trim().refine((value) => value === "" || /^\d+$/.test(value), "Media asset ID must be numeric."),
  })
  .superRefine((values, context) => {
    const minimumGuests = Number(values.minimumGuests);
    const maximumGuests = values.maximumGuests === "" ? null : Number(values.maximumGuests);

    if (minimumGuests < 1) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["minimumGuests"], message: "Minimum guests must be at least 1." });
    }

    if (maximumGuests !== null && maximumGuests < minimumGuests) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["maximumGuests"], message: "Maximum guests cannot be lower than minimum guests." });
    }
  });

type PackageFormValues = z.infer<typeof packageSchema>;

export const Route = createFileRoute("/admin/catering-packages")({
  head: () => buildMeta({ title: "Catering Packages | VISEMFOOD Admin", description: "Manage live catering packages for the public Catering page." }),
  component: AdminCateringPackagesPage,
});

function AdminCateringPackagesPage() {
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilterOptions)[number]>("all");
  const [featuredFilter, setFeaturedFilter] = useState<(typeof featuredFilterOptions)[number]>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [selectedImageAsset, setSelectedImageAsset] = useState<MediaAsset | null>(null);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CateringPackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const { specs, specError, isLoadingSpecs } = useAdminMediaSpecs();
  const cateringSpec = specs.catering ?? null;

  const form = useForm<PackageFormValues>({ resolver: zodResolver(packageSchema), defaultValues: blankValues(0) });
  const watchedName = form.watch("name");
  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    const nextSlug = createSlug(watchedName);
    if (form.getValues("slug") !== nextSlug) {
      form.setValue("slug", nextSlug);
    }
  }, [form, watchedName]);

  useEffect(() => {
    void loadPackages();
  }, [deferredSearch, featuredFilter, statusFilter]);

  const activeCount = useMemo(() => packages.filter((item) => item.status === "active").length, [packages]);
  const featuredCount = useMemo(() => packages.filter((item) => item.featured).length, [packages]);
  const blockingError = loadError && !isLoading && packages.length === 0;
  const inlineError = loadError && packages.length > 0;

  async function loadPackages() {
    setIsLoading(true);
    try {
      const result = await fetchAdminCateringPackages({
        search: deferredSearch.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        featured: featuredFilter === "all" ? undefined : featuredFilter === "featured",
        perPage: 100,
      });
      setPackages(result.items);
      setLoadError(null);
    } catch (error) {
      setPackages([]);
      setLoadError(getErrorMessage(error, "Unable to load catering packages right now."));
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateEditor() {
    setIsEditorOpen(true);
    setEditorMode("create");
    setSelectedPackageId(null);
    setSelectedImageAsset(null);
    setLastSavedAt(null);
    setIsEditorLoading(false);
    form.reset(blankValues(getNextSortOrder(packages)));
  }

  async function openEditEditor(packageId: number) {
    setIsEditorOpen(true);
    setIsEditorLoading(true);
    try {
      const cateringPackage = await fetchAdminCateringPackage(packageId);
      setEditorMode("edit");
      setSelectedPackageId(cateringPackage.id);
      setSelectedImageAsset(cateringPackage.image);
      setLastSavedAt(cateringPackage.updatedAt);
      form.reset(toFormValues(cateringPackage));
    } catch (error) {
      closeEditor();
      toast.error("Unable to load package", { description: getErrorMessage(error, "The package could not be loaded for editing.") });
    } finally {
      setIsEditorLoading(false);
    }
  }

  function closeEditor(nextSortOrder = getNextSortOrder(packages)) {
    setIsEditorOpen(false);
    setEditorMode("create");
    setSelectedPackageId(null);
    setSelectedImageAsset(null);
    setLastSavedAt(null);
    setIsEditorLoading(false);
    form.reset(blankValues(nextSortOrder));
  }


  const submit = form.handleSubmit(async (values) => {
    try {
      const payload = toPayload(values);
      const result = editorMode === "edit" && selectedPackageId ? await updateAdminCateringPackage(selectedPackageId, payload) : await createAdminCateringPackage(payload);
      await loadPackages();

      if (editorMode === "edit") {
        closeEditor();
      } else {
        closeEditor(getNextSortOrder([...packages, result.cateringPackage]));
      }

      toast.success(editorMode === "edit" ? "Catering package updated" : "Catering package created", {
        description: result.message,
      });
    } catch (error) {
      if (isApiError(error) && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (!messages[0]) {
            return;
          }

          form.setError(toFieldPath(field) as never, {
            type: "server",
            message: messages[0],
          });
        });
      }

      toast.error(editorMode === "edit" ? "Unable to update package" : "Unable to create package", {
        description: getErrorMessage(error, "Please review the form and try again."),
      });
    }
  });

  async function toggleStatus(cateringPackage: CateringPackage) {
    const nextStatus = cateringPackage.status === "active" ? "inactive" : "active";

    try {
      const result = await updateAdminCateringPackage(cateringPackage.id, {
        ...packageToInput(cateringPackage),
        status: nextStatus,
      });
      await loadPackages();

      if (selectedPackageId === cateringPackage.id) {
        form.reset(toFormValues(result.cateringPackage));
        setSelectedImageAsset(result.cateringPackage.image);
        setLastSavedAt(result.cateringPackage.updatedAt ?? new Date().toISOString());
      }

      toast.success(nextStatus === "active" ? "Catering package reactivated" : "Catering package deactivated", {
        description: result.message,
      });
    } catch (error) {
      toast.error("Unable to change package status", {
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
      const message = await deleteAdminCateringPackage(deleteTarget.id);
      await loadPackages();

      if (selectedPackageId === deleteTarget.id) {
        closeEditor();
      }

      setDeleteTarget(null);
      toast.success("Catering package deleted", {
        description: message,
      });
    } catch (error) {
      setDeleteTarget(null);
      toast.error("Unable to delete package", {
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
            eyebrow="Admin"
            title="Catering packages"
            body="Create the live packages that power the public Catering page, starting prices, and inquiry package selection."
            as="h1"
          />

          <div className="flex flex-wrap gap-3">
            <StatusChip tone="olive">{packages.length} loaded</StatusChip>
            <StatusChip tone="success">{activeCount} active</StatusChip>
            <StatusChip tone="warning">{featuredCount} featured</StatusChip>
            <button
              type="button"
              className="btn-primary w-full rounded-full px-6 sm:w-auto"
              onClick={() => openCreateEditor()}
              disabled={isSubmitting || isEditorLoading}
            >
              <span className="material-symbols-rounded text-base">add</span>
              Add Package
            </button>
          </div>
        </div>
      </div>

      {inlineError ? (
        <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{loadError}</p>
            <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => void loadPackages()}>
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {blockingError ? (
        <div className="card-surface max-w-3xl p-8 text-center sm:mx-auto sm:p-10">
          <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Unable to load catering packages</h2>
          <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
            {loadError ?? "The live catering package manager is temporarily unavailable."}
          </p>
          <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={() => void loadPackages()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="space-y-4 xl:col-span-12">
            <div className="card-surface space-y-4 p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
                <SearchField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search package names or slugs"
                  ariaLabel="Search catering packages"
                />

                <label className="relative block">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as (typeof statusFilterOptions)[number])}
                    className="select-field appearance-none pr-12"
                    aria-label="Filter packages by status"
                  >
                    {statusFilterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "all" ? "All statuses" : titleCase(option)}
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
                    onChange={(event) => setFeaturedFilter(event.target.value as (typeof featuredFilterOptions)[number])}
                    className="select-field appearance-none pr-12"
                    aria-label="Filter packages by featured state"
                  >
                    <option value="all">All feature states</option>
                    <option value="featured">Featured only</option>
                    <option value="standard">Standard only</option>
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
                    setFeaturedFilter("all");
                  }}
                >
                  <span className="material-symbols-rounded text-base">refresh</span>
                  Reset
                </button>
              </div>

              <p className="text-sm text-soft">
                Active packages appear publicly on <code>/catering</code>. Packages with historical inquiries are protected from destructive deletion.
              </p>
            </div>

            {isLoading && packages.length === 0 ? (
              <div className="card-surface p-6 text-sm text-soft">Loading live catering packages...</div>
            ) : packages.length === 0 ? (
              <div className="card-surface p-8 text-center sm:p-10">
                <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">No catering packages yet</h2>
                <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                  Create the first package to power the public Catering page and package-linked inquiries.
                </p>
                <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={() => openCreateEditor()}>
                  Create First Package
                </button>
              </div>
            ) : (
              <DataTable
                rows={packages}
                columns={[
                  {
                    key: "package",
                    header: "Package",
                    cell: (row) => (
                      <div className="flex items-center gap-3">
                        {row.imageUrl ? (
                          <img src={row.imageUrl} alt={row.name} className="h-12 w-12 rounded-[var(--vf-radius-sm)] object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--vf-radius-sm)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] text-[var(--vf-primary)]">
                            <span className="material-symbols-rounded text-xl">restaurant</span>
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
                    key: "price",
                    header: "Starting Price",
                    cell: (row) => <span className="text-sm font-medium text-[var(--vf-text)]">{formatCurrency(row.startingPrice, { currency: row.currencyCode })}</span>,
                  },
                  {
                    key: "guests",
                    header: "Guests",
                    cell: (row) => <span className="text-sm text-[var(--vf-text)]">{guestRange(row.minimumGuests, row.maximumGuests)}</span>,
                  },
                  {
                    key: "featured",
                    header: "Featured",
                    cell: (row) => row.featured ? <StatusChip tone="olive">Featured</StatusChip> : <span className="text-sm text-soft">Standard</span>,
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (row) => <StatusChip tone={row.status === "active" ? "success" : "neutral"}>{titleCase(row.status)}</StatusChip>,
                  },
                  {
                    key: "updated",
                    header: "Updated",
                    cell: (row) => <span className="text-sm text-soft">{row.updatedAt ? new Date(row.updatedAt).toLocaleString("en-US") : "Not updated"}</span>,
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    cell: (row) => (
                      <AdminActionGroup>
                        <AdminActionIconButton label="Edit catering package" title="Edit" icon={faPenToSquare} onClick={() => void openEditEditor(row.id)} />
                        <AdminActionIconButton
                          label={row.status === "active" ? "Deactivate catering package" : "Activate catering package"}
                          title={row.status === "active" ? "Deactivate" : "Activate"}
                          icon={row.status === "active" ? faBan : faCircleCheck}
                          tone={row.status === "active" ? "secondary" : "success"}
                          onClick={() => void toggleStatus(row)}
                        />
                        <AdminActionIconButton label="Delete catering package" title="Delete" icon={faTrashCan} tone="danger" onClick={() => setDeleteTarget(row)} />
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
            aria-label="Close catering package editor"
            onClick={() => {
              if (!isSubmitting && !isEditorLoading) {
                closeEditor();
              }
            }}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="catering-package-editor-title"
            className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-float)]"
          >
            <div className="flex flex-col gap-4 border-b border-[var(--vf-border-soft)] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">
                    {editorMode === "edit" ? "Edit Package" : "New Package"}
                  </p>
                  <h2 id="catering-package-editor-title" className="heading-display mt-2 text-3xl font-bold text-[var(--vf-text)]">
                    {editorMode === "edit" ? "Update package details" : "Create a catering package"}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-soft">
                    Use one source of truth for package pricing, guest range, media, and public visibility.
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
                    <button type="button" className="btn-ghost w-full rounded-full px-5 sm:w-auto" onClick={() => closeEditor()} disabled={isSubmitting || isEditorLoading}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {isEditorLoading ? <div className="rounded-[var(--vf-radius-md)] bg-[var(--vf-surface)] p-4 text-sm text-soft">Loading package details...</div> : null}

              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Package Name" error={form.formState.errors.name?.message}>
                    <>
                      <input className="field" {...form.register("name")} placeholder="Celebration Catering Package" />
                      <input type="hidden" {...form.register("slug")} />
                    </>
                  </Field>
                  <Field label="Sort Order" error={form.formState.errors.sortOrder?.message}>
                    <input className="field" {...form.register("sortOrder")} placeholder="0" />
                  </Field>
                </div>

                <p className="text-sm text-soft">Slug is generated automatically from the package name.</p>

                <Field label="Short Description" error={form.formState.errors.shortDescription?.message}>
                  <textarea className="textarea-field" rows={3} {...form.register("shortDescription")} placeholder="A flexible catering package for birthdays, family celebrations, and private gatherings." />
                </Field>

                <Field label="Description" error={form.formState.errors.description?.message}>
                  <textarea className="textarea-field" rows={5} {...form.register("description")} placeholder="Describe the hospitality setup, menu direction, and service positioning for this package." />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Starting Price (USD)" error={form.formState.errors.startingPrice?.message}>
                    <input className="field" {...form.register("startingPrice")} placeholder="850.00" />
                  </Field>
                  <Field label="Minimum Guests" error={form.formState.errors.minimumGuests?.message}>
                    <input className="field" {...form.register("minimumGuests")} placeholder="30" />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Maximum Guests" error={form.formState.errors.maximumGuests?.message}>
                    <input className="field" {...form.register("maximumGuests")} placeholder="100" />
                  </Field>
                  <Field label="Status" error={form.formState.errors.status?.message}>
                    <select className="select-field" {...form.register("status")}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </Field>
                </div>

                <label className="flex items-center gap-3 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] px-4 py-3 text-sm font-medium text-[var(--vf-text)]">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--vf-primary)]" {...form.register("featured")} />
                  Featured package
                </label>

                <Field label="Inclusions (one per line)" error={form.formState.errors.inclusionsText?.message}>
                  <textarea className="textarea-field" rows={5} {...form.register("inclusionsText")} placeholder="Buffet service&#10;Vegetarian option support&#10;Setup and service coordination" />
                </Field>

                <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--vf-text)]">Package image</p>
                      <p className="mt-1 text-sm text-soft">Use the shared media library so catering packages reuse the same approved asset workflow as products and categories.</p>
                    </div>
                    <button type="button" className="btn-secondary rounded-full px-4 py-2 text-xs" onClick={() => setIsMediaLibraryOpen(true)}>
                      Open Media Library
                    </button>
                  </div>

                  {cateringSpec ? (
                    <div className="mt-4 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4 text-sm text-soft">
                      {cateringSpec.label} | Recommended {cateringSpec.width} x {cateringSpec.height}px | Minimum {cateringSpec.minWidth} x {cateringSpec.minHeight}px | Max {Math.round(cateringSpec.maxSizeKb / 1024)}MB
                    </div>
                  ) : specError ? (
                    <div className="mt-4 rounded-[var(--vf-radius-md)] border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
                      {specError}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4 text-sm text-soft">
                      {isLoadingSpecs ? "Loading media specifications..." : "Media specifications are temporarily unavailable."}
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                    <div>
                      <input type="hidden" {...form.register("imageMediaId")} />
                      <p className="text-sm font-semibold text-[var(--vf-text)]">Selected image</p>
                      {selectedImageAsset ? (
                        <div className="mt-4 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4 text-sm text-soft">
                          <p className="font-semibold text-[var(--vf-text)]">{selectedImageAsset.originalFilename ?? selectedImageAsset.filename}</p>
                          <p className="mt-1">{selectedImageAsset.width && selectedImageAsset.height ? `${selectedImageAsset.width} x ${selectedImageAsset.height}px` : "Dimensions unavailable"} | {formatFileSize(selectedImageAsset.sizeBytes ?? 0)}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">{selectedImageAsset.mimeType?.toUpperCase() ?? "IMAGE"} | Alt: {getMediaAltText(selectedImageAsset, form.watch("name") || "Catering image")}</p>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-[var(--vf-radius-md)] border border-dashed border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4 text-sm text-soft">
                          No package image selected yet.
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)]">
                      {selectedImageAsset ? (
                        <img src={getMediaVariantUrl(selectedImageAsset, "medium") ?? selectedImageAsset.url} alt={getMediaAltText(selectedImageAsset, form.watch("name") || "Catering preview")} className="aspect-[16/9] h-full w-full object-cover" />
                      ) : (
                        <div className="flex aspect-[16/9] items-center justify-center bg-[var(--vf-surface)] text-[var(--vf-text-soft)]">
                          <div className="text-center">
                            <span className="material-symbols-rounded text-4xl">image</span>
                            <p className="mt-2 text-sm">No catering image selected</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      className="btn-ghost w-full sm:w-auto"
                      onClick={() => {
                        if (editorMode === "edit" && selectedPackageId !== null) {
                          void openEditEditor(selectedPackageId);
                        } else {
                          openCreateEditor();
                        }
                      }}
                      disabled={isSubmitting || isEditorLoading}
                    >
                      Reset Form
                    </button>
                    <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => closeEditor()} disabled={isSubmitting || isEditorLoading}>
                      Cancel
                    </button>
                  </div>

                  <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting || isEditorLoading}>
                    {isSubmitting ? "Saving..." : editorMode === "edit" ? "Save Package" : "Create Package"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      ) : null}

      <MediaLibraryDialog
        isOpen={isMediaLibraryOpen}
        title="Catering Media Library"
        description="Upload or reuse event-ready imagery for catering packages."
        initialPurpose="catering"
        uploadSpecKey="catering"
        preferredAltText={form.watch("name") || undefined}
        selectedIds={selectedImageAsset ? [selectedImageAsset.id] : []}
        onSelect={(asset) => {
          setSelectedImageAsset(asset);
          form.setValue("imageMediaId", String(asset.id), {
            shouldDirty: true,
            shouldValidate: true,
          });
          setIsMediaLibraryOpen(false);
        }}
        onClose={() => setIsMediaLibraryOpen(false)}
      />

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--vf-backdrop)] backdrop-blur-sm"
            aria-label="Close delete package dialog"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-float)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-danger)]">Confirm Delete</p>
            <h2 className="heading-display mt-3 text-3xl font-bold text-[var(--vf-text)]">Delete {deleteTarget.name}?</h2>
            <p className="mt-3 text-sm leading-7 text-soft">Packages linked to inquiries are protected and should be deactivated instead of deleted.</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="rounded-full bg-[var(--vf-danger)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-95" onClick={() => void handleDelete()} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Package"}
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

function blankValues(sortOrder: number): PackageFormValues {
  return {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    startingPrice: "450.00",
    minimumGuests: "25",
    maximumGuests: "",
    inclusionsText: "",
    status: "active",
    featured: false,
    sortOrder: String(sortOrder),
    imageMediaId: "",
  };
}

function getNextSortOrder(packages: CateringPackage[]) {
  return packages.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;
}

function toFormValues(cateringPackage: CateringPackage): PackageFormValues {
  return {
    name: cateringPackage.name,
    slug: cateringPackage.slug,
    shortDescription: cateringPackage.shortDescription,
    description: cateringPackage.description,
    startingPrice: cateringPackage.startingPrice.toFixed(2),
    minimumGuests: String(cateringPackage.minimumGuests),
    maximumGuests: cateringPackage.maximumGuests ? String(cateringPackage.maximumGuests) : "",
    inclusionsText: cateringPackage.inclusions.join("\n"),
    status: cateringPackage.status,
    featured: cateringPackage.featured,
    sortOrder: String(cateringPackage.sortOrder),
    imageMediaId: cateringPackage.imageMediaId ? String(cateringPackage.imageMediaId) : "",
  };
}

function toPayload(values: PackageFormValues): CateringPackageInput {
  return {
    name: values.name,
    slug: values.slug || undefined,
    shortDescription: values.shortDescription || undefined,
    description: values.description || undefined,
    startingPrice: Number(values.startingPrice),
    minimumGuests: Number(values.minimumGuests),
    maximumGuests: values.maximumGuests ? Number(values.maximumGuests) : null,
    inclusions: values.inclusionsText.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
    featured: values.featured,
    status: values.status,
    sortOrder: values.sortOrder ? Number(values.sortOrder) : 0,
    imageMediaId: values.imageMediaId ? Number(values.imageMediaId) : null,
  };
}

function packageToInput(cateringPackage: CateringPackage): CateringPackageInput {
  return {
    name: cateringPackage.name,
    slug: cateringPackage.slug,
    shortDescription: cateringPackage.shortDescription,
    description: cateringPackage.description,
    startingPrice: cateringPackage.startingPrice,
    minimumGuests: cateringPackage.minimumGuests,
    maximumGuests: cateringPackage.maximumGuests,
    inclusions: cateringPackage.inclusions,
    featured: cateringPackage.featured,
    status: cateringPackage.status,
    sortOrder: cateringPackage.sortOrder,
    imageMediaId: cateringPackage.imageMediaId,
  };
}

function toFieldPath(field: string) {
  return field
    .replace(/^short_description$/, "shortDescription")
    .replace(/^starting_price$/, "startingPrice")
    .replace(/^minimum_guests$/, "minimumGuests")
    .replace(/^maximum_guests$/, "maximumGuests")
    .replace(/^sort_order$/, "sortOrder")
    .replace(/^image_media_id$/, "imageMediaId")
    .replace(/^inclusions(?:\.\d+)?$/, "inclusionsText");
}

function titleCase(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function guestRange(minimumGuests: number, maximumGuests: number | null) {
  return maximumGuests && maximumGuests > minimumGuests ? `${minimumGuests} - ${maximumGuests}` : `${minimumGuests}+`;
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

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-sm text-[var(--vf-danger)]">{error}</span> : null}
    </label>
  );
}
