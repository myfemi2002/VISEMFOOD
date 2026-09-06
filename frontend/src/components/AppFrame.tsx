import { Link, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AdminSummaryProvider } from "@/contexts/admin-summary-context";
import { AdminAuthProvider } from "@/contexts/admin-auth-context";
import { CartProvider, useCart } from "@/contexts/cart-context";
import { SiteDataProvider, useSiteData } from "@/contexts/site-data-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminSummaryProvider>
        <SiteDataProvider>
          <CartProvider>
            <AppChrome>{children}</AppChrome>
            <Toaster richColors position="top-right" />
          </CartProvider>
        </SiteDataProvider>
      </AdminSummaryProvider>
    </AdminAuthProvider>
  );
}

function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  const { cartCount } = useCart();
  const { status: siteStatus, error: siteError, refresh } = useSiteData();

  return (
    <>
      {!isAdmin ? <SiteHeader /> : null}
      {!isAdmin && siteStatus === "error" && siteError ? (
        <div className="border-b border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)]">
          <div className="page-shell flex flex-col gap-3 py-3 text-sm text-[var(--vf-text)] sm:flex-row sm:items-center sm:justify-between">
            <p>{siteError}</p>
            <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => void refresh()}>
              Retry
            </button>
          </div>
        </div>
      ) : null}
      <div className={!isAdmin && cartCount > 0 ? "pb-24 md:pb-0" : undefined}>{children}</div>
      {!isAdmin ? <SiteFooter /> : null}
      {!isAdmin && cartCount > 0 && pathname !== "/cart" ? (
        <div className="mobile-action-bar md:hidden">
          <div className="page-shell">
            <Link to="/cart" className="btn-primary w-full rounded-full">
              View Order - {cartCount} item{cartCount === 1 ? "" : "s"}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
