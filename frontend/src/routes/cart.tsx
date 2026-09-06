import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { QuantityStepper } from "@/components/QuantityStepper";
import { StatusChip } from "@/components/StatusChip";
import { useCart } from "@/contexts/cart-context";
import { getErrorMessage, getValidationMessages, isValidationError } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { buildMeta } from "@/lib/meta";
import { continueCheckoutOnWhatsApp, previewCheckout } from "@/lib/visemfood-api";
import { useSiteData } from "@/contexts/site-data-context";

export const Route = createFileRoute("/cart")({
  head: () =>
    buildMeta({
      title: "Your Order | VISEMFOOD",
      description: "Review selected dishes, adjust quantities, and continue your order on WhatsApp.",
    }),
  component: CartPage,
});

type DeliveryType = "pickup" | "delivery";

type CheckoutState = {
  orderNumber: string | null;
  currencyCode: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  estimatedTotal: number;
  lineItems: Array<{
    productId: number;
    variantId: number | null;
    unitPrice: number;
    lineTotal: number;
  }>;
  whatsappNumber: string | null;
};

function CartPage() {
  const { items, setItemQuantity, clearCart } = useCart();
  const { siteMeta } = useSiteData();
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [preferredFulfillmentAt, setPreferredFulfillmentAt] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    setCheckoutState(null);
    setCheckoutError(null);
  }, [items]);

  const localSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0),
    [items],
  );

  const activeCurrency = checkoutState?.currencyCode || items[0]?.currencyCode || siteMeta.currencyCode || "USD";
  const displaySubtotal = checkoutState?.subtotal ?? localSubtotal;
  const displayDeliveryFee = checkoutState?.deliveryFee ?? 0;
  const displayDiscount = checkoutState?.discountAmount ?? 0;
  const displayEstimatedTotal = checkoutState?.estimatedTotal ?? localSubtotal;

  const summaryItems = useMemo(() => {
    const authoritativeByKey = new Map(
      checkoutState?.lineItems.map((item) => [`${item.productId}:${item.variantId ?? "default"}`, item]) ?? [],
    );

    return items.map((item) => {
      const authoritative = authoritativeByKey.get(`${item.productId}:${item.variantId ?? "default"}`);
      const unitPrice = authoritative?.unitPrice ?? item.displayPrice;
      const lineTotal = authoritative?.lineTotal ?? unitPrice * item.quantity;

      return {
        ...item,
        unitPrice,
        lineTotal,
      };
    });
  }, [checkoutState?.lineItems, items]);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      toast.error("Your order is empty.");
      return;
    }

    if (!siteMeta.whatsappOrderingEnabled) {
      const message = "WhatsApp ordering is currently disabled. Please contact the team directly.";
      setCheckoutError(message);
      toast.error(message);
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const preview = await previewCheckout({
        customer_name: `${customerFirstName.trim()} ${customerLastName.trim()}`.trim(),
        customer_email: customerEmail.trim() || null,
        customer_phone: customerPhone.trim(),
        delivery_type: deliveryType,
        delivery_address: deliveryType === "delivery" ? deliveryAddress.trim() || null : null,
        preferred_fulfillment_at: preferredFulfillmentAt ? new Date(preferredFulfillmentAt).toISOString() : null,
        customer_notes: customerNotes.trim() || null,
        items: items.map((item) => ({
          product_id: item.productId,
          slug: item.productSlug,
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
      });

      const handoff = await continueCheckoutOnWhatsApp(preview.orderNumber);
      setCheckoutState({
        orderNumber: preview.orderNumber,
        currencyCode: preview.currencyCode,
        subtotal: preview.totals.subtotal,
        deliveryFee: preview.totals.deliveryFee,
        discountAmount: preview.totals.discountAmount,
        estimatedTotal: preview.totals.estimatedTotal,
        lineItems: preview.lineItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
        whatsappNumber: handoff.whatsappNumber,
      });
      toast.success("Preparing your WhatsApp order.", {
        description: `Reference ${preview.orderNumber} is ready.`,
      });
      clearCart();
      window.location.assign(handoff.whatsappUrl);
    } catch (error) {
      const validationMessages = isValidationError(error) ? getValidationMessages(error) : [];
      const message = validationMessages.length > 0
        ? validationMessages[0]
        : getErrorMessage(error, "Unable to prepare your order right now.");
      setCheckoutError(message);
      toast.error(message);
    } finally {
      setIsCheckingOut(false);
    }
  }

  function updateQuantity(target: { productId: number; variantId: number | null }, nextQuantity: number) {
    if (nextQuantity <= 0) {
      setItemQuantity(target, 0);
      return;
    }

    setItemQuantity(target, nextQuantity);
  }

  return (
    <main className="section-gap">
      <div className="page-shell space-y-8">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-start">
          <div className="space-y-5">
            <div className="card-surface p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--vf-primary)]">Your Order</p>
              <h1 className="heading-display mt-2 text-3xl font-bold sm:text-4xl">Order Summary</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-soft sm:text-base">
                Review the dishes you picked, adjust quantities, and continue the conversation on WhatsApp when you're ready.
              </p>
            </div>

            {checkoutError ? (
              <div className="rounded-[var(--vf-radius-lg)] border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)] shadow-[var(--vf-shadow-soft)]">
                {checkoutError}
              </div>
            ) : null}

            {items.length === 0 ? (
              <div className="card-surface p-6 text-center sm:p-8">
                <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Your order is empty.</h2>
                <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                  Browse the menu and add a dish, tray, or cooler to build your WhatsApp order summary.
                </p>
                <Link to="/menu" className="btn-primary mt-6 w-full sm:w-auto">
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {summaryItems.map((item) => (
                  <article key={item.lineKey} className="card-surface p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-24 w-full rounded-[var(--vf-radius-md)] object-cover sm:h-28 sm:w-28 sm:shrink-0"
                      />

                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="heading-display text-2xl font-bold text-[var(--vf-text)]">{item.productName}</h2>
                            <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">
                              {item.variantName ?? "Default size"}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] px-3 py-2 text-sm font-semibold text-[var(--vf-text)] transition-colors hover:border-[var(--vf-primary)] hover:text-[var(--vf-primary)]"
                            onClick={() => updateQuantity({ productId: item.productId, variantId: item.variantId }, 0)}
                          >
                            <span className="material-symbols-rounded text-[18px]">delete</span>
                            Remove
                          </button>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-soft">Unit Price</p>
                            <p className="mt-1 text-lg font-bold text-[var(--vf-secondary)]">
                              {formatCurrency(item.unitPrice, { currency: activeCurrency })}
                            </p>
                          </div>

                          <QuantityStepper
                            value={item.quantity}
                            onChange={(nextQuantity) => updateQuantity({ productId: item.productId, variantId: item.variantId }, nextQuantity)}
                          />
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--vf-border-soft)] pt-3">
                          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">Line Total</p>
                          <p className="text-lg font-bold text-[var(--vf-secondary)]">
                            {formatCurrency(item.lineTotal, { currency: activeCurrency })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="flex justify-start">
              <Link to="/menu" className="btn-ghost w-full sm:w-auto">
                Continue Shopping
              </Link>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="card-surface p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-text-soft)]">Totals</p>
                  <h2 className="heading-display mt-1 text-2xl font-bold text-[var(--vf-text)]">Estimate</h2>
                </div>
                <StatusChip tone={checkoutState ? "success" : "neutral"}>
                  {checkoutState ? "Backend total updated" : `${items.reduce((sum, item) => sum + item.quantity, 0)} items`}
                </StatusChip>
              </div>

              <div className="mt-5 space-y-3 border-t border-[var(--vf-border-soft)] pt-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-soft">Subtotal</span>
                  <span className="font-semibold text-[var(--vf-text)]">
                    {formatCurrency(displaySubtotal, { currency: activeCurrency })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-soft">Delivery Fee</span>
                  <span className="font-semibold text-[var(--vf-text)]">
                    {formatCurrency(displayDeliveryFee, { currency: activeCurrency })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-soft">Discount</span>
                  <span className="font-semibold text-[var(--vf-text)]">
                    {formatCurrency(displayDiscount, { currency: activeCurrency })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-[var(--vf-border-soft)] pt-3">
                  <span className="text-base font-semibold text-[var(--vf-text)]">Estimated Total</span>
                  <span className="text-2xl font-bold text-[var(--vf-secondary)]">
                    {formatCurrency(displayEstimatedTotal, { currency: activeCurrency })}
                  </span>
                </div>
              </div>

              {checkoutState?.orderNumber ? (
                <div className="mt-4 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-strong)] p-4 text-sm text-soft">
                  Draft reference <span className="font-semibold text-[var(--vf-text)]">{checkoutState.orderNumber}</span> is ready for WhatsApp handoff.
                </div>
              ) : null}
            </div>
          </aside>
        </section>

        <section className="card-surface p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-text-soft)]">Checkout</p>
          <h2 className="heading-display mt-1 text-2xl font-bold text-[var(--vf-text)]">Contact details</h2>
          <p className="mt-2 text-sm leading-7 text-soft">
            We'll validate the cart, prepare the WhatsApp order reference, and continue with the site owner.
          </p>

          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCheckout}>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">First Name</span>
                <input className="field" value={customerFirstName} onChange={(event) => setCustomerFirstName(event.target.value)} required />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">Last Name</span>
                <input className="field" value={customerLastName} onChange={(event) => setCustomerLastName(event.target.value)} required />
              </label>
            </div>

            <label className="block md:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">Phone Number</span>
              <input className="field" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} required />
            </label>

            <label className="block md:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">Email Address</span>
              <input className="field" type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
            </label>

            <label className="block md:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">Delivery Type</span>
              <select className="select-field" value={deliveryType} onChange={(event) => setDeliveryType(event.target.value as DeliveryType)}>
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </label>

            {deliveryType === "delivery" ? (
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">Delivery Address</span>
                <textarea
                  className="textarea-field"
                  rows={3}
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Enter the delivery address"
                  required
                />
              </label>
            ) : null}

            <label className="block md:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">Preferred Date</span>
              <input
                className="field"
                type="date"
                value={preferredFulfillmentAt}
                onChange={(event) => setPreferredFulfillmentAt(event.target.value)}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">Order Notes</span>
              <textarea
                className="textarea-field"
                rows={4}
                value={customerNotes}
                onChange={(event) => setCustomerNotes(event.target.value)}
                placeholder="Anything the team should know?"
              />
            </label>

            <div className="md:col-span-2 flex flex-col items-center">
              <button
                type="submit"
                className="btn-primary inline-flex h-9 w-auto min-w-[180px] items-center justify-center rounded-full px-6 text-sm font-semibold tracking-wide shadow-[var(--vf-shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                disabled={items.length === 0 || isCheckingOut || !siteMeta.whatsappOrderingEnabled}
              >
                {isCheckingOut ? "Preparing order..." : "Checkout"}
              </button>
              <p className="mt-3 text-center text-xs leading-6 text-soft">
                You'll continue your order on WhatsApp with the live VISEMFOOD team.
              </p>
              {!siteMeta.whatsappOrderingEnabled ? (
                <p className="mt-3 rounded-[var(--vf-radius-md)] border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-3 text-sm text-[var(--vf-text)]">
                  WhatsApp ordering is currently disabled in Site Settings.
                </p>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}





