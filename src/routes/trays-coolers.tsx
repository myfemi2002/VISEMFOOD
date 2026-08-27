import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { QuantityStepper } from "@/components/QuantityStepper";
import { buildMeta } from "@/lib/meta";
import { products, trayPackages } from "@/data/mock";
import { useCart } from "@/contexts/cart-context";

type OfferingFilter = "all" | "bowls" | "trays" | "coolers" | "hosting";

type BulkOffering = {
  id: string;
  slug: string;
  name: string;
  category: Exclude<OfferingFilter, "all">;
  kindLabel: string;
  badge: string;
  price: number;
  servingRange: string;
  description: string;
  image: string;
  tags: string[];
  notes: string[];
  source: "product" | "package";
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const Route = createFileRoute("/trays-coolers")({
  head: () =>
    buildMeta({
      title: "Bowls, Trays & Coolers | VISEMFOOD",
      description:
        "Explore premium VISEMFOOD bowls, signature trays, event coolers, and hosting-ready packages with responsive quantity controls.",
      image: trayPackages[0]?.image,
    }),
  component: TraysCoolersPage,
});

function TraysCoolersPage() {
  const { bulkQuantities, setBulkQuantity } = useCart();
  const [activeFilter, setActiveFilter] = useState<OfferingFilter>("all");
  const [query, setQuery] = useState("");

  const offerings = useMemo<BulkOffering[]>(() => {
    const signatureBowl = products.find((product) => product.slug === "signature-jollof-rice");
    const egusiBowl = products.find((product) => product.slug === "egusi-soup-bowl");
    const smallChops = products.find((product) => product.slug === "cocktail-small-chops-box");
    const grilledPlatter = products.find((product) => product.slug === "grilled-chicken-platter");
    const signatureTray = trayPackages.find((item) => item.type === "Tray") ?? trayPackages[0];
    const eventCooler = trayPackages.find((item) => item.type === "Cooler") ?? trayPackages[1] ?? trayPackages[0];

    const result: BulkOffering[] = [];

    if (signatureBowl) {
      result.push({
        id: signatureBowl.id,
        slug: signatureBowl.slug,
        name: signatureBowl.name,
        category: "bowls",
        kindLabel: "Premium Bowl",
        badge: "Quick Favorite",
        price: signatureBowl.price,
        servingRange: signatureBowl.servingSize,
        description: signatureBowl.description,
        image: signatureBowl.image,
        tags: signatureBowl.tags ?? ["Single order"],
        notes: ["Direct ordering ready", "Strong for lunch or gifting", "Pairs well with proteins"],
        source: "product",
      });
    }

    if (egusiBowl) {
      result.push({
        id: egusiBowl.id,
        slug: egusiBowl.slug,
        name: egusiBowl.name,
        category: "bowls",
        kindLabel: "Shared Bowl",
        badge: "Comfort Classic",
        price: egusiBowl.price,
        servingRange: egusiBowl.servingSize,
        description: egusiBowl.description,
        image: egusiBowl.image,
        tags: egusiBowl.tags ?? ["Shared bowl"],
        notes: ["Warm, comforting service", "Ideal for home-style dining", "Limited batches available"],
        source: "product",
      });
    }

    if (signatureTray) {
      result.push({
        id: signatureTray.id,
        slug: signatureTray.slug,
        name: signatureTray.name,
        category: "trays",
        kindLabel: "Signature Tray",
        badge: "Celebration Tray",
        price: signatureTray.price,
        servingRange: signatureTray.servingRange,
        description: signatureTray.shortDescription,
        image: signatureTray.image,
        tags: ["Family ready", "Event support", signatureTray.type],
        notes: signatureTray.notes,
        source: "package",
      });
    }

    if (eventCooler) {
      result.push({
        id: eventCooler.id,
        slug: eventCooler.slug,
        name: eventCooler.name,
        category: "coolers",
        kindLabel: "Event Cooler",
        badge: "Bulk Service",
        price: eventCooler.price,
        servingRange: eventCooler.servingRange,
        description: eventCooler.shortDescription,
        image: eventCooler.image,
        tags: ["Team orders", "Long-form service", eventCooler.type],
        notes: eventCooler.notes,
        source: "package",
      });
    }

    if (smallChops) {
      result.push({
        id: smallChops.id,
        slug: smallChops.slug,
        name: smallChops.name,
        category: "hosting",
        kindLabel: "Hosting Pack",
        badge: "Party Essential",
        price: smallChops.price,
        servingRange: smallChops.servingSize,
        description: smallChops.description,
        image: smallChops.image,
        tags: smallChops.tags ?? ["Shared box"],
        notes: ["Great for meetings and events", "Finger food format", "Easy to pair with trays"],
        source: "product",
      });
    }

    if (grilledPlatter) {
      result.push({
        id: grilledPlatter.id,
        slug: grilledPlatter.slug,
        name: grilledPlatter.name,
        category: "hosting",
        kindLabel: "Protein Share",
        badge: "Hosting Favorite",
        price: grilledPlatter.price,
        servingRange: grilledPlatter.servingSize,
        description: grilledPlatter.description,
        image: grilledPlatter.image,
        tags: grilledPlatter.tags ?? ["Private dining"],
        notes: ["Pairs with rice and trays", "Private dinner ready", "Strong table presence"],
        source: "product",
      });
    }

    return result;
  }, []);

  const filterOptions: Array<{ id: OfferingFilter; label: string }> = [
    { id: "all", label: "All Offerings" },
    { id: "bowls", label: "Bowls" },
    { id: "trays", label: "Signature Trays" },
    { id: "coolers", label: "Event Coolers" },
    { id: "hosting", label: "Hosting Packs" },
  ];

  const filtered = useMemo(() => {
    return offerings.filter((offering) => {
      const matchesFilter = activeFilter === "all" || offering.category === activeFilter;
      const matchesQuery =
        query.trim() === "" ||
        `${offering.name} ${offering.description} ${offering.kindLabel} ${offering.servingRange} ${offering.tags.join(" ")} ${offering.notes.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, offerings, query]);

  const counts = useMemo(
    () => ({
      all: offerings.length,
      bowls: offerings.filter((offering) => offering.category === "bowls").length,
      trays: offerings.filter((offering) => offering.category === "trays").length,
      coolers: offerings.filter((offering) => offering.category === "coolers").length,
      hosting: offerings.filter((offering) => offering.category === "hosting").length,
    }),
    [offerings],
  );

  const featuredOffering =
    filtered.find((offering) => offering.category === "trays") ??
    filtered.find((offering) => offering.category === "coolers") ??
    filtered[0];

  const sideStack = featuredOffering
    ? filtered.filter((offering) => offering.id !== featuredOffering.id).slice(0, 2)
    : [];

  const gridOfferings = featuredOffering
    ? filtered.filter(
        (offering) =>
          offering.id !== featuredOffering.id && !sideStack.some((stackItem) => stackItem.id === offering.id),
      )
    : filtered;

  const showFeaturedLayout =
    query.trim() === "" &&
    filtered.length > 0 &&
    featuredOffering !== undefined &&
    (activeFilter === "all" || activeFilter === "trays" || activeFilter === "coolers" || activeFilter === "hosting");

  function resetFilters() {
    setActiveFilter("all");
    setQuery("");
  }

  function renderExploreLink(offering: BulkOffering, compact = false) {
    if (offering.source === "product") {
      return (
        <Link
          to="/menu/$slug"
          params={{ slug: offering.slug }}
          className={compact ? "btn-secondary w-full" : "btn-secondary w-full sm:w-auto"}
        >
          View Details
        </Link>
      );
    }

    return (
      <Link to="/catering/inquiry" className={compact ? "btn-secondary w-full" : "btn-secondary w-full sm:w-auto"}>
        Request Package
      </Link>
    );
  }

  return (
    <main className="section-gap pt-8 sm:pt-10 lg:pt-12">
      <section>
        <div className="page-shell relative overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.3rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] px-6 py-10 shadow-[var(--vf-shadow-soft)] sm:px-8 sm:py-12 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(126,154,84,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(107,69,48,0.12),transparent_32%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.48fr)] xl:items-end">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--vf-tertiary)_12%,white)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-tertiary)]">
                <span className="material-symbols-rounded text-base">celebration</span>
                Event Catering Simplified
              </div>

              <h1 className="heading-display mt-5 text-5xl font-bold leading-[1.05] text-[var(--vf-text)] sm:text-6xl lg:text-7xl">
                Bowls, trays and coolers that elevate every gathering.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-soft sm:text-lg sm:leading-9">
                From intimate family dinners to office lunches and large celebrations, VISEMFOOD packages African favorites into formats that are easy to compare, easy to request, and designed to look generous on every table.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {filterOptions.map((option) => {
                  const count = counts[option.id];
                  const active = activeFilter === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setActiveFilter(option.id)}
                      className={
                        active
                          ? "btn-primary rounded-full px-5 py-3"
                          : "btn-ghost rounded-full px-5 py-3"
                      }
                    >
                      {option.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="floating-surface p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">
                Order Planning Notes
              </p>
              <div className="mt-4 space-y-4 text-sm leading-7 text-soft">
                <p>Save quantities locally with the stepper as you compare bowls, trays, coolers and hosting packs.</p>
                <p>Product-backed items take you to the menu detail route, while larger packages route into the catering inquiry flow.</p>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <Link to="/delivery" className="btn-ghost w-full">
                  Delivery Information
                </Link>
                <Link to="/catering/inquiry" className="btn-secondary w-full">
                  Request Catering
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="page-shell">
          <div className="card-surface p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_auto] lg:items-center">
              <label className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
                  <span className="material-symbols-rounded text-xl">search</span>
                </span>
                <input
                  className="field pl-12"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search bowls, packages, serving sizes, or hosting notes"
                  aria-label="Search bowls, trays and coolers"
                />
              </label>

              <button type="button" className="btn-primary w-full lg:w-auto" onClick={resetFilters}>
                <span className="material-symbols-rounded text-base">refresh</span>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {showFeaturedLayout && featuredOffering ? (
        <section className="mt-10">
          <div className="page-shell">
            <div className="flex flex-col gap-2 border-b border-[var(--vf-border-soft)] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">Featured Collection</p>
                <h2 className="heading-display mt-2 text-3xl font-bold text-[var(--vf-text)] sm:text-4xl">
                  Signature offerings for hosting, gifting and celebration service
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-7 text-soft">
                Use the category chips above to focus on bowls, trays, coolers or hosting packs without leaving the page.
              </p>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
              <article className="card-surface overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={featuredOffering.image}
                    alt={featuredOffering.name}
                    className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[470px]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full bg-[var(--vf-primary)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white">
                    {featuredOffering.badge}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/85">
                      {featuredOffering.kindLabel}
                    </p>
                    <h3 className="heading-display mt-2 text-3xl font-bold text-white sm:text-4xl">
                      {featuredOffering.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/80">{featuredOffering.servingRange}</p>
                  </div>
                </div>

                <div className="space-y-6 p-6 sm:p-8">
                  <p className="text-base leading-8 text-soft">{featuredOffering.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {featuredOffering.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--vf-text-soft)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <ul className="grid gap-3 sm:grid-cols-2">
                    {featuredOffering.notes.map((note) => (
                      <li
                        key={note}
                        className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] px-4 py-3 text-sm leading-6 text-soft"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col gap-5 border-t border-[var(--vf-border-soft)] pt-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--vf-text-soft)]">
                        Starting from
                      </p>
                      <p className="mt-2 text-3xl font-bold text-[var(--vf-secondary)]">
                        {currency.format(featuredOffering.price)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <QuantityStepper
                        value={bulkQuantities[featuredOffering.slug] ?? 0}
                        onChange={(value) => setBulkQuantity(featuredOffering.slug, value)}
                      />
                      {renderExploreLink(featuredOffering)}
                    </div>
                  </div>
                </div>
              </article>

              <div className="flex flex-col gap-6">
                {sideStack.map((offering) => (
                  <article key={offering.id} className="card-surface overflow-hidden">
                    <img
                      src={offering.image}
                      alt={offering.name}
                      className="h-52 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-tertiary)]">
                            {offering.kindLabel}
                          </p>
                          <h3 className="heading-display mt-2 text-2xl font-bold text-[var(--vf-text)]">
                            {offering.name}
                          </h3>
                        </div>
                        <span className="rounded-full bg-[var(--vf-primary-light)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--vf-primary)]">
                          {offering.badge}
                        </span>
                      </div>

                      <p className="text-sm leading-7 text-soft">{offering.description}</p>
                      <p className="text-sm font-medium text-[var(--vf-text-soft)]">{offering.servingRange}</p>

                      <div className="flex flex-wrap gap-2">
                        {offering.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[var(--vf-surface-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--vf-text-soft)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col gap-4 border-t border-[var(--vf-border-soft)] pt-4">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--vf-text-soft)]">
                              Starting from
                            </p>
                            <p className="mt-1 text-2xl font-bold text-[var(--vf-primary)]">
                              {currency.format(offering.price)}
                            </p>
                          </div>
                          <QuantityStepper
                            value={bulkQuantities[offering.slug] ?? 0}
                            onChange={(value) => setBulkQuantity(offering.slug, value)}
                          />
                        </div>

                        {renderExploreLink(offering, true)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="page-shell">
          <div className="flex flex-col gap-2 border-b border-[var(--vf-border-soft)] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">More Offerings</p>
              <h2 className="heading-display mt-2 text-3xl font-bold text-[var(--vf-text)] sm:text-4xl">
                {activeFilter === "all"
                  ? "Browse bowls, coolers and hosting-ready packages"
                  : filterOptions.find((option) => option.id === activeFilter)?.label}
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-soft">
              {filtered.length} of {offerings.length} packages currently match your filter and search.
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="card-surface mt-8 max-w-2xl p-8 text-center sm:mx-auto sm:p-10">
              <h3 className="heading-display text-3xl font-bold text-[var(--vf-text)]">
                No packages matched your search
              </h3>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                Try a broader search term or return to all offerings to see bowls, trays, coolers and hosting packs again.
              </p>
              <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="site-grid mt-8 md:grid-cols-2 xl:grid-cols-3">
              {(showFeaturedLayout ? gridOfferings : filtered).map((offering) => (
                <article key={offering.id} className="card-surface flex h-full flex-col overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img
                      src={offering.image}
                      alt={offering.name}
                      className="h-60 w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-[var(--vf-overlay-strong)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--vf-primary)] shadow-[var(--vf-shadow-soft)]">
                      {offering.badge}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-tertiary)]">
                          {offering.kindLabel}
                        </p>
                        <h3 className="heading-display mt-2 text-2xl font-bold text-[var(--vf-text)]">
                          {offering.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm leading-7 text-soft">{offering.description}</p>
                    <p className="text-sm font-medium text-[var(--vf-text-soft)]">{offering.servingRange}</p>

                    <div className="flex flex-wrap gap-2">
                      {offering.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--vf-text-soft)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <ul className="space-y-2 text-sm leading-6 text-soft">
                      {offering.notes.slice(0, 3).map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>

                    <div className="mt-auto flex flex-col gap-4 border-t border-[var(--vf-border-soft)] pt-4">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--vf-text-soft)]">
                            Starting from
                          </p>
                          <p className="mt-1 text-2xl font-bold text-[var(--vf-secondary)]">
                            {currency.format(offering.price)}
                          </p>
                        </div>
                        <QuantityStepper
                          value={bulkQuantities[offering.slug] ?? 0}
                          onChange={(value) => setBulkQuantity(offering.slug, value)}
                        />
                      </div>

                      {renderExploreLink(offering, true)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="page-shell">
          <div
            className="overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.25rem)] border border-[var(--vf-footer-line)] px-6 py-8 text-white shadow-[var(--vf-shadow-float)] sm:px-8 sm:py-10 lg:px-10"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(107, 69, 48, 0.28), transparent 30%), radial-gradient(circle at bottom left, rgba(126, 154, 84, 0.22), transparent 36%), linear-gradient(180deg, var(--vf-footer-bg-soft), var(--vf-footer-bg))",
            }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-footer-accent)]">
                  Weddings, Banquets and Office Hospitality
                </p>
                <h2 className="heading-display mt-3 text-4xl font-bold text-white sm:text-5xl">
                  Planning a larger guest list or a more tailored event menu?
                </h2>
                <p className="mt-4 text-sm leading-8 text-white/78 sm:text-base">
                  Use this page to compare formats, then move into the inquiry flow when you need more custom planning, service support or event-specific recommendations.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link to="/catering/inquiry" className="btn-primary w-full sm:w-auto">
                  Request Catering Proposal
                </Link>
                <Link
                  to="/contact"
                  className="btn-secondary w-full border-[var(--vf-dark-border)] text-[var(--vf-on-dark)] hover:bg-[var(--vf-footer-hover)] sm:w-auto"
                >
                  Contact VISEMFOOD
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
