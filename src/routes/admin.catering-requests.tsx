import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { getErrorMessage } from "@/lib/api";
import { buildMeta } from "@/lib/meta";
import {
  fallbackAdminCateringInquiries,
  fetchAdminCateringInquiries,
  getCateringTone,
  type AdminCateringInquiry,
} from "@/lib/visemfood-api";

const statusOptions = [
  { value: "all", label: "All Requests" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const Route = createFileRoute("/admin/catering-requests")({
  head: () =>
    buildMeta({
      title: "Catering Requests | VISEMFOOD Admin",
      description: "Management table for premium catering inquiries backed by live Laravel records.",
    }),
  component: CateringRequestsAdminPage,
});

function CateringRequestsAdminPage() {
  const [status, setStatus] = useState<(typeof statusOptions)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<AdminCateringInquiry[]>(fallbackAdminCateringInquiries);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        const result = await fetchAdminCateringInquiries({
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
          setError(getErrorMessage(nextError, "Unable to load catering requests right now."));
        }
      }
    }

    void loadRequests();

    return () => {
      cancelled = true;
    };
  }, [search, status]);

  const summary = useMemo(
    () => ({
      open: rows.filter((request) => ["new", "contacted", "quoted"].includes(request.statusValue)).length,
      confirmed: rows.filter((request) => request.statusValue === "confirmed").length,
      guests: rows.reduce((sum, request) => sum + request.guests, 0),
    }),
    [rows],
  );

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Admin"
        title="Catering requests management"
        body="Follow each inquiry from first outreach through quoting, confirmation and event completion."
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
              placeholder="Search reference, client, event or phone"
              aria-label="Search catering requests"
            />
          </label>

          <label className="relative block">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as (typeof statusOptions)[number]["value"])}
              className="select-field appearance-none pr-12"
              aria-label="Filter by catering status"
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
          <StatusChip tone="warning">{summary.open} in progress</StatusChip>
          <StatusChip tone="success">{summary.confirmed} confirmed</StatusChip>
          <StatusChip tone="neutral">{summary.guests.toLocaleString()} projected guests</StatusChip>
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={[
          {
            key: "reference",
            header: "Reference",
            cell: (row) => (
              <div>
                <p className="font-semibold text-[var(--vf-primary)]">{row.referenceNumber}</p>
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">
                  {formatDateLabel(row.createdAt)}
                </p>
              </div>
            ),
          },
          {
            key: "client",
            header: "Client",
            cell: (row) => (
              <div>
                <p className="font-semibold text-[var(--vf-text)]">{row.client}</p>
                <p className="text-xs text-soft">{row.email || row.phone || "Contact pending"}</p>
              </div>
            ),
          },
          {
            key: "event",
            header: "Event",
            cell: (row) => (
              <div>
                <p className="font-medium text-[var(--vf-text)]">{row.eventType}</p>
                <p className="text-xs text-soft">{row.preferredService ?? "Service to be confirmed"}</p>
              </div>
            ),
          },
          {
            key: "guests",
            header: "Guests",
            cell: (row) => (
              <div>
                <p className="font-medium text-[var(--vf-text)]">{row.guests || "TBD"}</p>
                <p className="text-xs text-soft">{row.eventDate ? formatDateLabel(row.eventDate) : "Date pending"}</p>
              </div>
            ),
          },
          {
            key: "budget",
            header: "Budget",
            cell: (row) => <span className="text-sm text-[var(--vf-text)]">{row.budget || "Budget on request"}</span>,
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => <StatusChip tone={getCateringTone(row.statusValue)}>{row.status}</StatusChip>,
          },
        ]}
      />
    </section>
  );
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Awaiting date";
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
