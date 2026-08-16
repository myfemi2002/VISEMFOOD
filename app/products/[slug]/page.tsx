import { notFound } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { getProductBySlug, getWhatsAppSettings } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type ProductDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { slug } = await params;
  const [product, whatsapp] = await Promise.all([getProductBySlug(slug), getWhatsAppSettings()]);

  if (!product) notFound();

  const primaryImage = product.images?.[0]?.publicId || "cld-sample-5";
  const whatsappUrl = buildWhatsAppUrl({
    phoneNumber: whatsapp.adminPhoneNumber,
    template: product.whatsappMessageTemplate || whatsapp.defaultOrderMessage,
    name: product.name,
    price: `NGN ${product.price}`
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="card overflow-hidden bg-surface-muted p-4">
        <CldImage
          src={primaryImage}
          width="1200"
          height="1200"
          alt={product.name}
          crop={{ type: "auto", source: true }}
          className="h-full w-full rounded-[1.5rem] object-cover"
        />
      </div>
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{product.categoryName}</p>
        <h1 className="font-display text-5xl text-ink">{product.name}</h1>
        <p className="text-lg text-primary">NGN {product.price}</p>
        <p className="leading-8 text-ink-soft">{product.description}</p>
        <div className="grid gap-4 rounded-3xl bg-white p-5 shadow-ambient sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Serving</p>
            <p className="mt-2 text-sm text-ink-soft">{product.servingSize || "Available on request"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Availability</p>
            <p className="mt-2 text-sm text-ink-soft">{product.availabilityStatus.replaceAll("_", " ")}</p>
          </div>
        </div>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">
          Order Now on WhatsApp
        </a>
      </div>
    </div>
  );
}
