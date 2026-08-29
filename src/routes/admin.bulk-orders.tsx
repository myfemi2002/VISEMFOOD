import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { getErrorMessage } from "@/lib/api";
import { buildMeta } from "@/lib/meta";
import { fallbackAdminOrders, fetchAdminOrders, getOrderTone, type AdminOrder } from "@/lib/visemfood-api";

const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "whatsapp_pending", label: "WhatsApp Pending" },
  { value: "negotiating", label: "Negotiating" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const Route = createFileRoute("/admin/bulk-orders")({
  head: () =>
    buildMeta({
      title: "Bulk Orders | VISEMFOOD Admin",
      description: "Unified order management for WhatsApp checkout, preparation, dispatch and completion.",
    }),
  component: BulkOrdersAdminPage,
});

function BulkOrdersAdminPage() {
  const [status, setStatus] = useState<(typeof statusOptions)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<AdminOrder[]>(fallbackAdminOrders);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        const result = await fetchAdminOrders({
          status: status === "all" ? undefined : status,
          search: search.trim() || undefined,
          perPage: 100,
        });

        if (!cancelled) {
          setRows(result.items);
          setError(null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(nextError, "Unable to load the order queue right now."));
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [search, status]);

  const summary = useMemo(
    () => ({
      active: rows.filter((order) => !["completed", "cancelled"].includes(order.status)).length,
      whatsappPending: rows.filter((order) => order.status === "whatsapp_pending").length,
      totalValue: rows.reduce((sum, order) => sum + order.total, 0),
    }),
    [rows],
  );

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Admin"
        title="Order queue management"
        body="Track guest checkout records from WhatsApp handoff through preparation, fulfilment and completion."
        as="h1"
      />

      {error ? (
        <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
          {error}
        </div>
      ) : null}

      <div className="card-surface space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_260px]">
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
              <span className="material-symbols-rounded text-xl">search</span>
            </span>
            <input
              className="field pl-12"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order reference, customer, email or phone"
              aria-label="Search orders"
            />
          </label>

          <label className="relative block">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as (typeof statusOptions)[number]["value"])}
              className="select-field appearance-none pr-12"
              aria-label="Filter by order status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
              <span className="material-symbols-rounded">expand_more</span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <StatusChip tone="olive">{summary.active} active records</StatusChip>
          <StatusChip tone="warning">{summary.whatsappPending} awaiting WhatsApp follow-up</StatusChip>
          <StatusChip tone="neutral">NGN {summary.totalValue.toLocaleString()} visible queue value</StatusChip>
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={[
          {
            key: "orderNumber",
            header: "Reference",
            cell: (row) => (
              <div>
                <p className="font-semibold text-[var(--vf-primary)]">{row.orderNumber}</p>
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">
                  {formatDateLabel(row.createdAt ?? row.orderedAt)}
                </p>
              </div>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            cell: (row) => (
              <div>
                <p className="font-semibold text-[var(--vf-text)]">{row.customer}</p>
                <p className="text-xs text-soft">{row.phone || row.email || "Guest checkout"}</p>
              </div>
            ),
          },
          {
            key: "items",
            header: "Items",
            cell: (row) => (
              <div>
                <p className="font-medium text-[var(--vf-text)]">{row.leadItemLabel}</p>
                <p className="text-xs text-soft">{row.itemCount} items in cart</p>
              </div>
            ),
          },
          {
            key: "fulfillment",
            header: "Fulfillment",
            cell: (row) => (
              <div>
                <p className="font-medium capitalize text-[var(--vf-text)]">{row.deliveryType.replace(/_/g, " ")}</p>
                <p className="text-xs text-soft">{formatDateLabel(row.preferredFulfillmentAt)}</p>
              </div>
            ),
          },
          {
            key: "total",
            header: "Total",
            cell: (row) => (
              <div>
                <p className="font-semibold text-[var(--vf-text)]">NGN {row.total.toLocaleString()}</p>
                <p className="text-xs text-soft">{row.finalTotal != null ? "Final agreed total" : "Estimated total"}</p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => <StatusChip tone={getOrderTone(row.status)}>{row.statusLabel}</StatusChip>,
          },
        ]}
      />
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
