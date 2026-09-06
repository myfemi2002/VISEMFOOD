import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SearchField } from "@/components/SearchField";
import { StatusChip } from "@/components/StatusChip";
import { useCart } from "@/contexts/cart-context";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { getMediaAltText, getMediaVariantUrl } from "@/lib/media";
import { buildMeta } from "@/lib/meta";
import { fetchProducts, getProductTone, type Product, type ProductVariant } from "@/lib/visemfood-api";

type OfferingFilter = "all" | "bowls" | "trays" | "coolers" | "hosting";
type OfferingCategory = Exclude<OfferingFilter, "all">;
type CatalogStatus = "loading" | "ready" | "error";

type BulkOffering = {
  id: number;
  slug: string;
  name: string;
  category: OfferingCategory;
  kindLabel: string;
  badge: string;
  price: number;
  servingRange: string;
  description: string;
  image: string;
  imageAlt: string;
  tags: string[];
  notes: string[];
  product: Product;
};

const traysHeroImage = "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1400&q=80";
const catalogProductTypes = ["bowl", "tray", "cooler", "hosting_pack"] as const;
const filterOptions: Array<{ id: OfferingFilter; label: string }> = [
  { id: "all", label: "All Offerings" },
  { id: "bowls", label: "Bowls" },
  { id: "trays", label: "Signature Trays" },
  { id: "coolers", label: "Event Coolers" },
  { id: "hosting", label: "Hosting Packs" },
];

export const Route = createFileRoute("/trays-coolers")({
  head: () =>
    buildMeta({
      title: "Bowls, Trays & Coolers | VISEMFOOD",
      description:
        "Explore premium VISEMFOOD bowls, signature trays, event coolers, and hosting-ready packages powered by the live catalog.",
      image: traysHeroImage,
    }),
  component: TraysCoolersPage,
});

function TraysCoolersPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<CatalogStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<OfferingFilter>("all");
  const [query, setQuery] = useState("");
  const featuredCardRef = useRef<HTMLElement | null>(null);
  const [featuredRailHeight, setFeaturedRailHeight] = useState<number | null>(null);

  async function refreshCatalog() {
    setStatus("loading");

    try {
      const result = await fetchProducts({
        productType: [...catalogProductTypes],
        perPage: 48,
        availableOnly: true,
      });
      setProducts(result.items);
      setError(null);
      setStatus("ready");
    } catch (nextError) {
      setProducts([]);
      setError(getErrorMessage(nextError, "Unable to load bowls, trays, and coolers right now."));
      setStatus("error");
    }
  }

  useEffect(() => {
    void refreshCatalog();
  }, []);

  const offerings = useMemo<BulkOffering[]>(() => {
    return products
      .map(toBulkOffering)
      .filter((offering): offering is BulkOffering => offering !== null)
      .sort((left, right) => {
        return Number(right.product.featured) - Number(left.product.featured) ||
          left.product.sortOrder - right.product.sortOrder ||
          left.name.localeCompare(right.name);
      });
  }, [products]);

  const counts = useMemo(() => {
    return offerings.reduce<Record<OfferingCategory, number>>(
      (result, offering) => ({
        ...result,
        [offering.category]: result[offering.category] + 1,
      }),
      {
        bowls: 0,
        trays: 0,
        coolers: 0,
        hosting: 0,
      },
    );
  }, [offerings]);

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

  const showFeaturedLayout = query.trim() === "" && filtered.length > 0 && featuredOffering !== undefined;
  const isCatalogLoading = status === "loading" && offerings.length === 0;
  const hasCatalogError = status === "error" && offerings.length === 0;

  useEffect(() => {
    if (!showFeaturedLayout || !featuredOffering) {
      setFeaturedRailHeight(null);
      return;
    }

    const node = featuredCardRef.current;

    if (!node) {
      return;
    }

    const updateHeight = () => {
      setFeaturedRailHeight(Math.round(node.getBoundingClientRect().height));
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight);

      return () => {
        window.removeEventListener("resize", updateHeight);
      };
    }

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(node);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [featuredOffering, showFeaturedLayout]);

  function resetFilters() {
    setActiveFilter("all");
    setQuery("");
  }

  function handleQuickAdd(product: Product) {
    const selectedVariant = getDefaultOrderVariant(product);
    const isUnavailable =
      !product.isOrderable ||
      product.availability === "Sold Out" ||
      selectedVariant?.availabilityStatus === "unavailable";

    if (isUnavailable) {
      return;
    }

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      displayPrice: selectedVariant?.effectivePrice ?? getStartingPrice(product),
      currencyCode: product.currencyCode,
      image:
        getMediaVariantUrl(product.primaryImage, "medium") ||
        getMediaVariantUrl(product.primaryImage, "thumbnail") ||
        product.image,
    });
  }

  function renderExploreLink(offering: BulkOffering, compact = false) {
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
    <main className="pb-10 pt-6 sm:pt-8 lg:pt-10">
      <section>
        <div className="page-shell">
          <div className="card-surface space-y-4 p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_auto] lg:items-center">
              <SearchField
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search bowls, trays, coolers, serving sizes, or hosting notes"
                ariaLabel="Search bowls, trays and coolers"
              />

              <button type="button" className="btn-primary w-full lg:w-auto" onClick={() => void refreshCatalog()}>
                <span className="material-symbols-rounded text-base">refresh</span>
                Refresh
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {filterOptions.map((option) => {
                const count = option.id === "all" ? offerings.length : counts[option.id];
                const active = option.id === activeFilter;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActiveFilter(option.id)}
                    className={
                      active
                        ? "rounded-full bg-[var(--vf-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--vf-shadow-soft)]"
                        : "rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--vf-text-soft)] transition-colors hover:border-[var(--vf-primary)] hover:text-[var(--vf-primary)]"
                    }
                  >
                    {option.label} <span className="opacity-75">({count})</span>
                  </button>
                );
              })}
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
                  Live trays, coolers, bowls and hosting formats built from the VISEMFOOD catalog
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-7 text-soft">
                Compare formats by product type, then open the shared product detail view for full gallery, live variants, and cart-ready ordering.
              </p>
            </div>

            <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
              <article ref={featuredCardRef} className="card-surface self-start overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={featuredOffering.image}
                    alt={featuredOffering.imageAlt}
                    className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[470px]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full bg-[var(--vf-primary)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white">
                    {featuredOffering.badge}
                  </div>
                  <div className="absolute right-5 top-5">
                    <StatusChip tone={getProductTone(featuredOffering.product.availability)}>
                      {featuredOffering.product.availability}
                    </StatusChip>
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
                        {formatCurrency(featuredOffering.price, { currency: featuredOffering.product.currencyCode })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        className="btn-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!featuredOffering.product.isOrderable}
                        onClick={() => handleQuickAdd(featuredOffering.product)}
                      >
                        {featuredOffering.product.isOrderable ? "Add Default Option" : "Unavailable"}
                      </button>
                      {renderExploreLink(featuredOffering)}
                    </div>
                  </div>
                </div>
              </article>

              <div
                className="featured-side-scroll flex min-h-0 min-w-0 flex-col gap-6"
                style={
                  featuredRailHeight
                    ? ({ "--vf-featured-side-height": `${featuredRailHeight}px` } as CSSProperties)
                    : undefined
                }
              >
                {sideStack.map((offering) => (
                  <article key={offering.id} className="card-surface shrink-0 overflow-hidden">
                    <img
                      src={offering.image}
                      alt={offering.imageAlt}
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
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-[var(--vf-text-soft)]">{offering.servingRange}</p>
                        <StatusChip tone={getProductTone(offering.product.availability)}>{offering.product.availability}</StatusChip>
                      </div>

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
                              {formatCurrency(offering.price, { currency: offering.product.currencyCode })}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn-primary min-h-[2.5rem] rounded-[var(--vf-radius-md)] px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={!offering.product.isOrderable}
                            onClick={() => handleQuickAdd(offering.product)}
                          >
                            {offering.product.isOrderable ? "Add" : "Unavailable"}
                          </button>
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
                  ? "Browse live bowls, trays, coolers and hosting-ready packages"
                  : filterOptions.find((option) => option.id === activeFilter)?.label}
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-soft">
              {filtered.length} of {offerings.length} live catalog formats currently match your filter and search.
            </p>
          </div>

          {isCatalogLoading ? (
            <div className="card-surface mt-8 max-w-2xl p-8 text-center sm:mx-auto sm:p-10">
              <h3 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Loading bowls, trays and coolers</h3>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                We&apos;re checking the live VISEMFOOD catalog for the latest package formats, media, and variant pricing.
              </p>
            </div>
          ) : hasCatalogError ? (
            <div className="card-surface mt-8 max-w-2xl p-8 text-center sm:mx-auto sm:p-10">
              <h3 className="heading-display text-3xl font-bold text-[var(--vf-text)]">
                Unable to load bowls, trays and coolers right now
              </h3>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                {error ?? "The live package catalog is temporarily unavailable. Please try again."}
              </p>
              <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={() => void refreshCatalog()}>
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-surface mt-8 max-w-2xl p-8 text-center sm:mx-auto sm:p-10">
              <h3 className="heading-display text-3xl font-bold text-[var(--vf-text)]">
                No live offerings matched your search
              </h3>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                Try a broader search term or return to all offerings to see the latest bowls, trays, coolers, and hosting packs again.
              </p>
              <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          ) : showFeaturedLayout && gridOfferings.length === 0 ? (
            <div className="card-surface mt-8 max-w-3xl p-8 text-center sm:mx-auto sm:p-10">
              <h3 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Everything in this filter is featured above</h3>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                Open the highlighted products to review their live galleries, active variants, and add the right tray or cooler size to your cart.
              </p>
            </div>
          ) : (
            <div className="site-grid mt-8 md:grid-cols-2 xl:grid-cols-3">
              {(showFeaturedLayout ? gridOfferings : filtered).map((offering) => (
                <ProductCard key={offering.id} product={offering.product} />
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
                  Use this page to compare live tray and cooler formats, then move into the inquiry flow when you need more custom planning, service support or event-specific recommendations.
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

function toBulkOffering(product: Product): BulkOffering | null {
  const category = getOfferingCategory(product);

  if (!category) {
    return null;
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category,
    kindLabel: getKindLabel(category),
    badge: getBadge(product, category),
    price: getStartingPrice(product),
    servingRange: getDefaultOrderVariant(product)?.portionLabel ?? product.servingSize,
    description: product.shortDescription || product.description,
    image:
      getMediaVariantUrl(product.primaryImage, "large") ||
      getMediaVariantUrl(product.primaryImage, "medium") ||
      product.image,
    imageAlt: getMediaAltText(product.primaryImage, product.name),
    tags: product.tags.length > 0 ? product.tags.slice(0, 3) : getDefaultTags(category),
    notes: getOfferingNotes(product, category),
    product,
  };
}

function getOfferingCategory(product: Product): OfferingCategory | null {
  if (product.productType === "bowl") {
    return "bowls";
  }

  if (product.productType === "tray") {
    return "trays";
  }

  if (product.productType === "cooler") {
    return "coolers";
  }

  if (product.productType === "hosting_pack") {
    return "hosting";
  }

  return null;
}

function getKindLabel(category: OfferingCategory) {
  switch (category) {
    case "bowls":
      return "Premium Bowl";
    case "trays":
      return "Signature Tray";
    case "coolers":
      return "Event Cooler";
    case "hosting":
      return "Hosting Pack";
  }
}

function getBadge(product: Product, category: OfferingCategory) {
  if (product.availability === "Limited") {
    return "Limited Batch";
  }

  if (product.featured) {
    switch (category) {
      case "bowls":
        return "Quick Favorite";
      case "trays":
        return "Celebration Tray";
      case "coolers":
        return "Bulk Service";
      case "hosting":
        return "Hosting Favorite";
    }
  }

  return product.tags[0] ?? "Live Catalog";
}

function getDefaultTags(category: OfferingCategory) {
  switch (category) {
    case "bowls":
      return ["Direct ordering ready", "Comfort classic"];
    case "trays":
      return ["Family ready", "Party support"];
    case "coolers":
      return ["Bulk service", "Large format"];
    case "hosting":
      return ["Event essential", "Hosting ready"];
  }
}

function getOfferingNotes(product: Product, category: OfferingCategory) {
  const structuredNotes = (product.orderingNotes ?? "")
    .split(/\r?\n|•|,/)
    .map((note) => note.trim())
    .filter(Boolean);

  if (structuredNotes.length > 0) {
    return Array.from(new Set(structuredNotes)).slice(0, 3);
  }

  switch (category) {
    case "bowls":
      return ["Direct ordering ready", "Balanced for smaller gatherings", "Pairs well with proteins"];
    case "trays":
      return ["Advance notice recommended", "Pickup or delivery support", "Designed for larger tables"];
    case "coolers":
      return ["Best for longer service windows", "Ideal for teams and event crews", "Advance scheduling recommended"];
    case "hosting":
      return ["Pairs well with trays and bowls", "Useful for meetings and gifting", "Built for quick hospitality planning"];
  }
}

function getStartingPrice(product: Product) {
  const availableVariantPrices = product.variants
    .filter((variant) => variant.availabilityStatus !== "unavailable")
    .map((variant) => variant.effectivePrice);

  if (availableVariantPrices.length > 0) {
    return Math.min(...availableVariantPrices);
  }

  return product.effectivePrice || product.price || product.basePrice;
}

function getDefaultOrderVariant(product: Product): ProductVariant | null {
  return (
    product.variants.find((variant) => variant.id === product.defaultVariant?.id) ??
    product.defaultVariant ??
    product.variants.find((variant) => variant.availabilityStatus !== "unavailable") ??
    product.variants[0] ??
    null
  );
}


