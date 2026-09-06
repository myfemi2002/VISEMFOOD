type MediaVariantLike = {
  url: string;
};

type MediaLike = {
  url: string;
  altText?: string | null;
  variants?: Record<string, MediaVariantLike | undefined>;
};

export function formatFileSize(bytes: number | null | undefined) {
  const value = bytes ?? 0;

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function getMediaVariantUrl(
  asset: MediaLike | null | undefined,
  variant: string,
  fallbackToOriginal = true,
) {
  const variantUrl = asset?.variants?.[variant]?.url?.trim() ?? "";

  if (variantUrl) {
    return variantUrl;
  }

  return fallbackToOriginal ? asset?.url ?? "" : "";
}

export function getMediaAltText(asset: MediaLike | null | undefined, fallback: string) {
  return asset?.altText?.trim() || fallback;
}
