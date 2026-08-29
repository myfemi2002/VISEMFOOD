import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SectionHeading } from "@/components/SectionHeading";
import { ApiError, getErrorMessage } from "@/lib/api";
import { buildMeta } from "@/lib/meta";
import { submitCateringInquiry } from "@/lib/visemfood-api";

const inquirySchema = z.object({
  fullName: z.string().min(2, "Please enter the client name."),
  phone: z.string().min(7, "Please enter a reachable phone number."),
  email: z.email("Please enter a valid email address."),
  eventType: z.string().min(2, "Please describe the event type."),
  eventDate: z.string().min(1, "Please choose the event date."),
  guestCount: z.coerce.number().min(1, "Guest count must be at least 1."),
  preferredMenu: z.string().min(2, "Please share a preferred menu direction."),
  notes: z.string().optional(),
});

type InquiryFormValues = z.input<typeof inquirySchema>;
type InquiryValues = z.output<typeof inquirySchema>;

export const Route = createFileRoute("/catering/inquiry")({
  head: () =>
    buildMeta({
      title: "Catering Inquiry | VISEMFOOD",
      description: "Submit a premium catering inquiry with event details, guest count, and menu direction.",
    }),
  component: CateringInquiryPage,
});

function CateringInquiryPage() {
  const form = useForm<InquiryFormValues, unknown, InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      eventType: "",
      eventDate: "",
      guestCount: 50,
      preferredMenu: "",
      notes: "",
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await submitCateringInquiry({
        customer_name: values.fullName,
        phone: values.phone,
        email: values.email,
        event_type: values.eventType,
        event_date: values.eventDate,
        number_of_guests: values.guestCount,
        requirements: values.preferredMenu,
        notes: values.notes || null,
      });

      toast.success("Catering inquiry captured", {
        description: `Reference ${result.data.referenceNumber}. Our team will review your event brief and follow up directly.`,
      });
      form.reset();
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        const fieldMap: Record<string, keyof InquiryValues> = {
          customer_name: "fullName",
          phone: "phone",
          email: "email",
          event_type: "eventType",
          event_date: "eventDate",
          number_of_guests: "guestCount",
          requirements: "preferredMenu",
          notes: "notes",
        };

        Object.entries(error.errors).forEach(([field, messages]) => {
          const target = fieldMap[field];
          if (!target || messages.length === 0) {
            return;
          }

          form.setError(target, {
            type: "server",
            message: messages[0],
          });
        });
      }

      form.setError("root", {
        type: "server",
        message: getErrorMessage(error, "Unable to submit the catering inquiry right now."),
      });
    }
  });

  return (
    <main className="section-gap">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Inquiry Form"
          title="Tell us about the event and we will shape the hospitality."
          body="Validated with Zod and react-hook-form, and now connected to the live VISEMFOOD catering inquiry endpoint."
          as="h1"
        />
        <form onSubmit={submit} className="card-surface mt-8 grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
          <div>
            <input className="field" placeholder="Full name" {...form.register("fullName")} />
            {form.formState.errors.fullName ? <p className="form-error mt-2">{form.formState.errors.fullName.message}</p> : null}
          </div>
          <div>
            <input className="field" placeholder="Phone number" {...form.register("phone")} />
            {form.formState.errors.phone ? <p className="form-error mt-2">{form.formState.errors.phone.message}</p> : null}
          </div>
          <div>
            <input className="field" placeholder="Email address" {...form.register("email")} />
            {form.formState.errors.email ? <p className="form-error mt-2">{form.formState.errors.email.message}</p> : null}
          </div>
          <div>
            <input className="field" placeholder="Event type" {...form.register("eventType")} />
            {form.formState.errors.eventType ? <p className="form-error mt-2">{form.formState.errors.eventType.message}</p> : null}
          </div>
          <div>
            <input className="field" type="date" {...form.register("eventDate")} />
            {form.formState.errors.eventDate ? <p className="form-error mt-2">{form.formState.errors.eventDate.message}</p> : null}
          </div>
          <div>
            <input className="field" type="number" min={1} {...form.register("guestCount")} />
            {form.formState.errors.guestCount ? <p className="form-error mt-2">{form.formState.errors.guestCount.message}</p> : null}
          </div>
          <div className="lg:col-span-2">
            <input className="field" placeholder="Preferred menu or food style" {...form.register("preferredMenu")} />
            {form.formState.errors.preferredMenu ? <p className="form-error mt-2">{form.formState.errors.preferredMenu.message}</p> : null}
          </div>
          <textarea className="textarea-field lg:col-span-2" placeholder="Additional notes" {...form.register("notes")} />
          {form.formState.errors.root ? (
            <div className="lg:col-span-2 rounded-[var(--vf-radius-md)] border border-[var(--vf-danger)]/20 bg-[var(--vf-danger-soft)] px-4 py-3 text-sm text-[var(--vf-danger)]">
              {form.formState.errors.root.message}
            </div>
          ) : null}
          <button type="submit" className="btn-primary w-full lg:col-span-2 sm:w-fit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </button>
        </form>
      </div>
    </main>
  );
}
