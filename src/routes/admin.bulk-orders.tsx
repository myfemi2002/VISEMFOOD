import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { buildMeta } from "@/lib/meta";
import { bulkOrders } from "@/data/mock";

export const Route = createFileRoute("/admin/bulk-orders")({
  head: () =>
    buildMeta({
      title: "Bulk Orders | VISEMFOOD Admin",
      description: "Bulk trays and coolers order management with status-aware rows and quick filtering.",
    }),
  component: BulkOrdersAdminPage,
});

function BulkOrdersAdminPage() {
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () => bulkOrders.filter((item) => status === "All" || item.status === status),
    [status],
  );

  return (
    <section className="space-y-6">
      <SectionHeading eyebrow="Admin" title="Bulk orders management" as="h1" />
      <div className="card-surface flex flex-wrap gap-3 p-4">
        {["All", "Pending", "Prep", "Ready", "Delivered"].map((item) => (
          <button
            key={item}
            type="button"
            className={status === item ? "btn-primary" : "btn-ghost"}
            onClick={() => setStatus(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: "id", header: "ID", cell: (row) => row.id },
          { key: "customer", header: "Customer", cell: (row) => row.customer },
          { key: "packageName", header: "Package", cell: (row) => row.packageName },
          { key: "quantity", header: "Quantity", cell: (row) => row.quantity },
          { key: "total", header: "Total", cell: (row) => `NGN ${row.total.toLocaleString()}` },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <StatusChip tone={row.status === "Delivered" ? "success" : row.status === "Prep" ? "warning" : "neutral"}>
                {row.status}
              </StatusChip>
            ),
          },
        ]}
      />
    </section>
  );
}
