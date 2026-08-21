import { Link, useRouterState } from "@tanstack/react-router";

const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/catering-requests", label: "Catering Requests" },
  { to: "/admin/bulk-orders", label: "Bulk Orders" },
  { to: "/admin/catalog", label: "Catalog" },
  { to: "/admin/analytics", label: "Analytics" },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside className="floating-surface p-6">
      <p className="heading-display text-3xl font-bold text-[var(--vf-primary)]">VISEMFOOD</p>
      <p className="mt-2 text-sm text-soft">Admin Operations Suite</p>
      <nav className="mt-8 space-y-2">
        {adminLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={
              pathname === item.to
                ? "btn-primary flex w-full justify-start"
                : "btn-ghost flex w-full justify-start"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
