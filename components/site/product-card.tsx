import Link from "next/link";
import { CloudImage } from "@/components/site/cloud-image";

type ProductCardProps = {
  slug: string;
  name: string;
  shortDescription: string;
  price: number | string;
  categoryName?: string;
  availabilityStatus: string;
  image?: { publicId?: string | null; secureUrl?: string | null } | null;
  whatsappUrl: string;
};

export function ProductCard({
  slug,
  name,
  shortDescription,
  price,
  categoryName,
  availabilityStatus,
  image,
  whatsappUrl
}: ProductCardProps) {
  const imageSrc = image?.secureUrl || null;

  return (
    <article className="card overflow-hidden">
      <Link href={`/products/${slug}`} className="block bg-surface-muted p-4">
        <div className="overflow-hidden rounded-2xl">
          <CloudImage
            src={imageSrc}
            width={700}
            height={700}
            alt={name}
            className="h-64 w-full object-cover"
          />
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            {categoryName ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{categoryName}</p>
            ) : null}
            <Link href={`/products/${slug}`} className="mt-1 block font-display text-2xl text-ink">
              {name}
            </Link>
          </div>
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-tertiary">
            {availabilityStatus.replaceAll("_", " ")}
          </span>
        </div>
        <p className="text-sm leading-7 text-ink-soft">{shortDescription}</p>
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold text-primary">NGN {price}</p>
          <div className="flex gap-2">
            <Link href={`/products/${slug}`} className="rounded-full border border-line px-4 py-2 text-sm font-medium">
              Details
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Order Now
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
