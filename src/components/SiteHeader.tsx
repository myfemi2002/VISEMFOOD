import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/cart-context";

const nav = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/trays-coolers", label: "Bowls, Trays & Coolers" },
  { to: "/catering", label: "Catering" },
  { to: "/our-story", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="surface-overlay border-soft sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="page-shell flex items-center justify-between gap-3 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="heading-display text-2xl font-bold text-[var(--vf-primary)] sm:text-3xl">
              VISEMFOOD
            </Link>
            <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vf-text-soft)] xl:block">
              Authentic African Food
            </p>
          </div>

          <nav className="hidden items-center gap-1 text-sm font-semibold text-[var(--vf-text-soft)] lg:flex">
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

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/menu" className="btn-primary rounded-full">
              Order Now
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/menu" className="btn-primary rounded-full px-4 text-sm">
              Order Now
            </Link>
            <button
              type="button"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              className="surface-overlay-strong border-soft inline-flex h-12 w-12 items-center justify-center rounded-full border"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span className="material-symbols-rounded">{isMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="drawer-backdrop z-60"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="drawer-panel floating-surface">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="heading-display text-3xl font-bold text-[var(--vf-primary)]">VISEMFOOD</p>
                <p className="mt-2 text-sm text-soft">Freshly prepared meals, trays, and catering.</p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                className="surface-overlay-strong border-soft inline-flex h-11 w-11 items-center justify-center rounded-full border"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              <Link to="/menu" className="btn-primary w-full justify-between rounded-[var(--vf-radius-md)]">
                <span>Order Now</span>
                <span className="material-symbols-rounded text-base">arrow_forward</span>
              </Link>
              <div className="surface-overlay-strong border-soft rounded-[var(--vf-radius-md)] border px-4 py-3 text-sm text-soft">
                Cart items: <span className="font-semibold text-[var(--vf-text)]">{cartCount}</span>
              </div>
            </div>

            <nav className="mt-6 grid gap-2">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    pathname === item.to
                      ? "btn-primary w-full justify-between rounded-[var(--vf-radius-md)]"
                      : "surface-overlay-strong border-soft flex min-h-12 w-full items-center justify-between rounded-[var(--vf-radius-md)] border px-4 py-3 text-base font-semibold"
                  }
                >
                  <span>{item.label}</span>
                  <span className="material-symbols-rounded text-base">chevron_right</span>
                </Link>
              ))}
              <Link
                to="/delivery"
                className="surface-overlay-strong border-soft flex min-h-12 w-full items-center justify-between rounded-[var(--vf-radius-md)] border px-4 py-3 text-base font-semibold"
              >
                <span>Delivery</span>
                <span className="material-symbols-rounded text-base">local_shipping</span>
              </Link>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
