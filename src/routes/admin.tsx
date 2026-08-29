import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopBar } from "@/components/AdminTopBar";
import { useAdminAuth } from "@/contexts/admin-auth-context";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { isAuthenticated, isHydrated, logout } = useAdminAuth();

  useEffect(() => {
    if (!isHydrated || isAuthenticated || typeof window === "undefined") {
      return;
    }

    const redirect = encodeURIComponent(window.location.pathname);
    window.location.replace(`/login?redirect=${redirect}`);
  }, [isAuthenticated, isHydrated]);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out", {
        description: "Your admin session has been closed securely.",
      });
    } catch {
      toast.error("Logout incomplete", {
        description: "The local session was cleared, but the server could not be reached.",
      });
    } finally {
      setIsNavOpen(false);
      if (typeof window !== "undefined") {
        window.location.assign("/login?redirect=%2Fadmin");
      }
    }
  }

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--vf-surface)] px-4">
        <div className="card-surface max-w-md p-8 text-center">
          <p className="heading-display text-3xl font-bold text-[var(--vf-primary)]">Loading Admin Suite</p>
          <p className="mt-3 text-sm leading-7 text-soft">
            Preparing the operations dashboard and checking your access.
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--vf-surface)] px-4">
        <div className="card-surface max-w-md p-8 text-center">
          <p className="heading-display text-3xl font-bold text-[var(--vf-primary)]">Redirecting to Login</p>
          <p className="mt-3 text-sm leading-7 text-soft">
            The admin suite is protected. You will be taken to the login screen in a moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--vf-surface)]">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64 xl:w-72">
        <AdminSidebar onLogout={handleLogout} />
      </div>

      {isNavOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation overlay"
            className="fixed inset-0 z-40 bg-[var(--vf-backdrop)] backdrop-blur-sm"
            onClick={() => setIsNavOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[18.5rem] max-w-[calc(100vw-1rem)] overflow-y-auto bg-[var(--vf-surface)] shadow-[var(--vf-shadow-float)]">
            <AdminSidebar onNavigate={() => setIsNavOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64 xl:pl-72">
        <AdminTopBar
          isNavOpen={isNavOpen}
          onOpenNav={() => setIsNavOpen((current) => !current)}
          onLogout={handleLogout}
        />

        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
