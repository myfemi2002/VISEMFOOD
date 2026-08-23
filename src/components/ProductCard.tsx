import { Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/data/mock";
import { StatusChip } from "@/components/StatusChip";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isSoldOut = product.availability === "Sold Out";
  const featureLabel = product.featured ? "Chef's Pick" : product.tags?.[0];
  const hasFlair = product.tags?.some((tag) => /party|event/i.test(tag));
  const tone =
    isSoldOut
      ? "danger"
      : product.availability === "Available"
        ? "success"
        : product.availability === "Limited"
          ? "warning"
          : "danger";

  return (
    <article className="card-surface group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-64 overflow-hidden sm:h-72">
        <Link to="/menu/$slug" params={{ slug: product.slug }}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            loading="lazy"
          />
        </Link>

        <div className="absolute left-4 top-4 flex gap-2">
          {featureLabel ? (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--vf-surface-card)_94%,transparent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--vf-text)] shadow-[var(--vf-shadow-soft)]">
              {featureLabel}
            </span>
          ) : null}
        </div>

        <div className="absolute right-4 top-4">
          <StatusChip tone={tone}>{product.availability}</StatusChip>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/78 via-black/24 to-transparent px-5 pb-5 pt-8 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-footer-accent)]">{product.category}</p>
          <p className="mt-2 text-sm font-medium text-white/88">{product.servingSize}</p>
        </div>
      </div>

      {hasFlair ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-28 right-5 flex h-11 w-11 items-center justify-center rounded-full shadow-lg ring-2 ring-white/70"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--vf-warning) 72%, white), color-mix(in srgb, var(--vf-primary) 76%, white))",
          }}
        >
          <span className="material-symbols-rounded text-lg text-[var(--vf-text)]">potted_plant</span>
        </div>
      ) : null}

      <div className="flex grow flex-col p-5 sm:p-6">
        <div>
          <Link
            to="/menu/$slug"
            params={{ slug: product.slug }}
            className="heading-display block text-3xl font-bold leading-tight text-[var(--vf-text)] transition-colors group-hover:text-[var(--vf-primary)]"
          >
            {product.name}
          </Link>
          <p className="mt-3 text-sm leading-7 text-soft">{product.shortDescription}</p>
        </div>

        {product.tags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--vf-border-soft)] bg-[color-mix(in_srgb,var(--vf-surface-muted)_48%,white)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--vf-text-soft)]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto border-t border-[var(--vf-border-soft)] pt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                Starting From
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--vf-text)]">NGN {product.price.toLocaleString()}</p>
            </div>

            <button
              type="button"
              aria-label={isSoldOut ? `${product.name} unavailable` : `Add ${product.name} to order`}
              disabled={isSoldOut}
              onClick={() =>
                addItem({
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--vf-border-soft)] bg-[color-mix(in_srgb,var(--vf-surface-muted)_46%,white)] text-[var(--vf-text)] transition-all hover:border-[var(--vf-primary)] hover:bg-[var(--vf-primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-rounded">{isSoldOut ? "block" : "add"}</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Link
              to="/menu/$slug"
              params={{ slug: product.slug }}
              className="inline-flex items-center gap-1 text-sm font-bold text-[var(--vf-primary)] hover:underline"
            >
              Customize & Order
              <span className="material-symbols-rounded text-base">chevron_right</span>
            </Link>

            <button
              type="button"
              className="btn-primary min-w-[134px] disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
              disabled={isSoldOut}
              onClick={() =>
                addItem({
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
            >
              {isSoldOut ? "Unavailable" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
