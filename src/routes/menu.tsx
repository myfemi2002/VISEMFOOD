import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { buildMeta } from "@/lib/meta";
import { categoryFilters, products } from "@/data/mock";

type CategoryId = (typeof categoryFilters)[number];
type QuickFilter = "all" | "featured" | "available" | "limited" | "hosting";

const categoryLabels: Record<CategoryId, string> = {
  All: "All Items",
  "Rice Dishes": "Rice Dishes",
  Soups: "Soups & Bowls",
  "Small Chops": "Small Chops & Bites",
  Proteins: "Signature Proteins",
  Desserts: "Sweet Finishes",
};

const categoryDescriptions: Record<CategoryId, string> = {
  All: "Every bowl, platter, and premium staple in the VISEMFOOD kitchen.",
  "Rice Dishes": "Signature jollof, celebration rice, and richly layered crowd favorites.",
  Soups: "Comforting heritage bowls with warmth, depth, and satisfying pairings.",
  "Small Chops": "Event-ready bites, cocktail-table favorites, and polished finger foods.",
  Proteins: "Grilled, glazed, and hospitality-ready centerpieces for intimate or shared tables.",
  Desserts: "Sweet finishes designed to feel warm, memorable, and indulgent.",
};

function isHostingReady(product: (typeof products)[number]) {
  const content = `${product.name} ${product.servingSize} ${product.tags?.join(" ") ?? ""}`.toLowerCase();
  return ["party", "event", "shared", "platter", "box", "tray"].some((keyword) => content.includes(keyword));
}

export const Route = createFileRoute("/menu")({
  head: () =>
    buildMeta({
      title: "Menu | VISEMFOOD",
      description:
        "Browse the VISEMFOOD premium African menu with refined search, category filtering, and direct ordering actions.",
      image: products[0]?.image,
    }),
  component: MenuPage,
});

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("All");
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const queryMatch =
        deferredQuery.trim() === "" ||
        `${product.name} ${product.shortDescription} ${product.category} ${product.servingSize} ${product.tags?.join(" ") ?? ""}`
          .toLowerCase()
          .includes(deferredQuery.toLowerCase());

      const quickFilterMatch =
        quickFilter === "all" ||
        (quickFilter === "featured" && (product.featured || product.tags?.some((tag) => /chef/i.test(tag)))) ||
        (quickFilter === "available" && product.availability === "Available") ||
        (quickFilter === "limited" && product.availability === "Limited") ||
        (quickFilter === "hosting" && isHostingReady(product));

      return categoryMatch && queryMatch && quickFilterMatch;
    });
  }, [activeCategory, deferredQuery, quickFilter]);

  const counts = useMemo(
    () => ({
      all: products.length,
      featured: products.filter((product) => product.featured || product.tags?.some((tag) => /chef/i.test(tag))).length,
      available: products.filter((product) => product.availability === "Available").length,
      limited: products.filter((product) => product.availability === "Limited").length,
      hosting: products.filter((product) => isHostingReady(product)).length,
    }),
    [],
  );

  const assurances = ["Freshly Prepared", "Pickup & Delivery", "Catering Available"];
  const quickFilters: Array<{ id: QuickFilter; label: string; icon: string; count: number }> = [
    { id: "all", label: "All Items", icon: "grid_view", count: counts.all },
    { id: "featured", label: "Chef's Picks", icon: "auto_awesome", count: counts.featured },
    { id: "available", label: "Available Today", icon: "check_circle", count: counts.available },
    { id: "limited", label: "Limited Batch", icon: "schedule", count: counts.limited },
    { id: "hosting", label: "Hosting Ready", icon: "celebration", count: counts.hosting },
  ];
  const activeQuickFilter = quickFilters.find((filter) => filter.id === quickFilter) ?? quickFilters[0];
  const activeCategoryLabel = categoryLabels[activeCategory];
  const hasActiveFilters = activeCategory !== "All" || query.trim() !== "" || quickFilter !== "all";

  function resetFilters() {
    setActiveCategory("All");
    setQuery("");
    setQuickFilter("all");
  }

  return (
    <main className="pb-8 pt-8 sm:pt-10 lg:pt-12">
      <section>
        <div className="page-shell">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--vf-primary)_14%,white)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">
              <span className="material-symbols-rounded text-base">restaurant</span>
              Our Menu
            </div>

            <h1 className="heading-display mt-5 text-5xl font-bold leading-[1.04] text-[var(--vf-text)] sm:text-6xl lg:text-7xl">
              A refined menu of bowls, small chops, and celebration-ready favorites.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-soft sm:text-lg sm:leading-9">
              Explore premium Nigerian dishes prepared for direct orders, intimate dinners, and larger gatherings. Search quickly, filter by category, and move from browsing to ordering without friction.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {assurances.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--vf-border-soft)] bg-[color-mix(in_srgb,var(--vf-surface-card)_88%,white)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--vf-text-soft)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 sm:mt-10">
        <div className="page-shell">
          <div className="card-surface overflow-hidden">
            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)_auto] lg:items-center">
              <label className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
                  <span className="material-symbols-rounded text-xl">search</span>
                </span>
                <input
                  className="field pl-12"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search dishes, categories, serving sizes, or tags"
                  aria-label="Search menu items"
                />
              </label>

              <select
                className="select-field"
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value as CategoryId)}
                aria-label="Filter by category"
              >
                {categoryFilters.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>

              <button type="button" className="btn-primary w-full lg:w-auto" onClick={resetFilters}>
                <span className="material-symbols-rounded text-base">refresh</span>
                Reset
              </button>
            </div>

            <div className="border-t border-[var(--vf-border-soft)] p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                {quickFilters.map((filter) => {
                  const active = quickFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setQuickFilter(filter.id)}
                      className={
                        active
                          ? "inline-flex items-center gap-2 rounded-full bg-[var(--vf-text)] px-4 py-2 text-xs font-semibold text-white"
                          : "inline-flex items-center gap-2 rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] px-4 py-2 text-xs font-semibold text-[var(--vf-text-soft)] transition-colors hover:border-[var(--vf-primary)] hover:text-[var(--vf-primary)]"
                      }
                    >
                      <span className="material-symbols-rounded text-sm">{filter.icon}</span>
                      {filter.label}
                      <span className={active ? "text-white/80" : "text-[var(--vf-text-soft)]/70"}>({filter.count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {categoryFilters.map((category) => {
                  const active = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={
                        active
                          ? "btn-primary shrink-0 rounded-full px-4 py-3"
                          : "btn-ghost shrink-0 rounded-full px-4 py-3"
                      }
                    >
                      {categoryLabels[category]}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[color-mix(in_srgb,var(--vf-surface-muted)_52%,white)] px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                    Currently Browsing
                  </p>
                  <p className="mt-2 font-semibold text-[var(--vf-text)]">
                    {activeCategoryLabel} • {activeQuickFilter.label}
                  </p>
                  <p className="mt-2 leading-7 text-soft">
                    {query.trim()
                      ? `Showing ${filtered.length} dish${filtered.length === 1 ? "" : "es"} for "${query}".`
                      : categoryDescriptions[activeCategory]}
                  </p>
                </div>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-left font-semibold text-[var(--vf-primary)] hover:underline sm:text-right"
                  >
                    Clear Active Filters
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 sm:mt-10">
        <div className="page-shell">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">Menu Results</p>
              <h2 className="heading-display mt-2 text-3xl font-bold text-[var(--vf-text)] sm:text-4xl">
                {activeCategoryLabel}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-soft sm:text-base">
                {query.trim()
                  ? `Search results tailored to "${query}" across the VISEMFOOD menu.`
                  : "Image-led dishes designed to make browsing fast, warm, and appetite-building."}
              </p>
            </div>
            <div className="inline-flex items-center rounded-full border border-[var(--vf-border-soft)] bg-[color-mix(in_srgb,var(--vf-surface-card)_88%,white)] px-4 py-2 text-sm font-semibold text-[var(--vf-text)]">
              {filtered.length} dish{filtered.length === 1 ? "" : "es"}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="card-surface mt-8 max-w-2xl p-8 text-center sm:mx-auto sm:p-10">
              <h3 className="heading-display text-3xl font-bold text-[var(--vf-text)]">No dishes matched your filters</h3>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                Try broadening your search, selecting a different category, or resetting the quick filters to see more of the menu.
              </p>
              <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="site-grid mt-8 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-10 sm:mt-12">
        <div className="page-shell">
          <div className="rounded-[calc(var(--vf-radius-lg)+0.25rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-card)] px-6 py-8 shadow-[var(--vf-shadow-soft)] sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm leading-8 text-soft sm:text-lg">
                  Large gathering coming up? Switch to trays and coolers or send a catering inquiry for more tailored hospitality support.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link to="/trays-coolers" className="btn-ghost w-full sm:w-auto">
                  View Trays & Coolers
                </Link>
                <Link to="/catering" className="btn-secondary w-full sm:w-auto">
                  Explore Catering
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
