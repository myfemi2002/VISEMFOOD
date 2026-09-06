import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  lineKey: string;
  productId: number;
  productSlug: string;
  productName: string;
  variantId: number | null;
  variantName: string | null;
  displayPrice: number;
  currencyCode: string;
  quantity: number;
  image: string;
};

export type CartItemInput = Omit<CartItem, "lineKey" | "quantity">;

export type CartLineTarget = {
  productId: number;
  variantId: number | null;
};

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  addItem: (item: CartItemInput) => void;
  setItemQuantity: (target: CartLineTarget, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "visemfood-cart";
const STORAGE_VERSION = 2;

type StoredCartState = {
  version?: number;
  items?: unknown;
};

export function buildCartLineKey(productId: number, variantId: number | null) {
  return `${productId}:${variantId ?? "default"}`;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    typeof item.productId === "number" &&
    Number.isFinite(item.productId) &&
    typeof item.productSlug === "string" &&
    typeof item.productName === "string" &&
    typeof item.displayPrice === "number" &&
    Number.isFinite(item.displayPrice) &&
    typeof item.currencyCode === "string" &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    typeof item.image === "string"
  );
}

function sanitizeCartItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter(isCartItem)
    .map((item) => ({
      ...item,
      variantId: typeof item.variantId === "number" ? item.variantId : null,
      variantName: typeof item.variantName === "string" ? item.variantName : null,
      lineKey: typeof item.lineKey === "string" && item.lineKey !== "" ? item.lineKey : buildCartLineKey(item.productId, item.variantId),
      quantity: Math.max(1, Math.round(item.quantity)),
    }));
}

function createCartItem(item: CartItemInput): CartItem {
  return {
    ...item,
    lineKey: buildCartLineKey(item.productId, item.variantId),
    quantity: 1,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredCartState;
      setItems(sanitizeCartItems(parsed.version === STORAGE_VERSION ? parsed.items : []));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items,
      }),
    );
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem: (item) => {
        const nextLineKey = buildCartLineKey(item.productId, item.variantId);

        setItems((current) => {
          const existing = current.find((entry) => entry.lineKey === nextLineKey);

          if (existing) {
            return current.map((entry) =>
              entry.lineKey === nextLineKey ? { ...entry, quantity: entry.quantity + 1 } : entry,
            );
          }

          return [...current, createCartItem(item)];
        });
      },
      setItemQuantity: (target, quantity) => {
        const lineKey = buildCartLineKey(target.productId, target.variantId);

        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.lineKey !== lineKey)
            : current.map((item) => (item.lineKey === lineKey ? { ...item, quantity } : item)),
        );
      },
      clearCart: () => {
        setItems([]);
      },
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
