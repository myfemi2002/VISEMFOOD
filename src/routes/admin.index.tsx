import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { StatusChip } from "@/components/StatusChip";
import { useAdminSummary } from "@/contexts/admin-summary-context";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { buildMeta } from "@/lib/meta";
import {
  fetchAdminOrders,
  getOrderTone,
  type AdminOrder,
} from "@/lib/visemfood-api";

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
  const { dashboard, error: dashboardError } = useAdminSummary();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Today");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setOrdersLoading(true);

      try {
        const result = await fetchAdminOrders({ perPage: 100 });

        if (!cancelled) {
          setOrders(result.items);
          setOrdersError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setOrdersError(getErrorMessage(error, "Unable to load the latest order queue."));
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const referenceDate = order.orderedAt ?? order.createdAt ?? order.preferredFulfillmentAt;

      if (!referenceDate) {
        return selectedPeriod === "This Month";
      }

      const orderDate = new Date(referenceDate);

      if (Number.isNaN(orderDate.getTime())) {
        return false;
      }

      if (selectedPeriod === "Today") {
        return orderDate.toDateString() === now.toDateString();
      }

      if (selectedPeriod === "This Week") {
        const daysDifference = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDifference >= 0 && daysDifference <= 7;
      }

      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });
  }, [orders, selectedPeriod]);

  const metrics = useMemo(() => {
    const revenueSource = filteredOrders;
    const revenue = revenueSource.reduce((sum, order) => sum + order.total, 0);
    const orderCount = filteredOrders.length;

    return {
      revenue,
      orders: orderCount,
      orderLabel:
        selectedPeriod === "Today"
          ? "Orders Today"
          : selectedPeriod === "This Week"
            ? "Orders This Week"
            : "Orders This Month",
    };
  }, [filteredOrders, orders, selectedPeriod]);

  const pendingCateringCount =
    dashboard?.stats.cateringNew ?? 0;

  const activeOrderCount = orders.filter((order) => !["completed", "cancelled"].includes(order.status)).length;
  const lowStockCount =
    dashboard?.stats.productsTotal != null && dashboard.stats.productsAvailable != null
      ? Math.max(dashboard.stats.productsTotal - dashboard.stats.productsAvailable, 0)
      : 0;
  const liveOrders = dashboard?.recentOrders.length ? dashboard.recentOrders : orders.slice(0, 3);
  const unreadMessages = dashboard?.stats.contactUnread ?? 0;
  const latestMessage = dashboard?.recentContactMessages[0] ?? null;

  return (
    <section className="mx-auto max-w-[1280px] space-y-8 pb-8">
      {dashboardError || ordersError ? (
        <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
          {dashboardError ?? ordersError}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="heading-display text-5xl font-bold tracking-tight text-[var(--vf-secondary)]">Overview</h1>
          <p className="mt-1.5 text-base text-soft">{formattedDate}</p>
        </div>

        <div className="relative inline-block">
          <select
            id="dashboard-period-select"
            value={selectedPeriod}
            onChange={(event) => setSelectedPeriod(event.target.value as Period)}
            className="field appearance-none px-4 py-2.5 pr-10 text-sm font-semibold hover:bg-[var(--vf-surface)]"
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
          label="Estimated Sales"
          value={formatCurrency(metrics.revenue)}
          meta={selectedPeriod}
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
          label="Active Orders"
          value={`${activeOrderCount} Records`}
          linkTo="/admin/bulk-orders"
          linkLabel="Queue View"
        />
        <AdminMetricCard
          icon="warning"
          accent="danger"
          label="Low Availability"
          value={`${lowStockCount} Items`}
          meta="Review Catalog"
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-soft)]">
          <div className="flex flex-col gap-3 border-b border-[var(--vf-border-soft)] bg-[var(--vf-surface-strong)] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--vf-text)]">Live Orders</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--vf-text-soft)]">
                Active WhatsApp checkouts, preparation tickets and scheduled fulfilment
              </p>
            </div>
            <Link
              to="/admin/bulk-orders"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--vf-primary)]"
            >
              View Full Queue
              <span className="material-symbols-rounded text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="divide-y divide-[var(--vf-border-soft)]">
            {liveOrders.length === 0 ? (
              <div className="p-5 text-sm text-soft">
                {ordersLoading ? "Loading live orders..." : "No live orders are available yet."}
              </div>
            ) : null}
            {liveOrders.map((order) => (
              <div
                key={order.orderNumber}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-[var(--vf-surface-strong)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] text-[var(--vf-primary)]">
                    <span className="material-symbols-rounded text-[22px]">
                      {order.deliveryType === "delivery" ? "local_shipping" : "storefront"}
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[var(--vf-primary)]">{order.orderNumber}</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--vf-text)]">
                        / {order.customer}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-soft">{order.leadItemLabel}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--vf-text)]">{formatCurrency(order.total)}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">
                      Due: {formatDateLabel(order.preferredFulfillmentAt ?? order.createdAt)}
                    </p>
                  </div>
                  <StatusBadge tone={getOrderTone(order.status)}>{order.statusLabel}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-soft)]">
            <h2 className="w-fit border-b-2 border-[var(--vf-primary)] pb-1.5 text-lg font-bold text-[var(--vf-text)]">
              Quick Actions
            </h2>

            <div className="mt-4 space-y-3">
              <QuickActionLink
                to="/admin/bulk-orders"
                icon="receipt_long"
                iconTone="primary"
                title="Review WhatsApp Order Queue"
              />
              <QuickActionLink
                to="/admin/analytics"
                icon="insights"
                iconTone="secondary"
                title="Open Performance Snapshot"
              />
              <QuickActionLink
                to="/admin/catalog"
                icon="inventory"
                iconTone="success"
                title="Update Menu Stock & Prices"
              />
            </div>
          </div>

          <div className="dark-surface-shell relative overflow-hidden rounded-[calc(var(--vf-radius-lg)-2px)] p-5 text-white shadow-[var(--vf-shadow-float)]">
            <div className="absolute right-[-2.5rem] top-[-2.5rem] h-28 w-28 rounded-full bg-white/10" />
            <div className="relative flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <span className="material-symbols-rounded text-[20px]">mail</span>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.1em]">Unread Contact Messages</h3>
                <p className="mt-1.5 text-sm leading-6 text-white/90">
                  {unreadMessages} customer inquiries are waiting for a response from the hospitality desk.
                </p>
                {latestMessage ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.08em] text-white/70">
                    Latest: {latestMessage.name} / {latestMessage.subject}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-[calc(var(--vf-radius-lg)-2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-soft)]">
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

function formatDateLabel(value: string | null) {
  if (!value) {
    return "To be scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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
          ? "bg-[var(--vf-primary-light)] text-[var(--vf-primary)]"
          : "bg-[var(--vf-surface-muted)] text-[var(--vf-secondary)]";

  const wrapperClass =
    accent === "danger"
      ? "border-[color-mix(in_srgb,var(--vf-danger)_18%,white)] bg-[color-mix(in_srgb,var(--vf-danger-soft)_72%,white)]"
      : "border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)]";

  return (
    <div
      className={`flex flex-col justify-between rounded-[calc(var(--vf-radius-lg)-2px)] border p-6 shadow-[var(--vf-shadow-soft)] ${wrapperClass}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconClass}`}>
          <span className="material-symbols-rounded text-[22px]">{icon}</span>
        </div>

        {linkTo && linkLabel ? (
          <Link to={linkTo} className="text-xs font-semibold text-[var(--vf-primary)] hover:underline">
            {linkLabel} <span aria-hidden="true">&rarr;</span>
          </Link>
        ) : meta ? (
          <span
            className={
              accent === "danger"
                ? "rounded-md bg-[var(--vf-surface-elevated)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--vf-danger)]"
                : "rounded-md bg-[var(--vf-success-soft)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--vf-tertiary)]"
            }
          >
            {meta}
          </span>
        ) : null}
      </div>

      <div>
        <p className={`text-sm ${accent === "danger" ? "font-semibold text-[var(--vf-danger)]" : "font-medium text-soft"}`}>
          {label}
        </p>
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
        ? "bg-[var(--vf-secondary-light)] text-[var(--vf-secondary)]"
        : "bg-[var(--vf-primary-light)] text-[var(--vf-primary)]";

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
  tone: "success" | "warning" | "neutral" | "danger";
  children: React.ReactNode;
}) {
  return <StatusChip tone={tone}>{children}</StatusChip>;
}
