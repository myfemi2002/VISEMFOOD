import { BRAND_ASSETS, type BrandLogoVariant } from "@/lib/brand-assets";

const logoDimensions = {
  primary: { width: 440, height: 148 },
  light: { width: 439, height: 148 },
  mark: { width: 847, height: 847 },
} as const;

const logoSources: Record<BrandLogoVariant, string> = {
  primary: BRAND_ASSETS.primaryLogo,
  light: BRAND_ASSETS.lightLogo,
  mark: BRAND_ASSETS.mark,
};

export function BrandLogo({
  variant = "primary",
  className,
  alt = "VISEMFOOD",
}: {
  variant?: BrandLogoVariant;
  className?: string;
  alt?: string;
}) {
  const dimensions = logoDimensions[variant];

  return (
    <img
      src={logoSources[variant]}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={className ? `block h-auto max-w-full select-none object-contain ${className}` : "block h-auto max-w-full select-none object-contain"}
      decoding="async"
    />
  );
}
