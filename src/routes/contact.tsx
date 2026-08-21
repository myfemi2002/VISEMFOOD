import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SectionHeading } from "@/components/SectionHeading";
import { buildMeta } from "@/lib/meta";
import { siteMeta } from "@/data/mock";

const contactSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email address."),
  phone: z.string().optional(),
  subject: z.string().min(2, "Please add a short subject."),
  message: z.string().min(5, "Please tell us a bit more about your request."),
});

type ContactValues = z.infer<typeof contactSchema>;

export const Route = createFileRoute("/contact")({
  head: () =>
    buildMeta({
      title: "Contact | VISEMFOOD",
      description: "Contact VISEMFOOD for support, food ordering questions, catering, and event planning.",
    }),
  component: ContactPage,
});

function ContactPage() {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const submit = form.handleSubmit(() => {
    toast.success("Message sent", {
      description: "This mock contact form validates correctly and is ready for real persistence later.",
    });
    form.reset();
  });

  return (
    <main className="section-gap">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Contact Us"
          title="General support, catering conversations, and premium order coordination."
          body="The contact route keeps business details visible while supporting a validated, mock-submitted form."
          as="h1"
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr,1.15fr]">
          <article className="card-surface p-6">
            <h2 className="heading-display text-3xl font-bold">Reach the team</h2>
            <div className="mt-5 space-y-3 text-sm text-soft">
              <p>{siteMeta.email}</p>
              <p>{siteMeta.phone}</p>
              <p>{siteMeta.address}</p>
              <p>{siteMeta.hours}</p>
            </div>
          </article>
          <form onSubmit={submit} className="card-surface grid gap-4 p-6">
            <div>
              <input className="field" placeholder="Full name" {...form.register("fullName")} />
              {form.formState.errors.fullName ? <p className="form-error mt-2">{form.formState.errors.fullName.message}</p> : null}
            </div>
            <div>
              <input className="field" placeholder="Email address" {...form.register("email")} />
              {form.formState.errors.email ? <p className="form-error mt-2">{form.formState.errors.email.message}</p> : null}
            </div>
            <input className="field" placeholder="Phone number (optional)" {...form.register("phone")} />
            <div>
              <input className="field" placeholder="Subject" {...form.register("subject")} />
              {form.formState.errors.subject ? <p className="form-error mt-2">{form.formState.errors.subject.message}</p> : null}
            </div>
            <div>
              <textarea className="textarea-field" placeholder="Message" {...form.register("message")} />
              {form.formState.errors.message ? <p className="form-error mt-2">{form.formState.errors.message.message}</p> : null}
            </div>
            <button type="submit" className="btn-primary">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
