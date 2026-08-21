import { useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { CartProvider } from "@/contexts/cart-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  return (
    <CartProvider>
      {!isAdmin ? <SiteHeader /> : null}
      {children}
      {!isAdmin ? <SiteFooter /> : null}
      <Toaster richColors position="top-right" />
    </CartProvider>
  );
}
