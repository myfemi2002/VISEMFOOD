import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { SearchField } from "@/components/SearchField";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusChip } from "@/components/StatusChip";
import { useAdminSummary } from "@/contexts/admin-summary-context";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { buildMeta } from "@/lib/meta";
import {
  fetchAdminCateringInquiry,
  fetchAdminCateringInquiries,
  fetchAdminCateringPackages,
  getCateringTone,
  updateAdminCateringInquiry,
  type AdminCateringInquiry,
  type CateringPackage,
} from "@/lib/visemfood-api";

const statusOptions = ["all", "new", "contacted", "quoted", "confirmed", "completed", "cancelled"] as const;

export const Route = createFileRoute("/admin/catering-requests")({
  head: () => buildMeta({ title: "Catering Inquiries | VISEMFOOD Admin", description: "Manage real catering inquiries and status updates." }),
  component: CateringRequestsAdminPage,
});

function CateringRequestsAdminPage() {
  const { refresh: refreshSummary } = useAdminSummary();
  const [rows, setRows] = useState<AdminCateringInquiry[]>([]);
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<AdminCateringInquiry | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [draftStatus, setDraftStatus] = useState("new");
  const [draftNotes, setDraftNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [detailReloadKey, setDetailReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadPackages() {
      try {
        const result = await fetchAdminCateringPackages({ perPage: 100 });
        if (!cancelled) {
          setPackages(result.items);
        }
      } catch {
        if (!cancelled) {
          setPackages([]);
        }
      }
    }
    void loadPackages();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadRequests() {
      setIsLoading(true);
      try {
        const result = await fetchAdminCateringInquiries({
          status: status === "all" ? undefined : status,
          cateringPackageId: packageFilter === "all" ? undefined : packageFilter,
          search: deferredSearch.trim() || undefined,
          perPage: 100,
        });
        if (!cancelled) {
          setRows(result.items);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setRows([]);
          setLoadError(getErrorMessage(error, "Unable to load catering inquiries right now."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void loadRequests();
    return () => {
      cancelled = true;
    };
  }, [deferredSearch, packageFilter, status]);


  useEffect(() => {
    if (selectedId === null) {
      setSelectedInquiry(null);
      setDetailError(null);
      setDraftStatus("new");
      setDraftNotes("");
      setIsDetailLoading(false);
      return;
    }

    const inquiryId = selectedId;
    let cancelled = false;

    setSelectedInquiry(null);
    setDetailError(null);
    setIsDetailLoading(true);

    async function loadDetail() {
      try {
        const inquiry = await fetchAdminCateringInquiry(inquiryId);
        if (!cancelled) {
          setSelectedInquiry(inquiry);
          setDraftStatus(inquiry.statusValue);
          setDraftNotes(inquiry.internalNotes ?? "");
        }
      } catch (error) {
        if (!cancelled) {
          setSelectedInquiry(null);
          setDetailError(getErrorMessage(error, "Unable to load the inquiry details right now."));
        }
      } finally {
        if (!cancelled) {
          setIsDetailLoading(false);
        }
      }
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [detailReloadKey, selectedId]);

  const summary = useMemo(() => ({
    open: rows.filter((row) => ["new", "contacted", "quoted"].includes(row.statusValue)).length,
    confirmed: rows.filter((row) => row.statusValue === "confirmed").length,
    guests: rows.reduce((total, row) => total + row.guests, 0),
  }), [rows]);

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedId]);

  function closeReviewModal() {
    setSelectedId(null);
    setSelectedInquiry(null);
    setDetailError(null);
    setIsDetailLoading(false);
    setDraftStatus("new");
    setDraftNotes("");
    setDetailReloadKey((value) => value + 1);
  }

  async function saveInquiry() {
    if (!selectedInquiry) {
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateAdminCateringInquiry(selectedInquiry.id, {
        status: draftStatus,
        assignedToUserId: selectedInquiry.assignedToUserId,
        internalNotes: draftNotes.trim() || null,
      });
      setSelectedInquiry(result.inquiry);
      setDraftStatus(result.inquiry.statusValue);
      setDraftNotes(result.inquiry.internalNotes ?? "");
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === result.inquiry.id
            ? {
                ...row,
                status: result.inquiry.status,
                statusValue: result.inquiry.statusValue,
                internalNotes: result.inquiry.internalNotes,
                assignedToName: result.inquiry.assignedToName,
                assignedToUserId: result.inquiry.assignedToUserId,
                updatedAt: result.inquiry.updatedAt,
              }
            : row,
        ),
      );
      await refreshSummary();
      toast.success("Catering inquiry updated", { description: result.message });
    } catch (error) {
      toast.error("Unable to update inquiry", { description: getErrorMessage(error, "Please try again.") });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <SectionHeading eyebrow="Admin" title="Catering inquiries" body="Review live catering requests, update their status, and keep internal follow-up notes in sync with the backend." as="h1" />
      {loadError ? <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">{loadError}</div> : null}
      <div className="card-surface space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <SearchField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, customer, email or event" ariaLabel="Search catering inquiries" />
          <select value={status} onChange={(event) => setStatus(event.target.value as (typeof statusOptions)[number])} className="select-field" aria-label="Filter by status">{statusOptions.map((option) => <option key={option} value={option}>{option === "all" ? "All statuses" : titleCase(option)}</option>)}</select>
          <select value={packageFilter} onChange={(event) => setPackageFilter(event.target.value)} className="select-field" aria-label="Filter by package"><option value="all">All packages</option>{packages.map((cateringPackage) => <option key={cateringPackage.id} value={String(cateringPackage.id)}>{cateringPackage.name}</option>)}</select>
          <button type="button" className="btn-ghost w-full rounded-full sm:w-auto" onClick={() => { setSearch(""); setStatus("all"); setPackageFilter("all"); }}>Reset</button>
        </div>
        <div className="flex flex-wrap gap-3"><StatusChip tone="warning">{summary.open} in progress</StatusChip><StatusChip tone="success">{summary.confirmed} confirmed</StatusChip><StatusChip tone="neutral">{summary.guests.toLocaleString()} projected guests</StatusChip></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="space-y-4">
          {isLoading && rows.length === 0 ? <div className="card-surface p-6 text-sm text-soft">Loading catering inquiries...</div> : null}
          {!isLoading && rows.length === 0 ? <div className="card-surface p-8 text-center sm:p-10"><h2 className="heading-display text-3xl font-bold text-[var(--vf-text)]">No inquiries found</h2><p className="mt-3 text-sm leading-7 text-soft sm:text-base">No catering inquiries match the current filters.</p></div> : null}
          {rows.length > 0 ? <DataTable rows={rows} columns={[
            { key: "reference", header: "Reference", cell: (row) => <div><p className="font-semibold text-[var(--vf-primary)]">{row.referenceNumber}</p><p className="text-xs uppercase tracking-[0.08em] text-[var(--vf-text-soft)]">{formatDateLabel(row.createdAt)}</p></div> },
            { key: "customer", header: "Customer", cell: (row) => <div><p className="font-semibold text-[var(--vf-text)]">{row.client}</p><p className="text-xs text-soft">{row.email || row.phone || "Contact pending"}</p></div> },
            { key: "package", header: "Package", cell: (row) => <span className="text-sm text-[var(--vf-text)]">{row.packageName ?? "Custom request"}</span> },
            { key: "event", header: "Event", cell: (row) => <div><p className="font-medium text-[var(--vf-text)]">{row.eventType}</p><p className="text-xs text-soft">{row.eventDate || "Date pending"}</p></div> },
            { key: "budget", header: "Budget", cell: (row) => <span className="text-sm text-[var(--vf-text)]">{row.budgetAmount !== null ? formatCurrency(row.budgetAmount, { currency: row.packageCurrencyCode }) : row.budget}</span> },
            { key: "status", header: "Status", cell: (row) => <StatusChip tone={getCateringTone(row.statusValue)}>{row.status}</StatusChip> },
            { key: "actions", header: "Actions", cell: (row) => <button type="button" onClick={() => setSelectedId(row.id)} className="btn-ghost rounded-full px-4 py-2 text-xs">Review</button> },
          ]} /> : null}
        </section>

        {selectedId !== null ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--vf-backdrop)] p-4 backdrop-blur-[2px]">
            <div
              className="relative flex max-h-[90vh] w-full max-w-[850px] flex-col overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.2rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-float)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="catering-inquiry-review-title"
              aria-describedby="catering-inquiry-review-description"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--vf-border-soft)] px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Catering Inquiry Review</p>
                  <h2 id="catering-inquiry-review-title" className="heading-display mt-2 text-3xl font-bold text-[var(--vf-text)]">
                    {selectedInquiry?.referenceNumber ?? "Review inquiry"}
                  </h2>
                  <p id="catering-inquiry-review-description" className="mt-2 text-sm leading-7 text-soft">
                    Customer inquiry details and internal status
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  {selectedInquiry ? <StatusChip tone={getCateringTone(draftStatus)}>{titleCase(draftStatus)}</StatusChip> : null}
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--vf-text-soft)] transition-colors hover:bg-[var(--vf-surface-muted)] hover:text-[var(--vf-text)]"
                    aria-label="Close catering inquiry review"
                  >
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                {isDetailLoading ? (
                  <div className="rounded-[var(--vf-radius-md)] bg-[var(--vf-surface)] p-4 text-sm text-soft">Loading inquiry details...</div>
                ) : null}
                {detailError ? (
                  <div className="space-y-4 rounded-[var(--vf-radius-md)] border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">
                    <p>{detailError}</p>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" className="btn-primary rounded-full px-4 py-2 text-xs" onClick={() => setDetailReloadKey((value) => value + 1)}>
                        Retry
                      </button>
                      <button type="button" className="btn-ghost rounded-full px-4 py-2 text-xs" onClick={closeReviewModal}>
                        Close
                      </button>
                    </div>
                  </div>
                ) : null}

                {!isDetailLoading && !detailError && !selectedInquiry ? (
                  <div className="rounded-[var(--vf-radius-md)] border border-dashed border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4 text-sm text-soft">
                    Select an inquiry to review customer details, package context, and internal notes.
                  </div>
                ) : null}

                {selectedInquiry ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoBlock label="Customer" value={selectedInquiry.client} supporting={selectedInquiry.email || selectedInquiry.phone || "Not provided"} />
                      <InfoBlock label="Package" value={selectedInquiry.packageName ?? "Custom request"} supporting={selectedInquiry.packageStartingPrice !== null ? `Starts ${formatCurrency(selectedInquiry.packageStartingPrice, { currency: selectedInquiry.packageCurrencyCode })}` : "No package selected"} />
                      <InfoBlock label="Event" value={selectedInquiry.eventType} supporting={selectedInquiry.eventDate || "Not provided"} />
                      <InfoBlock label="Guests" value={selectedInquiry.guests ? selectedInquiry.guests.toLocaleString() : "Not provided"} supporting={selectedInquiry.preferredService ?? "Not provided"} />
                      <InfoBlock label="Budget" value={selectedInquiry.budgetAmount !== null ? formatCurrency(selectedInquiry.budgetAmount, { currency: selectedInquiry.packageCurrencyCode }) : selectedInquiry.budget} supporting={selectedInquiry.location ?? "Not provided"} />
                      <InfoBlock label="Assigned To" value={selectedInquiry.assignedToName ?? "Unassigned"} supporting={formatDateTime(selectedInquiry.updatedAt)} />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div className="space-y-4">
                        <section className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">Customer Information</p>
                          <dl className="mt-4 space-y-3 text-sm">
                            <DetailRow label="Name" value={selectedInquiry.client} />
                            <DetailRow label="Email" value={selectedInquiry.email || "Not provided"} href={selectedInquiry.email ? `mailto:${selectedInquiry.email}` : undefined} />
                            <DetailRow label="Phone" value={selectedInquiry.phone || "Not provided"} href={selectedInquiry.phone ? `tel:${selectedInquiry.phone}` : undefined} />
                          </dl>
                        </section>

                        <section className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">Event Details</p>
                          <dl className="mt-4 space-y-3 text-sm">
                            <DetailRow label="Package" value={selectedInquiry.packageName ?? "Custom request"} />
                            <DetailRow label="Event Type" value={selectedInquiry.eventType} />
                            <DetailRow label="Event Date" value={selectedInquiry.eventDate || "Not provided"} />
                            <DetailRow label="Guest Count" value={selectedInquiry.guests ? selectedInquiry.guests.toLocaleString() : "Not provided"} />
                            <DetailRow label="Budget" value={selectedInquiry.budgetAmount !== null ? formatCurrency(selectedInquiry.budgetAmount, { currency: selectedInquiry.packageCurrencyCode }) : selectedInquiry.budget} />
                            <DetailRow label="Location" value={selectedInquiry.location || "Not provided"} />
                          </dl>
                        </section>
                      </div>

                      <div className="space-y-4">
                        <section className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">Requirements</p>
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--vf-text)]">{selectedInquiry.requirements || selectedInquiry.notes || "No additional requirements were provided."}</p>
                        </section>

                        <section className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">Admin Notes</p>
                          <textarea
                            className="textarea-field mt-4"
                            rows={6}
                            value={draftNotes}
                            onChange={(event) => setDraftNotes(event.target.value)}
                            placeholder="Spoke with customer. Preparing quotation."
                          />
                        </section>
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">Status</span>
                      <select className="select-field" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
                        {statusOptions.filter((option) => option !== "all").map((option) => <option key={option} value={option}>{titleCase(option)}</option>)}
                      </select>
                    </label>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-[var(--vf-border-soft)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button type="button" className="btn-ghost w-full rounded-full px-4 py-2 text-sm sm:w-auto" onClick={closeReviewModal}>
                  Close
                </button>
                {selectedInquiry ? (
                  <button type="button" className="btn-primary w-full rounded-full px-5 py-2 text-sm sm:w-auto" onClick={() => void saveInquiry()} disabled={isSaving || isDetailLoading}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </section>
  );
}

function titleCase(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatDateLabel(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Awaiting date";
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("en-US") : "Not updated";
}

function InfoBlock({ label, value, supporting }: { label: string; value: string; supporting: string }) {
  return <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">{label}</p><p className="mt-2 text-sm font-semibold text-[var(--vf-text)]">{value}</p><p className="mt-1 text-sm text-soft">{supporting}</p></div>;
}

function DetailRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = href ? (
    <a href={href} className="break-words text-sm font-semibold text-[var(--vf-text)] transition-colors hover:text-[var(--vf-primary)]">
      {value}
    </a>
  ) : (
    <span className="break-words text-sm font-semibold text-[var(--vf-text)]">{value}</span>
  );

  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--vf-border-soft)] pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">{label}</span>
      <div className="max-w-[65%] text-right">{content}</div>
    </div>
  );
}


