import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { buildMeta } from "@/lib/meta";
import { products, trayPackages } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () =>
    buildMeta({
      title: "VISEMFOOD | Premium African Hospitality & Culinary Heritage",
      description:
        "Premium African catering, trays and coolers, and elevated food ordering rooted in heritage and warm hospitality.",
      image: products[0]?.image,
    }),
  component: LandingPage,
});

function LandingPage() {
  const featured = products.filter((product) => product.featured).slice(0, 3);

  return (
    <main>
      <section className="section-gap">
        <div className="page-shell grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[var(--vf-tertiary)]">
              Premium African Hospitality
            </p>
            <h1 className="heading-display text-5xl font-bold leading-tight text-[var(--vf-text)] sm:text-7xl">
              Culinary heritage, plated with warmth and modern elegance.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-soft">
              VISEMFOOD brings refined African catering, trays and coolers, and elevated direct ordering into one premium hospitality experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/menu" className="btn-primary">
                Explore the Menu
              </Link>
              <Link to="/catering" className="btn-secondary">
                Start a Catering Request
              </Link>
            </div>
          </div>
          <div className="floating-surface overflow-hidden p-4">
            <img
              src="https://images.unsplash.com/photo-1517244683847-7456b63c5969?auto=format&fit=crop&w=1600&q=80"
              alt="Premium African catering table presentation"
              className="h-[560px] w-full rounded-[var(--vf-radius-lg)] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Signature Selection"
            title="Curated for intimate dining, gifting, and grand celebrations."
            body="The landing experience mirrors the Stitch direction: editorial, warm, and intentionally conversion-focused."
          />
          <div className="site-grid mt-10 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="page-shell grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Catering",
              body: "Private, family, and corporate event hospitality designed around premium presentation.",
              to: "/catering",
            },
            {
              title: "Trays & Coolers",
              body: `${trayPackages[0]?.name} and other bulk packages tailored for groups and celebrations.`,
              to: "/trays-coolers",
            },
            {
              title: "Our Story",
              body: "A heritage-driven brand story centered on warmth, culture, and elevated service.",
              to: "/our-story",
            },
          ].map((item) => (
            <article key={item.title} className="card-surface p-6">
              <h2 className="heading-display text-3xl font-bold">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-soft">{item.body}</p>
              <Link to={item.to} className="btn-ghost mt-6">
                Explore
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
