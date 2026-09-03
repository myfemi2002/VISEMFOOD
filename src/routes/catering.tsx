import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useSiteData } from "@/contexts/site-data-context";
import { ApiError, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { buildMeta } from "@/lib/meta";
import { buildTelHref, getBusinessLocation, getBusinessWhatsAppHref, getOpeningHoursRows } from "@/lib/site-settings";
import { fetchCateringPackages, submitCateringInquiry, type CateringPackage } from "@/lib/visemfood-api";

const heroImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuDLr8dtm6vU1eWAJQ9B1fxlIVTIko1M5rPXtfvqe3lBRxI_Om-15whDZAAkXuX4pzaqx_7j8515ye7scMr_CNEPOQlj1SKGeHvFe2OE0BMenTCS44HGHPFd9accSXXpnT9aikoBTXMKYEI1-lqVfHj8QckSPtimiozj93r9zNEqWxwdZkFTMOXyN3aPUK7k7fx3j8DlBc_bQUPd3vzCuFJOkwGq_qxtv3RmVxT0Qi-ORwOK9avRyTQ3";
const serviceOptions = ["Bespoke Catering", "Private Chef", "Signature Trays"] as const;

const cateringSchema = z.object({
  packageId: z.string().trim(),
  fullName: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a reachable phone number."),
  eventType: z.string().trim().min(2, "Please describe the event type."),
  eventDate: z.string().min(1, "Please choose the event date."),
  guestCount: z.coerce.number().int().min(1, "Guest count must be at least 1.").max(5000, "Guest count is too high."),
  preferredService: z.enum(serviceOptions),
  venueLocation: z.string().trim().min(2, "Please enter the event location."),
  budgetAmount: z.preprocess((value) => (value === "" || value == null ? undefined : Number(value)), z.number().min(0).max(1000000).optional()),
  specialNotes: z.string().trim().max(5000, "Requirements are too long.").optional(),
});

type CateringFormValues = z.input<typeof cateringSchema>;
type CateringValues = z.output<typeof cateringSchema>;

type InquiryReceipt = {
  referenceNumber: string;
  customerName: string;
  packageName: string | null;
};

export const Route = createFileRoute("/catering")({
  head: () => buildMeta({ title: "Catering | VISEMFOOD", description: "Live VISEMFOOD catering packages and inquiry flow.", image: heroImage }),
  component: CateringPage,
});

function CateringPage() {
  const { siteMeta } = useSiteData();
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<InquiryReceipt | null>(null);
  const form = useForm<CateringFormValues, unknown, CateringValues>({
    resolver: zodResolver(cateringSchema),
    defaultValues: {
      packageId: "",
      fullName: "",
      email: "",
      phone: "",
      eventType: "Private Celebration",
      eventDate: defaultEventDate(),
      guestCount: 60,
      preferredService: "Bespoke Catering",
      venueLocation: "",
      budgetAmount: undefined,
      specialNotes: "",
    },
  });

  const selectedPackageId = form.watch("packageId");
  const selectedPackage = useMemo(() => packages.find((item) => String(item.id) === selectedPackageId) ?? null, [packages, selectedPackageId]);
  const location = getBusinessLocation(siteMeta);
  const phoneHref = buildTelHref(siteMeta.phone);
  const whatsappHref = getBusinessWhatsAppHref(siteMeta, "Hello VISEMFOOD, I would like to discuss a catering event.");
  const openingHours = getOpeningHoursRows(siteMeta.openingHours).filter((item) => item.isOpen).slice(0, 4);

  useEffect(() => {
    let cancelled = false;
    async function loadPackages() {
      setStatus("loading");
      try {
        const next = await fetchCateringPackages();
        if (!cancelled) {
          setPackages(next);
          setLoadError(null);
          setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setPackages([]);
          setLoadError(getErrorMessage(error, "Unable to load catering packages right now."));
          setStatus("error");
        }
      }
    }
    void loadPackages();
    return () => {
      cancelled = true;
    };
  }, []);  function choosePackage(cateringPackage: CateringPackage) {
    form.setValue("packageId", String(cateringPackage.id), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setSubmitted(null);
    document.getElementById("catering-inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await submitCateringInquiry({
        catering_package_id: values.packageId ? Number(values.packageId) : null,
        customer_name: values.fullName,
        email: values.email,
        phone: values.phone,
        event_type: values.eventType,
        event_date: values.eventDate,
        number_of_guests: values.guestCount,
        preferred_service: values.preferredService,
        location: values.venueLocation,
        budget_amount: values.budgetAmount ?? null,
        requirements: values.specialNotes || null,
      });
      setSubmitted({
        referenceNumber: result.data.referenceNumber,
        customerName: values.fullName,
        packageName: result.data.packageName ?? selectedPackage?.name ?? null,
      });
      toast.success("Catering request received", {
        description: `${result.message} Reference ${result.data.referenceNumber}.`,
      });
      form.reset({
        packageId: values.packageId,
        fullName: "",
        email: "",
        phone: "",
        eventType: values.eventType,
        eventDate: defaultEventDate(),
        guestCount: values.guestCount,
        preferredService: values.preferredService,
        venueLocation: "",
        budgetAmount: undefined,
        specialNotes: "",
      });
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        const fieldMap: Record<string, keyof CateringValues> = {
          catering_package_id: "packageId",
          customer_name: "fullName",
          email: "email",
          phone: "phone",
          event_type: "eventType",
          event_date: "eventDate",
          number_of_guests: "guestCount",
          preferred_service: "preferredService",
          location: "venueLocation",
          budget_amount: "budgetAmount",
          requirements: "specialNotes",
          notes: "specialNotes",
        };
        Object.entries(error.errors).forEach(([field, messages]) => {
          const target = fieldMap[field];
          const message = messages[0];
          if (target && message) {
            form.setError(target, { type: "server", message });
          }
        });
      }
      toast.error("Unable to submit catering request", {
        description: getErrorMessage(error, "Please review the details and try again."),
      });
    }
  });

  return (
    <main className="pb-14 pt-8 sm:pt-10 lg:pt-12">
      <section className="section-gap pt-0">
        <div className="page-shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--vf-primary-light)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">
              <span className="material-symbols-rounded text-base">workspace_premium</span>
              Premium Events
            </div>
            <h1 className="heading-display mt-5 text-[3rem] font-bold leading-[0.98] text-[var(--vf-secondary)] sm:text-[4rem] lg:text-[5rem]">
              Bespoke catering and warm hospitality for gatherings that matter.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-soft sm:text-lg sm:leading-9">
              Browse live VISEMFOOD catering packages, then send a real event brief to our team for availability, logistics, and final quotation follow-up.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={() => document.getElementById("catering-inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="btn-primary w-full rounded-full sm:w-auto">
                Start Your Inquiry
              </button>
              <Link to="/catering/inquiry" className="btn-ghost w-full rounded-full border border-[var(--vf-border-soft)] sm:w-auto">
                Full Inquiry Form
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.15rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-float)]">
            <img src={heroImage} alt="VISEMFOOD catering presentation" className="h-[320px] w-full object-cover sm:h-[380px] lg:h-[460px]" />
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="page-shell space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Live Catering Packages</p>
              <h2 className="heading-display mt-2 text-4xl font-bold text-[var(--vf-secondary)] sm:text-5xl">Use a package as your starting point</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-soft sm:text-base">
                Packages below are managed from the Admin and priced in USD. Final pricing is confirmed after we review your real event requirements.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-[var(--vf-primary-light)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--vf-primary)]">
                {packages.length} live package{packages.length === 1 ? "" : "s"}
              </span>
              {whatsappHref ? (
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-ghost rounded-full border border-[var(--vf-border-soft)] px-5">
                  WhatsApp Concierge
                </a>
              ) : null}
            </div>
          </div>

          {status === "loading" ? <div className="card-surface p-6 text-sm text-soft">Loading catering packages...</div> : null}
          {status === "error" ? (
            <div className="card-surface border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-5 text-sm text-[var(--vf-text)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>{loadError}</p>
                <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            </div>
          ) : null}
          {status === "ready" && packages.length === 0 ? (
            <div className="card-surface p-8 text-center sm:p-10">
              <h3 className="heading-display text-3xl font-bold text-[var(--vf-secondary)]">Custom catering is still available</h3>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                No active packages are published right now, but you can still submit a custom inquiry below.
              </p>
            </div>
          ) : null}
          {status === "ready" && packages.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-3">
              {packages.map((cateringPackage) => (
                <article key={cateringPackage.id} className={selectedPackage?.id === cateringPackage.id ? "overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.15rem)] border border-[var(--vf-primary)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-float)]" : "overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.15rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-soft)]"}>
                  <div className="aspect-[16/10] bg-[var(--vf-surface-muted)]">
                    {cateringPackage.imageUrl ? <img src={cateringPackage.imageUrl} alt={cateringPackage.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-[var(--vf-text-soft)]"><span className="material-symbols-rounded text-4xl">restaurant</span></div>}
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="heading-display text-3xl font-bold text-[var(--vf-secondary)]">{cateringPackage.name}</h3>
                        <p className="mt-2 text-sm text-soft">{guestRange(cateringPackage.minimumGuests, cateringPackage.maximumGuests)}</p>
                      </div>
                      {cateringPackage.featured ? <span className="rounded-full bg-[var(--vf-primary)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Featured</span> : null}
                    </div>
                    <p className="text-sm leading-7 text-soft">{cateringPackage.shortDescription || cateringPackage.description || "Flexible event package details available on request."}</p>
                    <p className="text-lg font-semibold text-[var(--vf-text)]">Starting from {formatCurrency(cateringPackage.startingPrice, { currency: cateringPackage.currencyCode })}</p>
                    <button type="button" onClick={() => choosePackage(cateringPackage)} className="btn-primary w-full rounded-full">
                      {selectedPackage?.id === cateringPackage.id ? "Selected for Inquiry" : "Request Package"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>      <section id="catering-inquiry" className="pb-6">
        <div className="page-shell grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start">
          <div className="card-surface p-5 sm:p-6 lg:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Real Catering Inquiry</p>
            <h2 className="heading-display mt-2 text-4xl font-bold text-[var(--vf-secondary)] sm:text-5xl">Share the event brief</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-soft sm:text-base">This form submits directly to the live VISEMFOOD catering inquiry API and appears in the Admin inbox with status tracking.</p>
            {submitted ? <div className="mt-5 rounded-[var(--vf-radius-md)] border border-[var(--vf-success-border)] bg-[var(--vf-success-soft)] p-4 text-sm text-[var(--vf-text)]"><p className="font-semibold">Inquiry received for {submitted.customerName}.</p><p className="mt-2">Reference {submitted.referenceNumber}{submitted.packageName ? ` | Package: ${submitted.packageName}` : ""}</p></div> : null}
            {selectedPackage ? <div className="mt-5 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] p-4 text-sm text-soft"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Selected Package</p><p className="mt-2 text-lg font-semibold text-[var(--vf-secondary)]">{selectedPackage.name}</p><p className="mt-1">Starting from {formatCurrency(selectedPackage.startingPrice, { currency: selectedPackage.currencyCode })} | {guestRange(selectedPackage.minimumGuests, selectedPackage.maximumGuests)}</p></div> : null}
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Full Name" error={form.formState.errors.fullName?.message}><input className="field" {...form.register("fullName")} placeholder="Your full name" /></Field>
                <Field label="Email Address" error={form.formState.errors.email?.message}><input className="field" type="email" {...form.register("email")} placeholder="hello@example.com" /></Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Phone Number" error={form.formState.errors.phone?.message}><input className="field" {...form.register("phone")} placeholder="+1 555 010 2000" /></Field>
                <Field label="Interested Package" error={form.formState.errors.packageId?.message}><select className="select-field" {...form.register("packageId")}><option value="">Custom request / not sure yet</option>{packages.map((cateringPackage) => <option key={cateringPackage.id} value={String(cateringPackage.id)}>{cateringPackage.name}</option>)}</select></Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Event Type" error={form.formState.errors.eventType?.message}><input className="field" {...form.register("eventType")} placeholder="Wedding reception" /></Field>
                <Field label="Preferred Service" error={form.formState.errors.preferredService?.message}><select className="select-field" {...form.register("preferredService")}>{serviceOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></Field>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Event Date" error={form.formState.errors.eventDate?.message}><input className="field" type="date" min={minimumEventDate()} {...form.register("eventDate")} /></Field>
                <Field label="Guest Count" error={form.formState.errors.guestCount?.message}><input className="field" type="number" min={1} max={5000} {...form.register("guestCount")} /></Field>
                <Field label="Estimated Budget (USD)" error={form.formState.errors.budgetAmount?.message}><input className="field" type="number" min={0} step="0.01" {...form.register("budgetAmount")} placeholder="1200.00" /></Field>
              </div>
              <Field label="Event Location" error={form.formState.errors.venueLocation?.message}><input className="field" {...form.register("venueLocation")} placeholder="Venue name or delivery area" /></Field>
              <Field label="Requirements" error={form.formState.errors.specialNotes?.message}><textarea className="textarea-field" rows={5} {...form.register("specialNotes")} placeholder="Service style, dietary notes, venue logistics, or any detail that helps the team prepare." /></Field>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-7 text-soft">Final pricing is confirmed by our team after we review your event size, service style, and logistics.</p>
                <button type="submit" className="btn-primary w-full rounded-full sm:w-auto" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending Inquiry..." : "Submit Catering Request"}</button>
              </div>
            </form>
          </div>
          <aside className="space-y-5 xl:sticky xl:top-24">
            <div className="card-surface p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Contact & Concierge</p>
              <div className="mt-4 space-y-4 text-sm text-soft">
                <p><span className="font-semibold text-[var(--vf-text)]">Phone:</span> {phoneHref ? <a href={phoneHref} className="hover:text-[var(--vf-primary)]">{siteMeta.phone}</a> : "Phone pending"}</p>
                <p><span className="font-semibold text-[var(--vf-text)]">Email:</span> {siteMeta.email ? <a href={`mailto:${siteMeta.email}`} className="hover:text-[var(--vf-primary)]">{siteMeta.email}</a> : "Email pending"}</p>
                <p><span className="font-semibold text-[var(--vf-text)]">Location:</span> {location.primary}{location.secondary ? `, ${location.secondary}` : ""}</p>
              </div>
              <div className="mt-5 flex flex-col gap-3">{whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-primary w-full rounded-full">Continue on WhatsApp</a> : null}<Link to="/contact" className="btn-ghost w-full rounded-full border border-[var(--vf-border-soft)]">Visit Contact Page</Link></div>
            </div>
            <div className="card-surface p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Operating Hours</p>
              <div className="mt-4 space-y-3">{openingHours.length > 0 ? openingHours.map((item) => <div key={item.key} className="flex items-center justify-between gap-4 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] px-4 py-3 text-sm"><span className="font-medium text-[var(--vf-text)]">{item.label}</span><span className="text-soft">{item.hours}</span></div>) : <div className="rounded-[var(--vf-radius-md)] border border-dashed border-[var(--vf-border-soft)] bg-[var(--vf-surface)] px-4 py-4 text-sm text-soft">Operating hours will appear here once they are configured in Site Settings.</div>}</div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function defaultEventDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

function minimumEventDate() {
  return new Date().toISOString().slice(0, 10);
}

function guestRange(minimumGuests: number, maximumGuests: number | null) {
  return maximumGuests && maximumGuests > minimumGuests ? `${minimumGuests} - ${maximumGuests} guests` : `${minimumGuests}+ guests`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-[var(--vf-text)]">{label}</span>{children}{error ? <span className="mt-2 block text-sm text-[var(--vf-danger)]">{error}</span> : null}</label>;
}