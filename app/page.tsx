import Link from "next/link";
import { Hero } from "@/components/site/hero";
import { ProductCard } from "@/components/site/product-card";
import { getFeaturedProducts, getHomepageSections, getWhatsAppSettings } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const [sections, featuredProducts, whatsapp] = await Promise.all([
    getHomepageSections(),
    getFeaturedProducts(),
    getWhatsAppSettings()
  ]);

  const hero =
    sections.find((section: (typeof sections)[number]) => section.sectionKey === "hero") ??
    sections[0];

  return (
    <div className="space-y-14">
      <Hero
        title={hero.title}
        subtitle={hero.subtitle}
        body={hero.body}
        primaryCta={{ label: hero.buttonText ?? "Order Now", href: hero.buttonLink ?? "/order-now" }}
        secondaryCta={{ label: "Explore Catering", href: "/catering" }}
      />

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Featured Meals</p>
            <h2 className="font-display text-4xl text-ink">Curated for fast conversion and premium hospitality.</h2>
          </div>
          <Link href="/order-now" className="text-sm font-semibold text-primary">
            View full catalog
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredProducts.map((product: (typeof featuredProducts)[number]) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              shortDescription={product.shortDescription}
              price={product.price}
              categoryName={product.categoryName}
              availabilityStatus={product.availabilityStatus}
              image={product.image}
              whatsappUrl={buildWhatsAppUrl({
                phoneNumber: whatsapp.adminPhoneNumber,
                template: product.whatsappMessageTemplate || whatsapp.defaultOrderMessage,
                name: product.name,
                price: `NGN ${product.price}`
              })}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {sections
          .filter((section: (typeof sections)[number]) => section.sectionKey !== "hero")
          .slice(0, 3)
          .map((section: (typeof sections)[number]) => (
            <article key={section.sectionKey} className="card p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{section.subtitle}</p>
              <h3 className="mt-3 font-display text-3xl text-ink">{section.title}</h3>
              <p className="mt-4 text-sm leading-7 text-ink-soft">{section.body}</p>
              {section.buttonLink ? (
                <Link href={section.buttonLink} className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
                  {section.buttonText ?? "Explore"}
                </Link>
              ) : null}
            </article>
          ))}
      </section>
    </div>
  );
}
