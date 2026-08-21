import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { StatCard } from "@/components/StatCard";
import { buildMeta } from "@/lib/meta";
import { analytics } from "@/data/mock";

export const Route = createFileRoute("/admin/analytics")({
  head: () =>
    buildMeta({
      title: "Analytics | VISEMFOOD Admin",
      description: "Analytics and reporting overview with revenue and category performance.",
    }),
  component: AnalyticsAdminPage,
});

function AnalyticsAdminPage() {
  return (
    <section className="space-y-6">
      <SectionHeading eyebrow="Admin" title="Analytics & reporting" as="h1" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly Revenue" value={`NGN ${analytics.revenueThisMonth.toLocaleString()}`} />
        <StatCard label="Weekly Orders" value={`${analytics.ordersThisWeek}`} />
        <StatCard label="Average Order Value" value={`NGN ${analytics.averageOrderValue.toLocaleString()}`} />
        <StatCard label="Conversion Rate" value={analytics.conversionRate} />
      </div>
      <div className="card-surface p-6">
        <h2 className="heading-display text-3xl font-bold">Top categories</h2>
        <div className="mt-6 space-y-4">
          {analytics.topCategories.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--vf-surface-muted)]">
                <div
                  className="h-3 rounded-full bg-[var(--vf-primary)]"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
