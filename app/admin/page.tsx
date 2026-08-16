import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getDashboardData() {
  const cateringQuery = prisma.cateringInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  const contactQuery = prisma.contactInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  const bulkQuery = prisma.bulkOrderInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  const ordersQuery = prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  try {
    const [catering, contact, bulk, orders] = await Promise.all([
      cateringQuery,
      contactQuery,
      bulkQuery,
      ordersQuery
    ]);

    return { catering, contact, bulk, orders };
  } catch {
    return {
      catering: [] as Awaited<typeof cateringQuery>,
      contact: [] as Awaited<typeof contactQuery>,
      bulk: [] as Awaited<typeof bulkQuery>,
      orders: [] as Awaited<typeof ordersQuery>
    };
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Catering Inquiries", value: data.catering.length, href: "/admin/catering-inquiries" },
          { label: "Contact Inquiries", value: data.contact.length, href: "/admin/contact-inquiries" },
          { label: "Bulk Requests", value: data.bulk.length, href: "/admin/trays-coolers" },
          { label: "Manual Orders", value: data.orders.length, href: "/admin/orders" }
        ].map((item) => (
          <Link key={item.label} href={item.href} className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{item.label}</p>
            <p className="mt-4 font-display text-4xl text-ink">{item.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="card p-6">
          <h2 className="font-display text-2xl text-ink">Recent Catering Inquiries</h2>
          <div className="mt-5 space-y-4">
            {data.catering.map((item: (typeof data.catering)[number]) => (
              <div key={item.id} className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink-soft">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-ink">{item.fullName}</span>
                  <span>{item.status.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-1">{item.eventType}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="card p-6">
          <h2 className="font-display text-2xl text-ink">Recent Contact Inquiries</h2>
          <div className="mt-5 space-y-4">
            {data.contact.map((item: (typeof data.contact)[number]) => (
              <div key={item.id} className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink-soft">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-ink">{item.fullName}</span>
                  <span>{item.status.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-1">{item.subject}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
