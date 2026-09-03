import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useSiteData } from "@/contexts/site-data-context";
import { buildMeta } from "@/lib/meta";
import { type Product } from "@/lib/visemfood-api";

type QuickFilter = "all" | "featured" | "available" | "limited" | "hosting";

const allCategoryDescription = "Every bowl, platter, tray, cooler, and premium staple in the VISEMFOOD kitchen.";
const menuHeroImage = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80";

function isHostingReady(product: Product) {
  const content = `${product.name} ${product.servingSize} ${product.tags?.join(" ") ?? ""}`.toLowerCase();
  return ["party", "event", "shared", "platter", "box", "tray", "cooler"].some((keyword) => content.includes(keyword));
}

export const Route = createFileRoute("/menu")({
  head: () =>
    buildMeta({
      title: "Menu | VISEMFOOD",
      description:
        "Browse the VISEMFOOD premium African menu with refined search, category filtering, and direct ordering actions.",
      image: menuHeroImage,
    }),
  component: MenuPage,
});

function MenuPage() {
  const { categories, products, status, error, refresh } = useSiteData();
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const categoryFilters = useMemo(
    () => [
      { id: "all", label: "All Items", description: allCategoryDescription },
      ...categories.map((category) => ({
        id: category.slug,
        label: category.name,
        description: category.description || `Explore ${category.name.toLowerCase()} from the live VISEMFOOD menu.`,
      })),
    ],
    [categories],
  );

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === "all" || product.categorySlug === activeCategory;
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
  }, [activeCategory, deferredQuery, products, quickFilter]);

  const counts = useMemo(
    () => ({
      all: products.length,
      featured: products.filter((product) => product.featured || product.tags?.some((tag) => /chef/i.test(tag))).length,
      available: products.filter((product) => product.availability === "Available").length,
      limited: products.filter((product) => product.availability === "Limited").length,
      hosting: products.filter((product) => isHostingReady(product)).length,
    }),
    [products],
  );

  const quickFilters: Array<{ id: QuickFilter; label: string; icon: string; count: number }> = [
    { id: "all", label: "All Items", icon: "grid_view", count: counts.all },
    { id: "featured", label: "Chef's Picks", icon: "auto_awesome", count: counts.featured },
    { id: "available", label: "Available Today", icon: "check_circle", count: counts.available },
    { id: "limited", label: "Limited Batch", icon: "schedule", count: counts.limited },
    { id: "hosting", label: "Hosting Ready", icon: "celebration", count: counts.hosting },
  ];
  const activeQuickFilter = quickFilters.find((filter) => filter.id === quickFilter) ?? quickFilters[0];
  const activeCategoryMeta = categoryFilters.find((category) => category.id === activeCategory) ?? categoryFilters[0];
  const activeCategoryLabel = activeCategoryMeta.label;
  const hasActiveFilters = activeCategory !== "all" || query.trim() !== "" || quickFilter !== "all";
  const dishCountLabel = `${filtered.length} dish${filtered.length === 1 ? "" : "es"}`;
  const browsingDescription = query.trim()
    ? `Showing ${dishCountLabel} for "${query}".`
    : activeCategoryMeta.description;
  const isCatalogLoading = status === "loading" && products.length === 0;
  const hasCatalogError = status === "error" && products.length === 0;

  function resetFilters() {
    setActiveCategory("all");
    setQuery("");
    setQuickFilter("all");
  }

  return (
    <main className="pb-8 pt-6 sm:pt-8 lg:pt-10">
      <section>
        <div className="page-shell">
          <div className="floating-surface relative overflow-hidden">
            <div className="pointer-events-none absolute -left-10 top-5 h-28 w-28 rounded-full bg-[var(--vf-primary-light)] opacity-75 blur-3xl" />
            <div className="pointer-events-none absolute right-6 top-0 h-36 w-36 rounded-full bg-[var(--vf-secondary-light)] opacity-55 blur-3xl" />

            <div className="relative p-4 sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 border-b border-[var(--vf-border-soft)] pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Curated Menu</p>
                  <h1 className="heading-display mt-3 text-[2rem] font-bold text-[var(--vf-text)] sm:text-[2.35rem] lg:text-[2.65rem]">
                    Browse the VISEMFOOD kitchen.
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-soft sm:text-[0.98rem]">
                    Search quickly, refine by collection, and move from craving to order without friction.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[20rem]">
                  <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-elevated)] px-4 py-3 shadow-[var(--vf-shadow-soft)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Showing</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--vf-text)]">{dishCountLabel}</p>
                  </div>
                  <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-elevated)] px-4 py-3 shadow-[var(--vf-shadow-soft)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Active View</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--vf-text)]">{activeQuickFilter.label}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.82fr)_auto] xl:items-end">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                    Search The Kitchen
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--vf-text-soft)]">
                      <span className="material-symbols-rounded text-[1.15rem]">search</span>
                    </span>
                    <input
                      className="field pl-4 pr-12"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search dishes, categories, serving sizes, or tags"
                      aria-label="Search menu items"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                    Browse Collection
                  </span>
                  <select
                    className="select-field"
                    value={activeCategory}
                    onChange={(event) => setActiveCategory(event.target.value)}
                    aria-label="Filter by category"
                  >
                    {categoryFilters.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className="btn-ghost w-full rounded-[var(--vf-radius-md)] border-[var(--vf-border-strong)] bg-[var(--vf-surface-elevated)] xl:w-auto"
                  onClick={resetFilters}
                >
                  <span className="material-symbols-rounded text-base">refresh</span>
                  Reset Filters
                </button>
              </div>

              <div className="mt-5 rounded-[calc(var(--vf-radius-md)+0.125rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-elevated)] p-4 shadow-[var(--vf-shadow-soft)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Quick Filters</p>
                    <p className="mt-1 text-sm text-soft">Fast ways to narrow the menu by readiness, hosting, and favorites.</p>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full bg-[var(--vf-primary-light)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--vf-primary)]">
                    {quickFilters.length} views
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {quickFilters.map((filter) => {
                    const active = quickFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setQuickFilter(filter.id)}
                        className={
                          active
                            ? "inline-flex items-center gap-2 rounded-full border border-[var(--vf-primary)] bg-[var(--vf-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-[var(--vf-shadow-soft)]"
                            : "inline-flex items-center gap-2 rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-card)] px-4 py-2.5 text-xs font-semibold text-[var(--vf-text-soft)] transition-all hover:-translate-y-0.5 hover:border-[var(--vf-primary)] hover:text-[var(--vf-primary)]"
                        }
                      >
                        <span className="material-symbols-rounded text-sm">{filter.icon}</span>
                        {filter.label}
                        <span className={active ? "text-white/80" : "text-[var(--vf-text-soft)]/70"}>({filter.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-[calc(var(--vf-radius-md)+0.125rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-card)] p-4 shadow-[var(--vf-shadow-soft)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Collections</p>
                    <p className="mt-1 text-sm text-soft">Choose a course, bowl, tray, or hosting format.</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {categoryFilters.map((category) => {
                    const active = activeCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCategory(category.id)}
                        className={
                          active
                            ? "inline-flex shrink-0 items-center rounded-full border border-[var(--vf-primary)] bg-[var(--vf-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--vf-shadow-soft)]"
                            : "inline-flex shrink-0 items-center rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--vf-text)] transition-all hover:-translate-y-0.5 hover:border-[var(--vf-primary)] hover:text-[var(--vf-primary)]"
                        }
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-[calc(var(--vf-radius-md)+0.125rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-strong)] px-4 py-4 shadow-[var(--vf-shadow-soft)] sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Currently Browsing</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-[var(--vf-overlay-elevated)] px-3 py-1 text-xs font-semibold text-[var(--vf-text)] shadow-[var(--vf-shadow-soft)]">
                        {activeCategoryLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[var(--vf-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--vf-primary)]">
                        {activeQuickFilter.label}
                      </span>
                      {query.trim() ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--vf-secondary-light)] px-3 py-1 text-xs font-semibold text-[var(--vf-secondary)]">
                          "{query}"
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-soft">{browsingDescription}</p>
                  </div>

                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--vf-primary)] transition-colors hover:border-[var(--vf-primary)]"
                    >
                      <span className="material-symbols-rounded text-base">close</span>
                      Clear Filters
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-[var(--vf-text-muted)]">All collections are currently visible.</span>
                  )}
                </div>
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
            <div className="inline-flex items-center rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--vf-text)]">
              {dishCountLabel}
            </div>
          </div>

          {isCatalogLoading ? (
            <div className="card-surface mt-8 max-w-2xl p-8 text-center sm:mx-auto sm:p-10">
              <h3 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Loading the live menu</h3>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                We're pulling the latest categories, products, and availability from the VISEMFOOD catalog.
              </p>
            </div>
          ) : hasCatalogError ? (
            <div className="card-surface mt-8 max-w-2xl p-8 text-center sm:mx-auto sm:p-10">
              <h3 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Unable to load the menu right now</h3>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                {error ?? "The live VISEMFOOD menu is temporarily unavailable. Please try again."}
              </p>
              <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={() => void refresh()}>
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
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
