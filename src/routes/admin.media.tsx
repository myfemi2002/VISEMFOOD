import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAdminMediaSpecs } from "@/components/admin/useAdminMediaSpecs";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { getErrorMessage } from "@/lib/api";
import { formatFileSize, getMediaAltText, getMediaVariantUrl } from "@/lib/media";
import { buildMeta } from "@/lib/meta";
import {
  deleteAdminMediaAsset,
  fetchAdminMediaAsset,
  fetchAdminMediaAssets,
  uploadAdminMediaAsset,
  type MediaAsset,
} from "@/lib/visemfood-api";

export const Route = createFileRoute("/admin/media")({
  head: () =>
    buildMeta({
      title: "Media Library | VISEMFOOD Admin",
      description: "Upload, review, and manage reusable media assets for the VISEMFOOD catalog and content surfaces.",
    }),
  component: AdminMediaPage,
});

function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [uploadSpecKey, setUploadSpecKey] = useState("product");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [detailAsset, setDetailAsset] = useState<MediaAsset | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { specs, specError, isLoadingSpecs } = useAdminMediaSpecs();

  const currentSpec = specs[uploadSpecKey] ?? null;
  const purposeOptions = useMemo(
    () => [
      { value: "all", label: "All media" },
      ...Object.entries(specs).map(([key, spec]) => ({
        value: key,
        label: spec.label,
      })),
    ],
    [specs],
  );
  const inUseCount = useMemo(() => assets.filter((asset) => asset.usageCount > 0).length, [assets]);

  async function loadAssets() {
    setStatus("loading");

    try {
      const result = await fetchAdminMediaAssets({
        search: deferredSearch.trim() || undefined,
        purpose: purposeFilter === "all" ? undefined : purposeFilter,
        perPage: 90,
      });
      setAssets(result.items);
      setError(null);
      setStatus("ready");
    } catch (loadError) {
      setAssets([]);
      setError(getErrorMessage(loadError, "Unable to load the media library right now."));
      setStatus("error");
    }
  }

  useEffect(() => {
    if (Object.keys(specs).length === 0 || specs[uploadSpecKey]) {
      return;
    }

    const firstKey = Object.keys(specs)[0];
    if (firstKey) {
      setUploadSpecKey(firstKey);
    }
  }, [specs, uploadSpecKey]);

  useEffect(() => {
    void loadAssets();
  }, [deferredSearch, purposeFilter]);

  async function handleUpload(file: File | null) {
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadAdminMediaAsset(file, {
        spec: uploadSpecKey,
        altText: file.name,
      });

      toast.success("Image uploaded", {
        description: result.message,
      });
      await loadAssets();
    } catch (uploadError) {
      toast.error("Unable to upload image", {
        description: getErrorMessage(uploadError, "Please check the file and try again."),
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function openDetails(assetId: number) {
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const asset = await fetchAdminMediaAsset(assetId);
      setDetailAsset(asset);
    } catch (loadError) {
      setDetailAsset(null);
      setDetailError(getErrorMessage(loadError, "The media asset could not be loaded."));
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      const message = await deleteAdminMediaAsset(deleteTarget.id);
      toast.success("Image deleted", {
        description: message,
      });
      if (detailAsset?.id === deleteTarget.id) {
        setDetailAsset(null);
        setDetailError(null);
      }
      setDeleteTarget(null);
      await loadAssets();
    } catch (deleteError) {
      toast.error("Unable to delete image", {
        description: getErrorMessage(deleteError, "Please detach this image from active content and try again."),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card-surface p-6 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeading
            eyebrow="Admin"
            title="Media library"
            body="Manage reusable product and category imagery through one optimized library with upload specs, metadata, and reference protection."
            as="h1"
          />

          <div className="flex flex-wrap gap-3">
            <StatusChip tone="olive">{assets.length} loaded</StatusChip>
            <StatusChip tone="success">{assets.length - inUseCount} unused</StatusChip>
            <StatusChip tone="neutral">{inUseCount} in use</StatusChip>
          </div>
        </div>
      </section>

      <section className="card-surface space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                Search Library
              </span>
              <input
                type="search"
                className="field"
                placeholder="Search filename or alt text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                Purpose Filter
              </span>
              <select className="select-field" value={purposeFilter} onChange={(event) => setPurposeFilter(event.target.value)}>
                {purposeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                    Upload Spec
                  </span>
                  <select className="select-field" value={uploadSpecKey} onChange={(event) => setUploadSpecKey(event.target.value)}>
                    {purposeOptions
                      .filter((option) => option.value !== "all")
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="block">
                  <span className="sr-only">Upload image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="field cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-[var(--vf-primary-light)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--vf-primary)]"
                    disabled={isUploading || !currentSpec}
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      void handleUpload(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>

              {currentSpec ? (
                <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4 text-sm text-soft">
                  <p className="font-semibold text-[var(--vf-text)]">{currentSpec.label}</p>
                  <p className="mt-1">
                    Recommended: {currentSpec.width} x {currentSpec.height} px | Minimum {currentSpec.minWidth} x {currentSpec.minHeight} px | Max{" "}
                    {Math.round(currentSpec.maxSizeKb / 1024)}MB | Formats {currentSpec.formats.join(", ").toUpperCase()}
                  </p>
                </div>
              ) : specError ? (
                <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
                  {specError}
                </div>
              ) : null}

              {!currentSpec && !specError ? (
                <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4 text-sm text-soft">
                  {isLoadingSpecs ? "Loading media specifications..." : "Media specifications are temporarily unavailable."}
                </div>
              ) : null}

              <p className="text-xs text-[var(--vf-text-soft)]">
                {isUploading ? "Uploading and optimizing image..." : "Images are validated, resized, and stored through the Laravel public disk."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {status === "error" ? (
        <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-5 text-sm text-[var(--vf-text)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{error ?? "The media library is temporarily unavailable."}</p>
            <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => void loadAssets()}>
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {status === "ready" && assets.length === 0 ? (
        <div className="card-surface p-8 text-center sm:p-10">
          <span className="material-symbols-rounded text-4xl text-[var(--vf-text-soft)]">photo_library</span>
          <h2 className="heading-display mt-4 text-3xl font-bold text-[var(--vf-text)]">No media assets yet</h2>
          <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
            Upload your first product or category image to begin building the reusable VISEMFOOD media library.
          </p>
        </div>
      ) : null}

      {status !== "error" && assets.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => {
            const previewUrl = getMediaVariantUrl(asset, "medium") || getMediaVariantUrl(asset, "thumbnail") || asset.url;

            return (
              <article
                key={asset.id}
                className="overflow-hidden rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-soft)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--vf-surface-muted)]">
                  <img
                    src={previewUrl}
                    alt={getMediaAltText(asset, asset.originalFilename || "Media asset")}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {asset.purpose ? <StatusChip tone="olive">{asset.purpose}</StatusChip> : null}
                    <StatusChip tone={asset.usageCount > 0 ? "neutral" : "success"}>
                      {asset.usageCount > 0 ? `${asset.usageCount} in use` : "Unused"}
                    </StatusChip>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="truncate text-sm font-semibold text-[var(--vf-text)]">
                      {asset.originalFilename || asset.filename || "Untitled asset"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--vf-text-soft)]">
                      {asset.width && asset.height ? `${asset.width} x ${asset.height}px` : "Dimensions unavailable"} | {formatFileSize(asset.sizeBytes)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs text-[var(--vf-text-soft)]">
                    <span>{asset.mimeType?.toUpperCase() || "IMAGE"}</span>
                    <span>{asset.uploadedBy?.name ?? "System upload"}</span>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" className="btn-secondary w-full rounded-full px-4 py-2 sm:w-auto" onClick={() => void openDetails(asset.id)}>
                      View Details
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[var(--vf-danger)]/25 px-4 py-2 text-sm font-semibold text-[var(--vf-danger)] transition-colors hover:bg-[var(--vf-danger-soft)]"
                      onClick={() => setDeleteTarget(asset)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {isDetailLoading || detailAsset || detailError ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--vf-backdrop)]/80 backdrop-blur-sm"
            aria-label="Close media details"
            onClick={() => {
              if (!isDetailLoading) {
                setDetailAsset(null);
                setDetailError(null);
              }
            }}
          />

          <div className="relative z-10 w-full max-w-4xl rounded-[var(--vf-radius-xl)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-5 shadow-[var(--vf-shadow-float)] sm:p-6">
            {isDetailLoading ? (
              <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-6 text-sm text-soft">
                Loading media details...
              </div>
            ) : detailError ? (
              <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-6 text-sm text-[var(--vf-text)]">
                {detailError}
              </div>
            ) : detailAsset ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="overflow-hidden rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)]">
                  <img
                    src={getMediaVariantUrl(detailAsset, "large") || detailAsset.url}
                    alt={getMediaAltText(detailAsset, detailAsset.originalFilename || "Media asset")}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Media Details</p>
                      <h2 className="heading-display mt-2 text-3xl font-bold text-[var(--vf-text)]">
                        {detailAsset.originalFilename || detailAsset.filename || "Media asset"}
                      </h2>
                    </div>
                    <button type="button" className="btn-ghost rounded-full px-4 py-2 text-sm" onClick={() => setDetailAsset(null)}>
                      Close
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailCard label="Stored filename" value={detailAsset.filename || "Not available"} />
                    <DetailCard label="Original filename" value={detailAsset.originalFilename || "Not available"} />
                    <DetailCard label="Dimensions" value={detailAsset.width && detailAsset.height ? `${detailAsset.width} x ${detailAsset.height}px` : "Unknown"} />
                    <DetailCard label="File size" value={formatFileSize(detailAsset.sizeBytes)} />
                    <DetailCard label="Format" value={detailAsset.mimeType?.toUpperCase() || "Unknown"} />
                    <DetailCard label="Purpose" value={detailAsset.purpose || "General"} />
                  </div>

                  <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                    <p className="text-sm font-semibold text-[var(--vf-text)]">Alt Text</p>
                    <p className="mt-2 text-sm leading-7 text-soft">
                      {detailAsset.altText?.trim() || "No custom alt text stored. Product or category context will provide the fallback."}
                    </p>
                  </div>

                  <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--vf-text)]">Usage</p>
                      <StatusChip tone={detailAsset.usageCount > 0 ? "neutral" : "success"}>
                        {detailAsset.usageCount > 0 ? `${detailAsset.usageCount} active reference${detailAsset.usageCount === 1 ? "" : "s"}` : "Unused"}
                      </StatusChip>
                    </div>

                    <div className="mt-3 space-y-3 text-sm text-soft">
                      <p>Categories: {detailAsset.usage.categories}</p>
                      <p>Products: {detailAsset.usage.products}</p>
                      <p>Primary product images: {detailAsset.usage.primaryProducts}</p>
                      <p>Gallery-only product uses: {detailAsset.usage.galleryProducts}</p>
                      <p>Content sections: {detailAsset.usage.contentSections}</p>
                    </div>

                    {detailAsset.usedBy ? (
                      <div className="mt-4 space-y-3 border-t border-[var(--vf-border-soft)] pt-4 text-sm text-soft">
                        {detailAsset.usedBy.categories.length > 0 ? (
                          <div>
                            <p className="font-semibold text-[var(--vf-text)]">Categories</p>
                            <p className="mt-1">{detailAsset.usedBy.categories.map((category) => category.name).join(", ")}</p>
                          </div>
                        ) : null}
                        {detailAsset.usedBy.products.length > 0 ? (
                          <div>
                            <p className="font-semibold text-[var(--vf-text)]">Products</p>
                            <p className="mt-1">{detailAsset.usedBy.products.map((product) => product.name).join(", ")}</p>
                          </div>
                        ) : null}
                        {detailAsset.usedBy.contentSections.length > 0 ? (
                          <div>
                            <p className="font-semibold text-[var(--vf-text)]">Content Sections</p>
                            <p className="mt-1">{detailAsset.usedBy.contentSections.map((section) => section.title || section.sectionKey).join(", ")}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      className="rounded-full border border-[var(--vf-danger)]/25 px-5 py-3 text-sm font-semibold text-[var(--vf-danger)] transition-colors hover:bg-[var(--vf-danger-soft)]"
                      onClick={() => setDeleteTarget(detailAsset)}
                    >
                      Delete Asset
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setDetailAsset(null)}>
                      Done
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--vf-backdrop)]/80 backdrop-blur-sm"
            aria-label="Close delete media dialog"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-float)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-danger)]">Confirm Delete</p>
            <h2 className="heading-display mt-3 text-3xl font-bold text-[var(--vf-text)]">
              Delete {deleteTarget.originalFilename || deleteTarget.filename || "this image"}?
            </h2>
            <p className="mt-3 text-sm leading-7 text-soft">
              Assets that are still attached to products, categories, or other content are protected. The backend will block the deletion if this image is still in use.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-full bg-[var(--vf-danger)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-95"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Image"}
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

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--vf-text-soft)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--vf-text)]">{value}</p>
    </div>
  );
}
