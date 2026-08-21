import { Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/data/mock";
import { StatusChip } from "@/components/StatusChip";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isSoldOut = product.availability === "Sold Out";
  const tone =
    isSoldOut
      ? "danger"
      : product.availability === "Available"
      ? "success"
      : product.availability === "Limited"
        ? "warning"
        : "danger";

  return (
    <article className="card-surface overflow-hidden">
      <Link to="/menu/$slug" params={{ slug: product.slug }}>
        <img src={product.image} alt={product.name} className="h-72 w-full object-cover" loading="lazy" />
      </Link>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-tertiary)]">
              {product.category}
            </p>
            <Link
              to="/menu/$slug"
              params={{ slug: product.slug }}
              className="heading-display mt-2 block text-3xl font-bold text-[var(--vf-text)]"
            >
              {product.name}
            </Link>
          </div>
          <StatusChip tone={tone}>{product.availability}</StatusChip>
        </div>
        <p className="text-sm leading-7 text-soft">{product.shortDescription}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-[var(--vf-primary)]">NGN {product.price.toLocaleString()}</p>
          <button
            type="button"
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
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
            <span className="material-symbols-rounded text-base">add_shopping_cart</span>
            {isSoldOut ? "Unavailable" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
