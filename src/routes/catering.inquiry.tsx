import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SectionHeading } from "@/components/SectionHeading";
import { useSiteData } from "@/contexts/site-data-context";
import { ApiError, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { buildMeta } from "@/lib/meta";
import { buildTelHref, getBusinessWhatsAppHref } from "@/lib/site-settings";
import { fetchCateringPackages, submitCateringInquiry, type CateringPackage } from "@/lib/visemfood-api";

const inquirySchema = z.object({
  packageId: z.string().trim(),
  fullName: z.string().trim().min(2, "Please enter the client name."),
  phone: z.string().trim().min(7, "Please enter a reachable phone number."),
  email: z.string().trim().email("Please enter a valid email address."),
  eventType: z.string().trim().min(2, "Please describe the event type."),
  eventDate: z.string().min(1, "Please choose the event date."),
  guestCount: z.coerce.number().int().min(1, "Guest count must be at least 1.").max(5000, "Guest count is too high."),
  preferredService: z.string().trim().min(2, "Please choose a service direction."),
  location: z.string().trim().min(2, "Please enter the event location."),
  budgetAmount: z.preprocess((value) => (value === "" || value == null ? undefined : Number(value)), z.number().min(0).max(1000000).optional()),
  requirements: z.string().trim().max(5000, "Requirements are too long.").optional(),
});

type InquiryFormValues = z.input<typeof inquirySchema>;
type InquiryValues = z.output<typeof inquirySchema>;

export const Route = createFileRoute("/catering/inquiry")({
  head: () => buildMeta({ title: "Catering Inquiry | VISEMFOOD", description: "Submit a live VISEMFOOD catering inquiry." }),
  component: CateringInquiryPage,
});

function CateringInquiryPage() {
  const { siteMeta } = useSiteData();
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const phoneHref = buildTelHref(siteMeta.phone);
  const whatsappHref = getBusinessWhatsAppHref(siteMeta, "Hello VISEMFOOD, I would like to discuss a catering event.");
  const form = useForm<InquiryFormValues, unknown, InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      packageId: "",
      fullName: "",
      phone: "",
      email: "",
      eventType: "Private Celebration",
      eventDate: minimumEventDate(),
      guestCount: 50,
      preferredService: "Bespoke Catering",
      location: "",
      budgetAmount: undefined,
      requirements: "",
    },
  });

  const selectedPackage = useMemo(() => packages.find((item) => String(item.id) === form.watch("packageId")) ?? null, [packages, form.watch("packageId")]);

  useEffect(() => {
    let cancelled = false;
    async function loadPackages() {
      try {
        const next = await fetchCateringPackages();
        if (!cancelled) {
          setPackages(next);
          setLoadError(null);
          if (typeof window !== "undefined") {
            const packageParam = new URLSearchParams(window.location.search).get("package");
            if (packageParam) {
              const matched = next.find((item) => item.slug === packageParam || String(item.id) === packageParam);
              if (matched) {
                form.setValue("packageId", String(matched.id));
              }
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          setPackages([]);
          setLoadError(getErrorMessage(error, "Unable to load catering packages right now."));
        }
      }
    }
    void loadPackages();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await submitCateringInquiry({
        catering_package_id: values.packageId ? Number(values.packageId) : null,
        customer_name: values.fullName,
        phone: values.phone,
        email: values.email,
        event_type: values.eventType,
        event_date: values.eventDate,
        number_of_guests: values.guestCount,
        preferred_service: values.preferredService,
        location: values.location,
        budget_amount: values.budgetAmount ?? null,
        requirements: values.requirements || null,
      });
      setSubmittedReference(result.data.referenceNumber);
      toast.success("Catering inquiry captured", { description: `Reference ${result.data.referenceNumber}. Our team will follow up directly.` });
      form.reset({ ...form.getValues(), fullName: "", phone: "", email: "", location: "", budgetAmount: undefined, requirements: "" });
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        const fieldMap: Record<string, keyof InquiryValues> = { catering_package_id: "packageId", customer_name: "fullName", phone: "phone", email: "email", event_type: "eventType", event_date: "eventDate", number_of_guests: "guestCount", preferred_service: "preferredService", location: "location", budget_amount: "budgetAmount", requirements: "requirements", notes: "requirements" };
        Object.entries(error.errors).forEach(([field, messages]) => {
          const target = fieldMap[field];
          if (target && messages[0]) {
            form.setError(target, { type: "server", message: messages[0] });
          }
        });
      }
      form.setError("root", { type: "server", message: getErrorMessage(error, "Unable to submit the catering inquiry right now.") });
    }
  });

  return (
    <main className="section-gap">
      <div className="page-shell grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_320px] xl:items-start">
        <section className="card-surface p-5 sm:p-6 lg:p-7">
          <SectionHeading eyebrow="Inquiry Form" title="Tell us about the event and we will shape the hospitality." body="This route uses the same live catering inquiry API as the main Catering page, including optional package selection." as="h1" />
          {submittedReference ? <div className="mt-5 rounded-[var(--vf-radius-md)] border border-[var(--vf-success-border)] bg-[var(--vf-success-soft)] p-4 text-sm text-[var(--vf-text)]">Reference {submittedReference} has been captured successfully.</div> : null}
          {loadError ? <div className="mt-5 rounded-[var(--vf-radius-md)] border border-[var(--vf-warning-border)] bg-[var(--vf-warning-soft)] p-4 text-sm text-[var(--vf-text)]">{loadError}</div> : null}
          <form onSubmit={submit} className="mt-8 grid gap-4 lg:grid-cols-2">
            <div><input className="field" placeholder="Full name" {...form.register("fullName")} />{form.formState.errors.fullName ? <p className="form-error mt-2">{form.formState.errors.fullName.message}</p> : null}</div>
            <div><input className="field" placeholder="Phone number" {...form.register("phone")} />{form.formState.errors.phone ? <p className="form-error mt-2">{form.formState.errors.phone.message}</p> : null}</div>
            <div><input className="field" placeholder="Email address" {...form.register("email")} />{form.formState.errors.email ? <p className="form-error mt-2">{form.formState.errors.email.message}</p> : null}</div>
            <div><input className="field" placeholder="Event type" {...form.register("eventType")} />{form.formState.errors.eventType ? <p className="form-error mt-2">{form.formState.errors.eventType.message}</p> : null}</div>
            <div><input className="field" type="date" min={minimumEventDate()} {...form.register("eventDate")} />{form.formState.errors.eventDate ? <p className="form-error mt-2">{form.formState.errors.eventDate.message}</p> : null}</div>
            <div><input className="field" type="number" min={1} max={5000} {...form.register("guestCount")} />{form.formState.errors.guestCount ? <p className="form-error mt-2">{form.formState.errors.guestCount.message}</p> : null}</div>
            <div><select className="select-field" {...form.register("preferredService")}><option value="Bespoke Catering">Bespoke Catering</option><option value="Private Chef">Private Chef</option><option value="Signature Trays">Signature Trays</option></select>{form.formState.errors.preferredService ? <p className="form-error mt-2">{form.formState.errors.preferredService.message}</p> : null}</div>
            <div><select className="select-field" {...form.register("packageId")}><option value="">Custom request / no package selected</option>{packages.map((cateringPackage) => <option key={cateringPackage.id} value={String(cateringPackage.id)}>{cateringPackage.name}</option>)}</select>{form.formState.errors.packageId ? <p className="form-error mt-2">{form.formState.errors.packageId.message}</p> : null}</div>            <div className="lg:col-span-2"><input className="field" placeholder="Event location" {...form.register("location")} />{form.formState.errors.location ? <p className="form-error mt-2">{form.formState.errors.location.message}</p> : null}</div>
            <div className="lg:col-span-2"><input className="field" type="number" min={0} step="0.01" placeholder="Estimated budget in USD" {...form.register("budgetAmount")} />{form.formState.errors.budgetAmount ? <p className="form-error mt-2">{form.formState.errors.budgetAmount.message}</p> : null}</div>
            {selectedPackage ? <div className="lg:col-span-2 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface)] px-4 py-3 text-sm text-soft">Selected package: <span className="font-semibold text-[var(--vf-text)]">{selectedPackage.name}</span> | Starting from {formatCurrency(selectedPackage.startingPrice, { currency: selectedPackage.currencyCode })}</div> : null}
            <textarea className="textarea-field lg:col-span-2" placeholder="Requirements and service notes" {...form.register("requirements")} />
            {form.formState.errors.requirements ? <p className="form-error lg:col-span-2">{form.formState.errors.requirements.message}</p> : null}
            {form.formState.errors.root ? <div className="lg:col-span-2 rounded-[var(--vf-radius-md)] border border-[var(--vf-danger)]/20 bg-[var(--vf-danger-soft)] px-4 py-3 text-sm text-[var(--vf-danger)]">{form.formState.errors.root.message}</div> : null}
            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row"><button type="submit" className="btn-primary w-full sm:w-fit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Submitting..." : "Submit Inquiry"}</button><Link to="/catering" className="btn-ghost w-full rounded-full border border-[var(--vf-border-soft)] sm:w-fit">Back to Catering</Link></div>
          </form>
        </section>
        <aside className="space-y-5 xl:sticky xl:top-24">
          <div className="card-surface p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">Concierge Contact</p>
            <div className="mt-4 space-y-3 text-sm text-soft">
              <p><span className="font-semibold text-[var(--vf-text)]">Phone:</span> {phoneHref ? <a href={phoneHref} className="hover:text-[var(--vf-primary)]">{siteMeta.phone}</a> : "Phone pending"}</p>
              <p><span className="font-semibold text-[var(--vf-text)]">Email:</span> {siteMeta.email ? <a href={`mailto:${siteMeta.email}`} className="hover:text-[var(--vf-primary)]">{siteMeta.email}</a> : "Email pending"}</p>
            </div>
            <div className="mt-5 flex flex-col gap-3">{whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-primary w-full rounded-full">Message on WhatsApp</a> : null}<Link to="/contact" className="btn-ghost w-full rounded-full border border-[var(--vf-border-soft)]">Need more contact options?</Link></div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function minimumEventDate() {
  return new Date().toISOString().slice(0, 10);
}