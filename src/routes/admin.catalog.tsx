import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { buildMeta } from "@/lib/meta";
import { categoryFilters, products } from "@/data/mock";

export const Route = createFileRoute("/admin/catalog")({
  head: () =>
    buildMeta({
      title: "Catalog | VISEMFOOD Admin",
      description: "Catalog and inventory screen driven by typed mock product data.",
    }),
  component: CatalogAdminPage,
});

function CatalogAdminPage() {
  const [category, setCategory] = useState<(typeof categoryFilters)[number]>("All");
  const rows = useMemo(
    () => products.filter((item) => category === "All" || item.category === category),
    [category],
  );

  return (
    <section className="space-y-6">
      <SectionHeading eyebrow="Admin" title="Product catalog & inventory" as="h1" />
      <div className="card-surface flex flex-wrap gap-3 p-4">
        {categoryFilters.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "btn-primary" : "btn-ghost"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: "name", header: "Product", cell: (row) => row.name },
          { key: "category", header: "Category", cell: (row) => row.category },
          { key: "price", header: "Price", cell: (row) => `NGN ${row.price.toLocaleString()}` },
          { key: "servingSize", header: "Serving", cell: (row) => row.servingSize },
          {
            key: "availability",
            header: "Availability",
            cell: (row) => (
              <StatusChip tone={row.availability === "Available" ? "success" : row.availability === "Limited" ? "warning" : "danger"}>
                {row.availability}
              </StatusChip>
            ),
          },
        ]}
      />
    </section>
  );
}
