import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { formatFileSize, getMediaAltText, getMediaVariantUrl } from "@/lib/media";
import { useAdminMediaSpecs } from "@/components/admin/useAdminMediaSpecs";
import { SearchField } from "@/components/SearchField";
import {
  fetchAdminMediaAssets,
  uploadAdminMediaAsset,
  type MediaAsset,
} from "@/lib/visemfood-api";

type MediaLibraryDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  initialPurpose?: string;
  uploadSpecKey?: string;
  preferredAltText?: string;
  selectedIds?: number[];
  onSelect: (asset: MediaAsset) => void;
  onClose: () => void;
};

export function MediaLibraryDialog({
  isOpen,
  title,
  description,
  initialPurpose = "all",
  uploadSpecKey = "product",
  preferredAltText,
  selectedIds = [],
  onSelect,
  onClose,
}: MediaLibraryDialogProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState(initialPurpose);
  const [uploadPurpose, setUploadPurpose] = useState(uploadSpecKey);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { specs, specError, isLoadingSpecs } = useAdminMediaSpecs(isOpen);

  const currentSpec = specs[uploadPurpose] ?? null;
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

  async function loadAssets() {
    setStatus("loading");

    try {
      const result = await fetchAdminMediaAssets({
        search: search.trim() || undefined,
        purpose: purposeFilter === "all" ? undefined : purposeFilter,
        perPage: 60,
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
    if (!isOpen) {
      return;
    }

    setPurposeFilter(initialPurpose);
    setUploadPurpose(uploadSpecKey);
  }, [initialPurpose, isOpen, uploadSpecKey]);

  useEffect(() => {
    if (!isOpen || Object.keys(specs).length === 0 || specs[uploadPurpose]) {
      return;
    }

    const firstKey = Object.keys(specs)[0];
    if (firstKey) {
      setUploadPurpose(firstKey);
    }
  }, [isOpen, specs, uploadPurpose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadAssets();
  }, [isOpen, purposeFilter, search]);

  async function handleUpload(file: File | null) {
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadAdminMediaAsset(file, {
        spec: uploadPurpose,
        altText: preferredAltText?.trim() || file.name,
      });
      toast.success("Image uploaded", {
        description: result.message,
      });
      onSelect(result.asset);
      onClose();
    } catch (uploadError) {
      toast.error("Unable to upload image", {
        description: getErrorMessage(uploadError, "Please review the file and try again."),
      });
    } finally {
      setIsUploading(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-5 sm:px-6">
      <button
        type="button"
        aria-label="Close media library"
        className="absolute inset-0 bg-[var(--vf-backdrop)]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[var(--vf-radius-xl)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-float)]">
        <div className="flex flex-col gap-4 border-b border-[var(--vf-border-soft)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Media Library</p>
              <h2 className="heading-display mt-2 text-3xl font-bold text-[var(--vf-text)]">{title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-soft">{description}</p>
            </div>

            <button type="button" className="btn-ghost w-full rounded-full px-4 py-2 sm:w-auto" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <SearchField
                label="Search Library"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by filename or alt text"
                ariaLabel="Search media assets"
              />

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                  Library Filter
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="min-w-0 flex-1 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                      Upload Spec
                    </span>
                    <select className="select-field" value={uploadPurpose} onChange={(event) => setUploadPurpose(event.target.value)}>
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
                      className="field min-w-0 cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-[var(--vf-primary-light)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--vf-primary)]"
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
                  <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-3 text-sm text-soft">
                    <p className="font-semibold text-[var(--vf-text)]">{currentSpec.label}</p>
                    <p className="mt-1">
                      Recommended: {currentSpec.width} x {currentSpec.height} px | Minimum {currentSpec.minWidth} x {currentSpec.minHeight} px | Max{" "}
                      {Math.round(currentSpec.maxSizeKb / 1024)}MB | Formats {currentSpec.formats.join(", ").toUpperCase()}
                    </p>
                  </div>
                ) : specError ? (
                  <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-3 text-sm text-[var(--vf-text)]">
                    {specError}
                  </div>
                ) : (
                  <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-3 text-sm text-soft">
                    {isLoadingSpecs ? "Loading media specifications..." : "Media specifications are temporarily unavailable."}
                  </div>
                )}

                <p className="text-xs text-[var(--vf-text-soft)]">
                  {isUploading ? "Uploading and optimizing image..." : "Uploads are processed on the backend and saved as reusable media assets."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {status === "loading" ? (
            <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-6 text-sm text-soft">
              Loading media library...
            </div>
          ) : status === "error" ? (
            <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-6 text-sm text-[var(--vf-text)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>{error}</p>
                <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => void loadAssets()}>
                  Retry
                </button>
              </div>
            </div>
          ) : assets.length === 0 ? (
            <div className="rounded-[var(--vf-radius-md)] border border-dashed border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-8 text-center">
              <span className="material-symbols-rounded text-4xl text-[var(--vf-text-soft)]">photo_library</span>
              <p className="mt-3 text-base font-semibold text-[var(--vf-text)]">No media assets found</p>
              <p className="mt-2 text-sm leading-7 text-soft">
                Upload a new image above or adjust the library filters to see existing assets.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => {
                const thumbUrl = getMediaVariantUrl(asset, "thumbnail") || getMediaVariantUrl(asset, "medium") || asset.url;
                const isSelected = selectedIds.includes(asset.id);

                return (
                  <article
                    key={asset.id}
                    className={
                      isSelected
                        ? "overflow-hidden rounded-[var(--vf-radius-lg)] border border-[var(--vf-primary)] bg-[var(--vf-primary-light)] shadow-[var(--vf-shadow-soft)]"
                        : "overflow-hidden rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] shadow-[var(--vf-shadow-soft)]"
                    }
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--vf-surface-muted)]">
                      <img
                        src={thumbUrl}
                        alt={getMediaAltText(asset, asset.originalFilename || "Media asset")}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {asset.purpose ? (
                          <span className="rounded-full bg-[var(--vf-overlay-elevated)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--vf-secondary)]">
                            {asset.purpose}
                          </span>
                        ) : null}
                        {isSelected ? (
                          <span className="rounded-full bg-[var(--vf-primary)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                            Selected
                          </span>
                        ) : null}
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
                        <span>{asset.usageCount} use{asset.usageCount === 1 ? "" : "s"}</span>
                      </div>

                      <button
                        type="button"
                        className="btn-primary w-full rounded-full px-4 py-2.5 text-sm"
                        onClick={() => {
                          onSelect(asset);
                          onClose();
                        }}
                      >
                        Use Image
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


