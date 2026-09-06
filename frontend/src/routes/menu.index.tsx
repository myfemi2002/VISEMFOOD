import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SearchField } from "@/components/SearchField";
import { useSiteData } from "@/contexts/site-data-context";
import { buildMeta } from "@/lib/meta";

const allCategoryDescription = "Every bowl, platter, tray, cooler, and premium staple in the VISEMFOOD kitchen.";
const menuHeroImage = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80";

export const Route = createFileRoute("/menu/")({
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

      return categoryMatch && queryMatch;
    });
  }, [activeCategory, deferredQuery, products]);

  const activeCategoryMeta = categoryFilters.find((category) => category.id === activeCategory) ?? categoryFilters[0];
  const activeCategoryLabel = activeCategoryMeta.label;
  const hasActiveFilters = activeCategory !== "all" || query.trim() !== "";
  const dishCountLabel = `${filtered.length} dish${filtered.length === 1 ? "" : "es"}`;

  const isCatalogLoading = status === "loading" && products.length === 0;
  const hasCatalogError = status === "error" && products.length === 0;

  function resetFilters() {
    setActiveCategory("all");
    setQuery("");
  }

  return (
    <main className="pb-8 pt-6 sm:pt-8 lg:pt-10">
      <section>
        <div className="page-shell">
          <div className="floating-surface relative overflow-hidden">
            <div className="pointer-events-none absolute -left-10 top-5 h-28 w-28 rounded-full bg-[var(--vf-primary-light)] opacity-75 blur-3xl" />
            <div className="pointer-events-none absolute right-6 top-0 h-36 w-36 rounded-full bg-[var(--vf-secondary-light)] opacity-55 blur-3xl" />

            <div className="relative p-4 sm:p-5 lg:p-6">
              <div className="grid gap-3 lg:gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.82fr)_auto] xl:items-end">
                <SearchField
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search dishes, categories, serving sizes, or tags"
                  ariaLabel="Search menu items"
                  label="Search The Kitchen"
                />

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
                  disabled={!hasActiveFilters}
                >
                  <span className="material-symbols-rounded text-base">refresh</span>
                  Reset Filters
                </button>
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
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 sm:mt-8">
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
                Try broadening your search, selecting a different category, or resetting the filters to see more of the menu.
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
