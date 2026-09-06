import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCart } from "@/contexts/cart-context";
import { StatusChip } from "@/components/StatusChip";
import { formatCurrency } from "@/lib/currency";
import { getMediaAltText, getMediaVariantUrl } from "@/lib/media";
import { getProductTone, type Product } from "@/lib/visemfood-api";

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const selectedVariant = product.defaultVariant ?? product.variants[0] ?? null;
  const displayPrice = selectedVariant?.effectivePrice ?? product.price;
  const isSoldOut = !product.isOrderable || product.availability === "Sold Out";
  const hasMultipleVariants = product.variants.length > 1;
  const featureLabel = product.featured ? "Chef's Pick" : product.tags?.[0];
  const tone = getProductTone(product.availability);
  const cardImageUrl =
    getMediaVariantUrl(product.primaryImage, "medium") ||
    getMediaVariantUrl(product.primaryImage, "thumbnail") ||
    product.image;
  const cardImageAlt = getMediaAltText(product.primaryImage, product.name);

  function addProductToCart() {
    if (isSoldOut || hasMultipleVariants) {
      return;
    }

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      displayPrice,
      currencyCode: product.currencyCode,
      image: cardImageUrl,
    });

    toast.success(`${product.name} added to your order`, {
      description: selectedVariant ? `${selectedVariant.name} added with USD pricing.` : "Saved to your cart with live catalog pricing.",
    });
    void navigate({ to: "/cart" });
  }

  return (
    <article className="card-surface group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-56 overflow-hidden sm:h-60 lg:h-64">
        <Link to="/menu/$slug" params={{ slug: product.slug }} aria-label={`Open ${product.name} details`}>
          <img
            src={cardImageUrl}
            alt={cardImageAlt}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            loading="lazy"
          />
        </Link>

        <div className="absolute left-4 top-4 flex gap-2">
          {featureLabel ? (
            <span className="rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-elevated)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--vf-secondary)] shadow-[var(--vf-shadow-soft)]">
              {featureLabel}
            </span>
          ) : null}
        </div>

        <div className="absolute right-4 top-4">
          <StatusChip tone={tone}>{product.availability}</StatusChip>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-6 text-white sm:px-5 sm:pb-5 sm:pt-7"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, var(--vf-dark-scrim-soft) 18%, var(--vf-dark-scrim-strong) 100%)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-footer-accent)]">
            {product.category}
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--vf-on-dark-soft)]">{product.servingSize}</p>
        </div>
      </div>

      <div className="flex grow flex-col p-4 sm:p-5">
        <div>
          <Link
            to="/menu/$slug"
            params={{ slug: product.slug }}
            className="heading-display block text-[1.14rem] font-bold leading-[1.02] text-[var(--vf-text)] transition-colors hover:text-[var(--vf-secondary)] sm:text-[1.24rem] lg:text-[1.36rem]"
            aria-label={`Open ${product.name} details`}
          >
            {product.name}
          </Link>
          <p className="mt-3 text-[0.95rem] leading-7 text-soft">{product.shortDescription}</p>
        </div>

        {product.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-auto border-t border-[var(--vf-border-soft)] pt-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Starting From</p>
              <p className="mt-1 text-[1.8rem] font-bold text-[var(--vf-secondary)] sm:text-[1.95rem]">
                {formatCurrency(displayPrice, { currency: product.currencyCode })}
              </p>
            </div>

            <Link
              to="/menu/$slug"
              params={{ slug: product.slug }}
              aria-label={`Open ${product.name} details`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--vf-border-soft)] bg-[var(--vf-surface-strong)] text-[var(--vf-secondary)] transition-all hover:border-[var(--vf-primary)] hover:bg-[var(--vf-primary)] hover:text-white"
            >
              <span className="material-symbols-rounded">open_in_new</span>
            </Link>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <Link
              to="/menu/$slug"
              params={{ slug: product.slug }}
              className="inline-flex items-center gap-1 text-[0.94rem] font-bold leading-6 text-[var(--vf-primary)] hover:underline"
            >
              Customize & Order
              <span className="material-symbols-rounded text-base">chevron_right</span>
            </Link>

            {hasMultipleVariants ? (
              <Link
                to="/menu/$slug"
                params={{ slug: product.slug }}
                className="btn-primary min-h-[2.65rem] min-w-[7rem] rounded-[var(--vf-radius-md)] px-4 py-2 text-[0.84rem] leading-[1.1] tracking-[0.01em] text-center"
              >
                Add to Order
              </Link>
            ) : (
              <button
                type="button"
                className="btn-primary min-h-[2.65rem] min-w-[7rem] rounded-[var(--vf-radius-md)] px-4 py-2 text-[0.84rem] leading-[1.1] tracking-[0.01em] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSoldOut}
                onClick={addProductToCart}
              >
                {isSoldOut ? "Unavailable" : "Add to Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
