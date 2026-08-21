import Image from "next/image";

type CloudImageProps = {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

export function CloudImage({ src, alt, width, height, className }: CloudImageProps) {
  return (
    <Image
      src={src || FALLBACK_IMAGE}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
    />
  );
}
