import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/StatCard";
import { SectionHeading } from "@/components/SectionHeading";
import { analytics, bulkOrders, cateringRequests, products } from "@/data/mock";
import { buildMeta } from "@/lib/meta";

export const Route = createFileRoute("/admin/")({
  head: () =>
    buildMeta({
      title: "Admin Dashboard | VISEMFOOD",
      description: "Dashboard overview with KPI cards for orders, catering requests, and revenue trends.",
    }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Dashboard Overview"
        title="Operational visibility for premium hospitality."
        body="The admin shell uses typed mock data so filters, cards, and statuses behave like a real suite from day one."
        as="h1"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue This Month" value={`NGN ${analytics.revenueThisMonth.toLocaleString()}`} />
        <StatCard label="Orders This Week" value={`${analytics.ordersThisWeek}`} />
        <StatCard label="Average Order Value" value={`NGN ${analytics.averageOrderValue.toLocaleString()}`} />
        <StatCard label="Active Catalog Items" value={`${products.length}`} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card-surface p-6">
          <h2 className="heading-display text-3xl font-bold">Recent Catering Requests</h2>
          <div className="mt-5 space-y-4">
            {cateringRequests.map((request) => (
              <div key={request.id} className="rounded-[var(--vf-radius-md)] bg-[var(--vf-surface-muted)] p-4">
                <p className="font-semibold">{request.client}</p>
                <p className="mt-1 text-sm text-soft">{request.eventType} | {request.eventDate}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card-surface p-6">
          <h2 className="heading-display text-3xl font-bold">Recent Bulk Orders</h2>
          <div className="mt-5 space-y-4">
            {bulkOrders.map((order) => (
              <div key={order.id} className="rounded-[var(--vf-radius-md)] bg-[var(--vf-surface-muted)] p-4">
                <p className="font-semibold">{order.customer}</p>
                <p className="mt-1 text-sm text-soft">{order.packageName} | Qty {order.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
