import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { buildMeta } from "@/lib/meta";
import { categoryFilters, products } from "@/data/mock";

export const Route = createFileRoute("/menu")({
  head: () =>
    buildMeta({
      title: "Menu | VISEMFOOD",
      description: "Browse the premium African catering and food ordering catalog with category filters and rich product detail.",
      image: products[0]?.image,
    }),
  component: MenuPage,
});

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof categoryFilters)[number]>("All");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const queryMatch =
        query.trim() === "" ||
        `${product.name} ${product.shortDescription} ${product.category}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

  return (
    <main className="section-gap">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Catering & Ordering Catalog"
          title="A premium catalog built for direct orders, gifting, and event planning."
          body="This route reflects the Stitch menu screen with practical category filtering and a clear cart-enabled shopping interaction."
          as="h1"
        />
        <div className="card-surface mt-8 grid gap-4 p-5 lg:grid-cols-[1.8fr,1fr,auto]">
          <input
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search meals, categories, or mood"
          />
          <select
            className="select-field"
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value as (typeof categoryFilters)[number])}
          >
            {categoryFilters.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button type="button" className="btn-primary" onClick={() => navigate({ to: "/menu" })}>
            Refresh
          </button>
        </div>
        <div className="site-grid mt-8 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
