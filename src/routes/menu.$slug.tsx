import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { QuantityStepper } from "@/components/QuantityStepper";
import { StatusChip } from "@/components/StatusChip";
import { buildMeta } from "@/lib/meta";
import { products } from "@/data/mock";
import { useCart } from "@/contexts/cart-context";

export const Route = createFileRoute("/menu/$slug")({
  head: ({ params }) => {
    const product = products.find((item) => item.slug === params.slug);
    return buildMeta({
      title: `${product?.name ?? "Menu Item"} | VISEMFOOD`,
      description: product?.description ?? "Premium VISEMFOOD menu item.",
      image: product?.image,
    });
  },
  component: ProductDetailPage,
  notFoundComponent: ProductNotFound,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const product = products.find((item) => item.slug === slug);
  const { items, addItem, setItemQuantity } = useCart();

  if (!product) {
    throw notFound();
  }

  const existing = items.find((item) => item.slug === product.slug);
  const isSoldOut = product.availability === "Sold Out";

  return (
    <main className="section-gap">
      <div className="page-shell grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:gap-10">
        <div className="floating-surface overflow-hidden p-3 sm:p-4">
          <img
            src={product.image}
            alt={product.name}
            className="h-[320px] w-full rounded-[var(--vf-radius-lg)] object-cover sm:h-[420px] lg:h-full"
          />
        </div>
        <div className="space-y-5 sm:space-y-6">
          <StatusChip tone="olive">{product.category}</StatusChip>
          <h1 className="heading-display text-4xl font-bold sm:text-5xl">{product.name}</h1>
          <p className="text-2xl font-bold text-[var(--vf-primary)]">NGN {product.price.toLocaleString()}</p>
          <p className="text-base leading-8 text-soft">{product.description}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-surface p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-text-soft)]">Serving</p>
              <p className="mt-3 text-soft">{product.servingSize}</p>
            </div>
            <div className="card-surface p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-text-soft)]">Availability</p>
              <p className="mt-3 text-soft">{product.availability}</p>
            </div>
          </div>
          <div className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <button
              type="button"
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
              {isSoldOut ? "Unavailable" : "Add to cart"}
            </button>
            <QuantityStepper
              value={existing?.quantity ?? 0}
              onChange={(value) => setItemQuantity(product.slug, value)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductNotFound() {
  return (
    <main className="section-gap">
      <div className="page-shell">
        <article className="card-surface space-y-4 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vf-tertiary)]">Menu Item Not Found</p>
          <h1 className="heading-display text-3xl font-bold sm:text-4xl">That dish is no longer in the catalog.</h1>
          <p className="text-soft">Return to the menu to explore the current VISEMFOOD selection.</p>
          <Link to="/menu" className="btn-primary w-full sm:w-fit">
            Back to Menu
          </Link>
        </article>
      </div>
    </main>
  );
}
