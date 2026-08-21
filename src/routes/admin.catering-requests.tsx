import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { buildMeta } from "@/lib/meta";
import { cateringRequests } from "@/data/mock";

export const Route = createFileRoute("/admin/catering-requests")({
  head: () =>
    buildMeta({
      title: "Catering Requests | VISEMFOOD Admin",
      description: "Management table for premium catering inquiries with interactive filtering and status chips.",
    }),
  component: CateringRequestsAdminPage,
});

function CateringRequestsAdminPage() {
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () => cateringRequests.filter((item) => status === "All" || item.status === status),
    [status],
  );

  return (
    <section className="space-y-6">
      <SectionHeading eyebrow="Admin" title="Catering requests management" as="h1" />
      <div className="card-surface flex flex-wrap gap-3 p-4">
        {["All", "New", "Quoted", "Confirmed", "Closed"].map((item) => (
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
          { key: "client", header: "Client", cell: (row) => row.client },
          { key: "eventType", header: "Event", cell: (row) => row.eventType },
          { key: "guests", header: "Guests", cell: (row) => row.guests },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <StatusChip tone={row.status === "Confirmed" ? "success" : row.status === "Quoted" ? "warning" : "neutral"}>
                {row.status}
              </StatusChip>
            ),
          },
        ]}
      />
    </section>
  );
}
