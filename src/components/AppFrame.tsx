import { Link, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AdminSummaryProvider } from "@/contexts/admin-summary-context";
import { AdminAuthProvider } from "@/contexts/admin-auth-context";
import { CartProvider, useCart } from "@/contexts/cart-context";
import { SiteDataProvider } from "@/contexts/site-data-context";
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

  return (
    <>
      {!isAdmin ? <SiteHeader /> : null}
      <div className={!isAdmin && cartCount > 0 ? "pb-24 md:pb-0" : undefined}>{children}</div>
      {!isAdmin ? <SiteFooter /> : null}
      {!isAdmin && cartCount > 0 ? (
        <div className="mobile-action-bar md:hidden">
          <div className="page-shell">
            <Link to="/menu" className="btn-primary w-full rounded-full">
              View Order - {cartCount} item{cartCount === 1 ? "" : "s"}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
