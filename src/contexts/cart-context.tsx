import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  bulkQuantities: Record<string, number>;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  setItemQuantity: (slug: string, quantity: number) => void;
  setBulkQuantity: (slug: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "visemfood-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [bulkQuantities, setBulkQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as {
        items?: CartItem[];
        bulkQuantities?: Record<string, number>;
      };
      setItems(parsed.items ?? []);
      setBulkQuantities(parsed.bulkQuantities ?? {});
    } catch {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        items,
        bulkQuantities,
      }),
    );
  }, [items, bulkQuantities]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
      bulkQuantities,
      addItem: (item) => {
        setItems((current) => {
          const existing = current.find((entry) => entry.slug === item.slug);
          if (existing) {
            return current.map((entry) =>
              entry.slug === item.slug ? { ...entry, quantity: entry.quantity + 1 } : entry,
            );
          }
          return [...current, { ...item, quantity: 1 }];
        });
      },
      setItemQuantity: (slug, quantity) => {
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.slug !== slug)
            : current.map((item) => (item.slug === slug ? { ...item, quantity } : item)),
        );
      },
      setBulkQuantity: (slug, quantity) => {
        setBulkQuantities((current) => ({
          ...current,
          [slug]: Math.max(0, quantity),
        }));
      },
    }),
    [bulkQuantities, items],
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
