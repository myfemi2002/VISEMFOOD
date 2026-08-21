import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SectionHeading } from "@/components/SectionHeading";
import { buildMeta } from "@/lib/meta";

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

type InquiryValues = z.infer<typeof inquirySchema>;

export const Route = createFileRoute("/catering/inquiry")({
  head: () =>
    buildMeta({
      title: "Catering Inquiry | VISEMFOOD",
      description: "Submit a premium catering inquiry with event details, guest count, and menu direction.",
    }),
  component: CateringInquiryPage,
});

function CateringInquiryPage() {
  const form = useForm<InquiryValues>({
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

  const submit = form.handleSubmit(() => {
    toast.success("Catering inquiry captured", {
      description: "This first pass uses mock submission only. No data has been persisted yet.",
    });
    form.reset();
  });

  return (
    <main className="section-gap">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Inquiry Form"
          title="Tell us about the event and we will shape the hospitality."
          body="Validated with Zod and react-hook-form, and designed to be swapped to real persistence later without changing the route structure."
          as="h1"
        />
        <form onSubmit={submit} className="card-surface mt-8 grid gap-4 p-6 lg:grid-cols-2">
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
          <button type="submit" className="btn-primary lg:col-span-2">
            Submit Inquiry
          </button>
        </form>
      </div>
    </main>
  );
}
