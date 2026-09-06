import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { StatCard } from "@/components/StatCard";
import { useAdminSummary } from "@/contexts/admin-summary-context";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { buildMeta } from "@/lib/meta";
import {
  fetchAdminOrders,
  fetchAdminProducts,
  type AdminOrder,
  type Product,
} from "@/lib/visemfood-api";

export const Route = createFileRoute("/admin/analytics")({
  head: () =>
    buildMeta({
      title: "Analytics | VISEMFOOD Admin",
      description: "Analytics and reporting overview with live revenue, category mix and operational status snapshots.",
    }),
  component: AnalyticsAdminPage,
});

function AnalyticsAdminPage() {
  const { dashboard } = useAdminSummary();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalyticsData() {
      setIsLoading(true);

      try {
        const [ordersResult, productsResult] = await Promise.all([
          fetchAdminOrders({ perPage: 100 }),
          fetchAdminProducts({ perPage: 100 }),
        ]);

        if (!cancelled) {
          setOrders(ordersResult.items);
          setProducts(productsResult.items);
          setError(null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(nextError, "Unable to load analytics data right now."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalyticsData();

    return () => {
      cancelled = true;
    };
  }, []);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const currentMonthOrders = useMemo(() => {
    const now = new Date();
    const matches = orders.filter((order) => {
      const referenceDate = order.orderedAt ?? order.createdAt ?? order.preferredFulfillmentAt;

      if (!referenceDate) {
        return false;
      }

      const orderDate = new Date(referenceDate);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });

    return matches.length > 0 ? matches : orders;
  }, [orders]);

  const summary = useMemo(() => {
    const monthlyRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total, 0);
    const weeklyOrders = orders.filter((order) => {
      const referenceDate = order.orderedAt ?? order.createdAt ?? order.preferredFulfillmentAt;

      if (!referenceDate) {
        return false;
      }

      const orderDate = new Date(referenceDate);
      const daysDifference = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDifference >= 0 && daysDifference <= 7;
    }).length;
    const averageOrderValue = currentMonthOrders.length > 0 ? Math.round(monthlyRevenue / currentMonthOrders.length) : 0;
    const completedOrders = orders.filter((order) => order.status === "completed").length;
    const completedRate = orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0;
    const availableProducts = products.filter((product) => product.availability === "Available").length;
    const availabilityRate = products.length > 0 ? Math.round((availableProducts / products.length) * 100) : 0;

    return {
      monthlyRevenue,
      weeklyOrders,
      averageOrderValue,
      completedRate,
      availabilityRate,
    };
  }, [currentMonthOrders, orders, products]);

  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();

    products.forEach((product) => {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    });

    const maxCount = Math.max(...counts.values(), 1);

    return Array.from(counts.entries())
      .map(([label, value]) => ({
        label,
        value,
        width: Math.round((value / maxCount) * 100),
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5);
  }, [products]);

  const lifecycle = [
    {
      label: "WhatsApp Pending",
      value: dashboard?.stats.ordersPendingWhatsApp ?? orders.filter((order) => order.status === "whatsapp_pending").length,
    },
    {
      label: "Confirmed",
      value: dashboard?.stats.ordersConfirmed ?? orders.filter((order) => order.status === "confirmed").length,
    },
    {
      label: "Completed",
      value: dashboard?.stats.ordersCompleted ?? orders.filter((order) => order.status === "completed").length,
    },
    {
      label: "New Catering",
      value: dashboard?.stats.cateringNew ?? 0,
    },
  ];
  const maxLifecycleValue = Math.max(...lifecycle.map((item) => item.value), 1);

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Admin"
        title="Analytics & reporting"
        body={`Operational snapshot for ${monthLabel}, based on live catalog and order records.`}
        as="h1"
      />

      {error ? (
        <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
          {error}
        </div>
      ) : null}

      {isLoading && orders.length === 0 && products.length === 0 ? (
        <div className="card-surface p-6 text-sm text-soft">Loading analytics data...</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Monthly Revenue" value={formatCurrency(summary.monthlyRevenue)} note={monthLabel} />
        <StatCard label="Weekly Orders" value={`${summary.weeklyOrders}`} />
        <StatCard label="Average Order Value" value={formatCurrency(summary.averageOrderValue)} />
        <StatCard label="Completion Rate" value={`${summary.completedRate}%`} />
        <StatCard label="Menu Availability" value={`${summary.availabilityRate}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.9fr)]">
        <div className="card-surface p-6">
          <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Top categories</h2>
          <div className="mt-6 space-y-4">
            {topCategories.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[var(--vf-text)]">{item.label}</span>
                  <span className="text-[var(--vf-text-soft)]">{item.value} items</span>
                </div>
                <div className="h-3 rounded-full bg-[var(--vf-surface-muted)]">
                  <div className="h-3 rounded-full bg-[var(--vf-primary)]" style={{ width: `${item.width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">Order lifecycle</h2>
          <p className="mt-2 text-sm leading-7 text-soft">
            A quick operational view across the order queue, completed fulfilment and inbound hospitality demand.
          </p>

          <div className="mt-6 space-y-4">
            {lifecycle.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[var(--vf-text)]">{item.label}</span>
                  <span className="font-medium text-[var(--vf-text-soft)]">{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-[var(--vf-surface-muted)]">
                  <div
                    className="h-3 rounded-full bg-[var(--vf-secondary)]"
                    style={{ width: `${Math.round((item.value / maxLifecycleValue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-muted)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Unread inbox</p>
            <p className="mt-2 text-2xl font-bold text-[var(--vf-primary)]">{dashboard?.stats.contactUnread ?? 0}</p>
            <p className="mt-1 text-sm text-soft">Customer messages currently waiting for admin follow-up.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
