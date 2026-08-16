import { CldImage } from "next-cloudinary";

type TrayCardProps = {
  name: string;
  shortDescription: string;
  servingRange: string;
  price: number | string;
  image?: { publicId?: string | null } | null;
  whatsappUrl: string;
};

export function TrayCard({ name, shortDescription, servingRange, price, image, whatsappUrl }: TrayCardProps) {
  return (
    <article className="card overflow-hidden">
      <CldImage
        src={image?.publicId || "cld-sample-4"}
        width="900"
        height="600"
        alt={name}
        className="h-64 w-full object-cover"
        crop={{ type: "fill", source: true }}
      />
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-ink">{name}</h3>
            <p className="mt-1 text-sm font-medium text-secondary">{servingRange}</p>
          </div>
          <p className="text-lg font-semibold text-primary">NGN {price}</p>
        </div>
        <p className="text-sm leading-7 text-ink-soft">{shortDescription}</p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
        >
          Order This Package
        </a>
      </div>
    </article>
  );
}
