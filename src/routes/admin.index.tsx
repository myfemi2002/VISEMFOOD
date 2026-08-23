import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { buildMeta } from "@/lib/meta";
import { analytics, bulkOrders, cateringRequests, products } from "@/data/mock";

type Period = "Today" | "This Week" | "This Month";

export const Route = createFileRoute("/admin/")({
  head: () =>
    buildMeta({
      title: "Admin Dashboard | VISEMFOOD",
      description: "Operations overview for orders, catering requests, stock alerts, and hospitality performance.",
    }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Today");

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date("2026-08-23"));

  const metrics = useMemo(() => {
    const baseRevenue = analytics.revenueThisMonth;
    const todayRevenue = Math.round(baseRevenue / 18);
    const weekRevenue = Math.round(baseRevenue / 3.4);
    const revenue =
      selectedPeriod === "Today" ? todayRevenue : selectedPeriod === "This Week" ? weekRevenue : baseRevenue;

    const orders =
      selectedPeriod === "Today"
        ? Math.max(12, Math.round(analytics.ordersThisWeek / 3))
        : selectedPeriod === "This Week"
          ? analytics.ordersThisWeek
          : analytics.ordersThisWeek * 4;

    return {
      revenue,
      orders,
      orderLabel:
        selectedPeriod === "Today"
          ? "Orders Today"
          : selectedPeriod === "This Week"
            ? "Orders This Week"
            : "Orders This Month",
    };
  }, [selectedPeriod]);

  const pendingCateringCount = cateringRequests.filter(
    (request) => request.status === "New" || request.status === "Quoted",
  ).length;
  const activeTraysCount = bulkOrders
    .filter((order) => order.status !== "Delivered")
    .reduce((sum, order) => sum + order.quantity, 0);
  const lowStockCount = products.filter((product) => product.availability !== "Available").length;

  const liveOrders = bulkOrders.slice(0, 3);

  return (
    <section className="mx-auto max-w-[1280px] space-y-8 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="heading-display text-5xl font-bold tracking-tight text-[var(--vf-primary)]">Overview</h1>
          <p className="mt-1.5 text-base text-soft">{formattedDate}</p>
        </div>

        <div className="relative inline-block">
          <select
            id="dashboard-period-select"
            value={selectedPeriod}
            onChange={(event) => setSelectedPeriod(event.target.value as Period)}
            className="appearance-none rounded-xl border border-[var(--vf-border-soft)] bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-[var(--vf-text)] shadow-[var(--vf-shadow-soft)] outline-none transition-colors hover:bg-[var(--vf-surface)] focus:border-[var(--vf-primary)]"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
            <span className="material-symbols-rounded text-[18px]">expand_more</span>
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          icon="payments"
          accent="success"
          label="Total Sales"
          value={`NGN ${metrics.revenue.toLocaleString()}`}
          meta="+12%"
        />
        <AdminMetricCard
          icon="event"
          accent="primary"
          label="Pending Catering"
          value={`${pendingCateringCount} Requests`}
          linkTo="/admin/catering-requests"
          linkLabel="View Inquiries"
        />
        <AdminMetricCard
          icon="inventory_2"
          accent="muted"
          label="Active Bulk Orders"
          value={`${activeTraysCount} Trays & Coolers`}
          linkTo="/admin/bulk-orders"
          linkLabel="Queue View"
        />
        <AdminMetricCard
          icon="warning"
          accent="danger"
          label="Low Stock Alerts"
          value={`${lowStockCount} Items`}
          meta="Restock Needed"
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-white shadow-[var(--vf-shadow-soft)]">
          <div className="flex flex-col gap-3 border-b border-[var(--vf-border-soft)] bg-[color-mix(in_srgb,var(--vf-surface)_76%,white)] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--vf-text)]">Live Orders</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--vf-text-soft)]">
                Active preparation tickets and scheduled pickups
              </p>
            </div>
            <Link
              to="/admin/bulk-orders"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--vf-primary)]"
            >
              View All Queue
              <span className="material-symbols-rounded text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="divide-y divide-[var(--vf-border-soft)]">
            {liveOrders.map((order) => {
              const isCooler = /cooler/i.test(order.packageName);
              const badgeTone =
                order.status === "Delivered"
                  ? "success"
                  : order.status === "Prep"
                    ? "warning"
                    : "neutral";

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-[color-mix(in_srgb,var(--vf-surface)_76%,white)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] text-[var(--vf-primary)]">
                      <span className="material-symbols-rounded text-[22px]">
                        {isCooler ? "local_shipping" : "storefront"}
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[var(--vf-primary)]">{order.id}</span>
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--vf-text)]">
                          • {order.customer}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-soft">
                        {order.quantity} x {order.packageName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--vf-text)]">NGN {order.total.toLocaleString()}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">
                        Due: {order.eventDate}
                      </p>
                    </div>
                    <StatusBadge tone={badgeTone}>{order.status}</StatusBadge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-white p-6 shadow-[var(--vf-shadow-soft)]">
            <h2 className="w-fit border-b-2 border-[var(--vf-primary)] pb-1.5 text-lg font-bold text-[var(--vf-text)]">
              Quick Actions
            </h2>

            <div className="mt-4 space-y-3">
              <QuickActionLink
                to="/admin/bulk-orders"
                icon="add"
                iconTone="primary"
                title="Create Manual Order"
              />
              <QuickActionLink
                to="/admin/analytics"
                icon="download"
                iconTone="secondary"
                title="Download Kitchen Prep List"
              />
              <QuickActionLink
                to="/admin/catalog"
                icon="edit_calendar"
                iconTone="success"
                title="Update Menu Stock & Prices"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[calc(var(--vf-radius-lg)-2px)] bg-[var(--vf-primary)] p-5 text-white shadow-[var(--vf-shadow-float)]">
            <div className="absolute right-[-2.5rem] top-[-2.5rem] h-28 w-28 rounded-full bg-white/10" />
            <div className="relative flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <span className="material-symbols-rounded text-[20px]">campaign</span>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.1em]">Weekend Catering Surge</h3>
                <p className="mt-1.5 text-sm leading-6 text-white/90">
                  Expect higher preparation volume this weekend for major wedding and family gathering requests.
                  Review prep lists, staffing, and cooler inventory early.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-white p-6 shadow-[var(--vf-shadow-soft)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--vf-text)]">{metrics.orderLabel}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">
                  Current selected period
                </p>
              </div>
              <span className="text-3xl font-bold text-[var(--vf-primary)]">{metrics.orders}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminMetricCard({
  icon,
  label,
  value,
  meta,
  linkTo,
  linkLabel,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  meta?: string;
  linkTo?: "/admin/catering-requests" | "/admin/bulk-orders";
  linkLabel?: string;
  accent: "success" | "primary" | "muted" | "danger";
}) {
  const iconClass =
    accent === "danger"
      ? "bg-[var(--vf-danger-soft)] text-[var(--vf-danger)]"
      : accent === "success"
        ? "bg-[var(--vf-success-soft)] text-[var(--vf-tertiary)]"
        : accent === "primary"
          ? "bg-[color-mix(in_srgb,var(--vf-primary)_12%,white)] text-[var(--vf-primary)]"
          : "bg-[var(--vf-surface-muted)] text-[var(--vf-secondary)]";

  const wrapperClass =
    accent === "danger"
      ? "border-[color-mix(in_srgb,var(--vf-danger)_18%,white)] bg-[color-mix(in_srgb,var(--vf-danger-soft)_72%,white)]"
      : "border-[var(--vf-border-soft)] bg-white";

  return (
    <div className={`flex flex-col justify-between rounded-[calc(var(--vf-radius-lg)-2px)] border p-6 shadow-[var(--vf-shadow-soft)] ${wrapperClass}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconClass}`}>
          <span className="material-symbols-rounded text-[22px]">{icon}</span>
        </div>

        {linkTo && linkLabel ? (
          <Link to={linkTo} className="text-xs font-semibold text-[var(--vf-primary)] hover:underline">
            {linkLabel} →
          </Link>
        ) : meta ? (
          <span
            className={
              accent === "danger"
                ? "rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--vf-danger)]"
                : "rounded-md bg-[var(--vf-success-soft)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--vf-tertiary)]"
            }
          >
            {meta}
          </span>
        ) : null}
      </div>

      <div>
        <p className={`text-sm ${accent === "danger" ? "font-semibold text-[var(--vf-danger)]" : "font-medium text-soft"}`}>{label}</p>
        <h2 className="heading-display mt-1 text-4xl font-bold leading-tight text-[var(--vf-text)]">{value}</h2>
      </div>
    </div>
  );
}

function QuickActionLink({
  to,
  title,
  icon,
  iconTone,
}: {
  to: "/admin/bulk-orders" | "/admin/analytics" | "/admin/catalog";
  title: string;
  icon: string;
  iconTone: "primary" | "secondary" | "success";
}) {
  const toneClass =
    iconTone === "success"
      ? "bg-[var(--vf-success-soft)] text-[var(--vf-tertiary)]"
      : iconTone === "secondary"
        ? "bg-[color-mix(in_srgb,var(--vf-secondary)_12%,white)] text-[var(--vf-secondary)]"
        : "bg-[color-mix(in_srgb,var(--vf-primary)_10%,white)] text-[var(--vf-primary)]";

  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-[var(--vf-border-soft)] p-3.5 transition-all hover:bg-[var(--vf-surface)] hover:shadow-[var(--vf-shadow-soft)]"
    >
      <span className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClass}`}>
          <span className="material-symbols-rounded text-[18px]">{icon}</span>
        </span>
        <span className="text-sm font-semibold text-[var(--vf-text)]">{title}</span>
      </span>
      <span className="material-symbols-rounded text-[18px] text-[var(--vf-text-soft)] transition-transform group-hover:translate-x-0.5">
        chevron_right
      </span>
    </Link>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "neutral";
  children: React.ReactNode;
}) {
  const className =
    tone === "success"
      ? "bg-[var(--vf-success-soft)] text-[var(--vf-tertiary)]"
      : tone === "warning"
        ? "bg-[var(--vf-warning-soft)] text-[var(--vf-warning)]"
        : "bg-[var(--vf-secondary-soft)] text-[var(--vf-secondary)]";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${className}`}>{children}</span>;
}
