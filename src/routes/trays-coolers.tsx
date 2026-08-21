import { createFileRoute } from "@tanstack/react-router";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SectionHeading } from "@/components/SectionHeading";
import { buildMeta } from "@/lib/meta";
import { trayPackages } from "@/data/mock";
import { useCart } from "@/contexts/cart-context";

export const Route = createFileRoute("/trays-coolers")({
  head: () =>
    buildMeta({
      title: "Trays & Coolers | VISEMFOOD",
      description: "Bulk ordering for trays and coolers with responsive quantity controls and premium package presentation.",
      image: trayPackages[0]?.image,
    }),
  component: TraysCoolersPage,
});

function TraysCoolersPage() {
  const { bulkQuantities, setBulkQuantity } = useCart();

  return (
    <main className="section-gap">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Bulk Ordering"
          title="Trays and coolers designed for celebrations, offices, and generous hosting."
          body="The responsive experience keeps the premium desktop composition while collapsing naturally toward the provided mobile direction on smaller screens."
          as="h1"
        />
        <div className="site-grid mt-8 lg:grid-cols-2">
          {trayPackages.map((item) => (
            <article key={item.id} className="card-surface overflow-hidden">
              <img src={item.image} alt={item.name} className="h-72 w-full object-cover" loading="lazy" />
              <div className="space-y-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-tertiary)]">
                      {item.type}
                    </p>
                    <h2 className="heading-display mt-2 text-3xl font-bold">{item.name}</h2>
                    <p className="mt-2 text-soft">{item.servingRange}</p>
                  </div>
                  <p className="text-lg font-bold text-[var(--vf-primary)]">NGN {item.price.toLocaleString()}</p>
                </div>
                <p className="text-sm leading-7 text-soft">{item.shortDescription}</p>
                <ul className="space-y-2 text-sm text-soft">
                  {item.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <QuantityStepper
                    value={bulkQuantities[item.slug] ?? 0}
                    onChange={(value) => setBulkQuantity(item.slug, value)}
                  />
                  <button type="button" className="btn-primary">
                    Request Package
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
