import { Link, useRouterState } from "@tanstack/react-router";
import { useCart } from "@/contexts/cart-context";

const nav = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/trays-coolers", label: "Trays & Coolers" },
  { to: "/catering", label: "Catering" },
  { to: "/delivery", label: "Delivery" },
  { to: "/our-story", label: "Our Story" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { cartCount } = useCart();

  return (
    <header className="surface-overlay border-soft sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="page-shell flex flex-wrap items-center gap-4 py-4">
        <Link to="/" className="heading-display text-3xl font-bold text-[var(--vf-primary)]">
          VISEMFOOD
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-3 text-sm font-semibold text-[var(--vf-text-soft)]">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={pathname === item.to ? "btn-ghost border-soft border" : "px-3 py-2"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button type="button" className="btn-primary rounded-full">
          <span className="material-symbols-rounded">shopping_bag</span>
          Cart {cartCount > 0 ? `(${cartCount})` : ""}
        </button>
      </div>
    </header>
  );
}
