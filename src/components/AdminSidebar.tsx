import { Link, useRouterState } from "@tanstack/react-router";
import { cateringRequests } from "@/data/mock";
import { useAdminAuth } from "@/contexts/admin-auth-context";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/bulk-orders", label: "Bulk Orders", icon: "inventory_2" },
  { to: "/admin/catering-requests", label: "Catering", icon: "restaurant" },
  { to: "/admin/catalog", label: "Catalog", icon: "menu_book" },
  { to: "/admin/analytics", label: "Analytics", icon: "monitoring" },
] as const;

export function AdminSidebar({
  onNavigate,
  onLogout,
}: {
  onNavigate?: () => void;
  onLogout?: () => void;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useAdminAuth();
  const pendingInquiries = cateringRequests.filter(
    (request) => request.status === "New" || request.status === "Quoted",
  ).length;

  return (
    <aside className="flex h-full min-h-[100dvh] flex-col border-r border-[var(--vf-border-soft)] bg-[color-mix(in_srgb,var(--vf-surface-card)_92%,var(--vf-surface)_8%)] shadow-[var(--vf-shadow-soft)]">
      <div className="border-b border-[var(--vf-border-soft)] px-6 pb-5 pt-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--vf-primary)] text-white shadow-[var(--vf-shadow-soft)]">
            <span className="material-symbols-rounded text-[22px]">restaurant</span>
          </div>
          <div>
            <p className="heading-display text-3xl font-bold leading-none text-[var(--vf-secondary)]">VISEMFOOD</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
              Admin Suite
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-2 pt-5">
        <Link
          to="/admin/catering-requests"
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--vf-primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--vf-shadow-soft)] transition-colors hover:bg-[var(--vf-primary-soft)]"
        >
          <span className="material-symbols-rounded text-[18px]">add</span>
          New Catering Quote
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
        {adminLinks.map((item) => {
          const isActive = pathname === item.to || (item.to === "/admin" && pathname === "/admin/");

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={
                isActive
                  ? "flex w-full items-center justify-between rounded-xl bg-[var(--vf-primary-light)] px-4 py-3 text-left text-sm font-bold text-[var(--vf-primary)] shadow-[var(--vf-shadow-soft)]"
                  : "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--vf-text-soft)] transition-colors hover:bg-[var(--vf-surface-muted)] hover:text-[var(--vf-text)]"
              }
            >
              <span className="flex items-center gap-3.5">
                <span className="material-symbols-rounded text-[21px]">{item.icon}</span>
                <span>{item.label}</span>
              </span>

              {item.to === "/admin/catering-requests" && pendingInquiries > 0 ? (
                <span className="rounded-full bg-[var(--vf-primary)] px-2 py-0.5 text-[11px] font-bold text-white">
                  {pendingInquiries}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
        <div className="rounded-[calc(var(--vf-radius-md)+2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-4">
          <p className="text-sm font-bold text-[var(--vf-text)]">{user?.name ?? "Admin"}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">
            {user?.role ?? "Operations"}
          </p>
        </div>

        <div className="mt-3 space-y-1">
          <Link
            to="/contact"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-[var(--vf-text-soft)] transition-colors hover:bg-[var(--vf-surface-muted)] hover:text-[var(--vf-text)]"
          >
            <span className="material-symbols-rounded text-[18px]">help</span>
            Support & Contact
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-[var(--vf-danger)] transition-colors hover:bg-[var(--vf-danger-soft)]"
          >
            <span className="material-symbols-rounded text-[18px]">logout</span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
