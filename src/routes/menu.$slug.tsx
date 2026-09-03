import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { QuantityStepper } from "@/components/QuantityStepper";
import { StatusChip } from "@/components/StatusChip";
import { useCart, type CartItemInput } from "@/contexts/cart-context";
import { getErrorMessage, isNotFoundError } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { getMediaAltText, getMediaVariantUrl } from "@/lib/media";
import { buildMeta } from "@/lib/meta";
import { fetchProductBySlug, getProductTone, type Product, type ProductVariant } from "@/lib/visemfood-api";

function slugToTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/menu/$slug")({
  head: ({ params }) =>
    buildMeta({
      title: `${slugToTitle(params.slug)} | VISEMFOOD`,
      description: "Premium VISEMFOOD catalog item with pricing, availability, media, and direct add-to-order actions.",
    }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { items, addItem, setItemQuantity } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "not-found">("loading");
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);

  async function loadProduct() {
    setStatus("loading");

    try {
      const nextProduct = await fetchProductBySlug(slug);
      setProduct(nextProduct);
      setSelectedVariantId(nextProduct.defaultVariant?.id ?? nextProduct.variants[0]?.id ?? null);
      setSelectedMediaId(nextProduct.primaryImage?.id ?? nextProduct.media[0]?.id ?? null);
      setError(null);
      setStatus("ready");
    } catch (nextError) {
      setProduct(null);
      if (isNotFoundError(nextError)) {
        setError(null);
        setStatus("not-found");
        return;
      }

      setError(getErrorMessage(nextError, "Unable to load this item right now."));
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadProduct();
  }, [slug]);

  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!product) {
      return null;
    }

    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      product.defaultVariant ??
      product.variants[0] ??
      null
    );
  }, [product, selectedVariantId]);

  const galleryAssets = useMemo(() => {
    if (!product) {
      return [];
    }

    if (product.media.length > 0) {
      return product.media;
    }

    return product.primaryImage ? [product.primaryImage] : [];
  }, [product]);

  const selectedMediaAsset = useMemo(() => {
    if (galleryAssets.length === 0) {
      return null;
    }

    return galleryAssets.find((asset) => asset.id === selectedMediaId) ?? galleryAssets[0] ?? null;
  }, [galleryAssets, selectedMediaId]);

  const detailImageUrl =
    getMediaVariantUrl(selectedMediaAsset, "large") ||
    getMediaVariantUrl(selectedMediaAsset, "medium") ||
    product?.image ||
    "";
  const detailImageAlt = getMediaAltText(selectedMediaAsset, product?.name || "Menu item");

  const activeCartTarget = product
    ? {
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
      }
    : null;

  const existingLine = activeCartTarget
    ? items.find(
        (item) =>
          item.productId === activeCartTarget.productId && item.variantId === activeCartTarget.variantId,
      )
    : null;

  const displayPrice = selectedVariant?.effectivePrice ?? product?.price ?? 0;
  const isSoldOut =
    !product ||
    !product.isOrderable ||
    product.availability === "Sold Out" ||
    selectedVariant?.availabilityStatus === "unavailable";

  function buildCartInput(): CartItemInput | null {
    if (!product) {
      return null;
    }

    return {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      displayPrice,
      currencyCode: product.currencyCode,
      image: detailImageUrl || product.image,
    };
  }

  function handleAddToCart() {
    const input = buildCartInput();

    if (!input || isSoldOut) {
      return;
    }

    addItem(input);
  }

  function handleQuantityChange(nextQuantity: number) {
    if (!activeCartTarget) {
      return;
    }

    if (nextQuantity <= 0) {
      setItemQuantity(activeCartTarget, 0);
      return;
    }

    if (!existingLine) {
      const input = buildCartInput();

      if (!input) {
        return;
      }

      addItem(input);
      if (nextQuantity > 1) {
        setItemQuantity(activeCartTarget, nextQuantity);
      }
      return;
    }

    setItemQuantity(activeCartTarget, nextQuantity);
  }

  if (!product && status === "loading") {
    return (
      <main className="section-gap">
        <div className="page-shell">
          <article className="card-surface space-y-4 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vf-primary)]">Loading Product</p>
            <h1 className="heading-display text-3xl font-bold sm:text-4xl">Preparing the latest dish details.</h1>
            <p className="text-soft">We're checking the current VISEMFOOD catalog and availability for this item.</p>
          </article>
        </div>
      </main>
    );
  }

  if (!product && status === "error") {
    return <ProductLoadError message={error} onRetry={loadProduct} />;
  }

  if (!product || status === "not-found") {
    return <ProductNotFound />;
  }

  return (
    <main className="section-gap">
      <div className="page-shell grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:gap-10">
        <div className="space-y-4">
          <div className="floating-surface overflow-hidden p-3 sm:p-4">
            <img
              src={detailImageUrl}
              alt={detailImageAlt}
              className="h-[320px] w-full rounded-[var(--vf-radius-lg)] object-cover sm:h-[420px] lg:h-[560px]"
            />
          </div>

          {galleryAssets.length > 1 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {galleryAssets.map((asset) => {
                const thumbUrl =
                  getMediaVariantUrl(asset, "thumbnail") ||
                  getMediaVariantUrl(asset, "medium") ||
                  asset.url;
                const active = asset.id === selectedMediaAsset?.id;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    className={
                      active
                        ? "overflow-hidden rounded-[var(--vf-radius-md)] border border-[var(--vf-primary)] bg-[var(--vf-primary-light)] p-1 shadow-[var(--vf-shadow-soft)]"
                        : "overflow-hidden rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-1 transition-colors hover:border-[var(--vf-primary)]"
                    }
                    onClick={() => setSelectedMediaId(asset.id)}
                    aria-label={`Preview ${getMediaAltText(asset, product.name)}`}
                  >
                    <img
                      src={thumbUrl}
                      alt={getMediaAltText(asset, product.name)}
                      className="aspect-square w-full rounded-[calc(var(--vf-radius-md)-0.3rem)] object-cover"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <div className="space-y-5 sm:space-y-6">
          <StatusChip tone="olive">{product.category}</StatusChip>
          <h1 className="heading-display text-4xl font-bold sm:text-5xl">{product.name}</h1>
          <p className="text-2xl font-bold text-[var(--vf-secondary)]">
            {formatCurrency(displayPrice, { currency: product.currencyCode })}
          </p>
          <p className="text-base leading-8 text-soft">{product.description}</p>

          {product.variants.length > 0 ? (
            <div className="card-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-text-soft)]">Choose Size</p>
                <span className="text-xs font-medium text-[var(--vf-text-muted)]">
                  {product.variants.length} option{product.variants.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {product.variants.map((variant) => {
                  const checked = selectedVariant?.id === variant.id;
                  const unavailable = variant.availabilityStatus === "unavailable";

                  return (
                    <label
                      key={variant.id}
                      className={
                        checked
                          ? "rounded-[var(--vf-radius-md)] border border-[var(--vf-primary)] bg-[var(--vf-primary-light)] p-4 shadow-[var(--vf-shadow-soft)]"
                          : "rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4 transition-colors hover:border-[var(--vf-primary)]"
                      }
                    >
                      <input
                        type="radio"
                        name="product-variant"
                        value={variant.id}
                        checked={checked}
                        disabled={unavailable}
                        onChange={() => setSelectedVariantId(variant.id)}
                        className="sr-only"
                      />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-base font-semibold text-[var(--vf-text)]">{variant.name}</p>
                          <p className="mt-1 text-sm text-soft">
                            {variant.portionLabel || variant.description || "Standard serving"}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <p className="text-lg font-bold text-[var(--vf-secondary)]">
                            {formatCurrency(variant.effectivePrice, { currency: variant.currencyCode })}
                          </p>
                          <StatusChip tone={getProductTone(product.availability)}>
                            {unavailable ? "Sold Out" : variant.availabilityStatus === "limited" ? "Limited" : "Available"}
                          </StatusChip>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-surface p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-text-soft)]">Serving</p>
              <p className="mt-3 text-soft">{selectedVariant?.portionLabel ?? product.servingSize}</p>
            </div>
            <div className="card-surface p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-text-soft)]">Availability</p>
              <div className="mt-3">
                <StatusChip tone={getProductTone(product.availability)}>{product.availability}</StatusChip>
              </div>
            </div>
          </div>
          <div className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <button
              type="button"
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              disabled={isSoldOut}
              onClick={handleAddToCart}
            >
              {isSoldOut ? "Unavailable" : "Add to cart"}
            </button>
            <QuantityStepper value={existingLine?.quantity ?? 0} onChange={handleQuantityChange} />
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductLoadError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => Promise<void>;
}) {
  return (
    <main className="section-gap">
      <div className="page-shell">
        <article className="card-surface space-y-4 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vf-warning)]">Product Unavailable</p>
          <h1 className="heading-display text-3xl font-bold sm:text-4xl">We couldn't load this catalog item right now.</h1>
          <p className="text-soft">
            {message ?? "Unable to load the latest product details at the moment. Please try again."}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn-primary w-full sm:w-fit" onClick={() => void onRetry()}>
              Retry
            </button>
            <Link to="/menu" className="btn-secondary w-full sm:w-fit">
              Back to Menu
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

function ProductNotFound() {
  return (
    <main className="section-gap">
      <div className="page-shell">
        <article className="card-surface space-y-4 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--vf-tertiary)]">Catalog Item Not Found</p>
          <h1 className="heading-display text-3xl font-bold sm:text-4xl">That item is no longer in the catalog.</h1>
          <p className="text-soft">Return to the menu to explore the current VISEMFOOD selection.</p>
          <Link to="/menu" className="btn-primary w-full sm:w-fit">
            Back to Menu
          </Link>
        </article>
      </div>
    </main>
  );
}
