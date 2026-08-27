import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { buildMeta } from "@/lib/meta";
import { siteMeta } from "@/data/mock";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDoVifgQDTMXHqWMVeWf_wSsof1wBHM6aTEg6eGu1-sQEasnhN6_ce-ffR42P0_rjJukhdY6HVgktGTqZ0ivoeI-hOiyLA_ANydB4s6gCJR1BZVPdug9Q9fxXz_rLIN4e3So0arZWUlfYshUOxe7aR92p-L32qtNv3GcIVCwkQUg5uwIkKwa9g6LBsk5RayipGqI4_7ylJUFz8oMAyFS2WNmCUV3RQQJxojxTCYC7d9roQmaiVBstb-";

const [hoursDays, hoursRange] = siteMeta.hours.split(",").map((part) => part.trim());
const addressSegments = siteMeta.address.split(",").map((part) => part.trim());

const operatingHours = [
  {
    days: hoursRange ? hoursDays : "Business Hours",
    hours: hoursRange || siteMeta.hours,
  },
  {
    days: "Private Events",
    hours: "By inquiry",
  },
] as const;

const subjectOptions = [
  "General Inquiry",
  "Catering",
  "Bulk Orders",
  "Private Dining",
  "Press & Partnership",
  "Other",
] as const;

const inquirySchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email address."),
  subject: z.string().min(2, "Please choose a subject."),
  eventDate: z.string().optional(),
  guestCount: z.preprocess(
    (value) => (value === "" || value == null ? undefined : Number(value)),
    z.number().min(5, "Please enter at least 5 guests.").optional(),
  ),
  message: z.string().min(5, "Please tell us a bit more about your request."),
});

type ContactFormValues = z.input<typeof inquirySchema>;
type ContactValues = z.output<typeof inquirySchema>;

export const Route = createFileRoute("/contact")({
  head: () =>
    buildMeta({
      title: "Contact | VISEMFOOD",
      description: "Get in touch with VISEMFOOD for premium catering, order questions, and hospitality support.",
      image: heroImage,
    }),
  component: ContactPage,
});

function ContactPage() {
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [shareUrl, setShareUrl] = useState("https://visemfood.example/contact");

  const form = useForm<ContactFormValues, unknown, ContactValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      subject: "General Inquiry",
      eventDate: "",
      guestCount: undefined,
      message: "",
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !showShareModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showShareModal]);

  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(`Check out VISEMFOOD: ${shareUrl}`)}`;
  const emailShareHref = `mailto:?subject=${encodeURIComponent("VISEMFOOD Premium African Catering")}&body=${encodeURIComponent(`Take a look at VISEMFOOD: ${shareUrl}`)}`;
  const primaryLocation = addressSegments[0] ?? siteMeta.address;
  const supportingLocation = addressSegments.slice(1).join(", ") || "Lagos, Nigeria";
  const phoneHref = `tel:${siteMeta.phone.replace(/[^\d+]/g, "")}`;

  const submit = form.handleSubmit(async () => {
    const reference = `VF-${Math.floor(100000 + Math.random() * 900000)}`;

    await new Promise((resolve) => setTimeout(resolve, 650));

    setSubmittedRef(reference);
    setShowEventDetails(false);
    toast.success("Inquiry received", {
      description: `Reference ${reference}. This mock flow is ready for real persistence later.`,
    });
    form.reset({
      fullName: "",
      email: "",
      subject: "General Inquiry",
      eventDate: "",
      guestCount: undefined,
      message: "",
    });
  });

  async function handleCopyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1800);
      return;
    }

    toast.message("Copy this link", {
      description: shareUrl,
    });
  }

  function scrollToInquiry() {
    if (typeof document === "undefined") {
      return;
    }

    document.getElementById("contact-inquiry")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <>
      <main className="pb-12 pt-8 sm:pt-10 lg:pt-12">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--vf-surface-strong)]" />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-45"
            style={{ backgroundImage: "var(--vf-pattern)", backgroundSize: "32px 32px, 48px 48px" }}
          />

          <div className="page-shell relative grid gap-10 py-8 sm:py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14 lg:py-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--vf-primary-light)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">
                <span className="material-symbols-rounded text-base">auto_awesome</span>
                Direct Hospitality Desk
              </div>

              <h1 className="heading-display mt-5 text-5xl font-bold leading-[1.05] text-[var(--vf-secondary)] sm:text-6xl lg:text-7xl">
                Get in Touch
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-soft sm:text-lg sm:leading-9">
                Experience the warmth of true premium African hospitality. Whether you&apos;re planning an intimate
                gathering or a grand celebration, our kitchen is ready to serve you.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button type="button" onClick={scrollToInquiry} className="btn-primary w-full rounded-full sm:w-auto">
                  <span>Send Quick Inquiry</span>
                  <span className="material-symbols-rounded text-base">arrow_forward</span>
                </button>
                <Link to="/menu" className="btn-ghost w-full rounded-full border border-[var(--vf-border-soft)] sm:w-auto">
                  Browse Catering Menu
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.2rem)] border border-[var(--vf-border-soft)] shadow-[var(--vf-shadow-float)]">
              <div className="relative h-[340px] sm:h-[400px] lg:h-[440px]">
                <img
                  src={heroImage}
                  alt="Welcoming dining environment"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 rounded-[calc(var(--vf-radius-md)+2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-elevated)] px-4 py-3 backdrop-blur-md">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--vf-text)]">Main Kitchen & Hospitality Desk</p>
                    <p className="truncate text-xs uppercase tracking-[0.12em] text-[var(--vf-text-soft)]">{supportingLocation}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">
                    {primaryLocation}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 bg-[var(--vf-surface-muted)] py-12 sm:py-14 lg:py-18">
          <div className="page-shell">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
              <div className="space-y-8 lg:col-span-5">
                <div className="space-y-6">
                  <div>
                    <p className="heading-display text-4xl font-bold uppercase tracking-[0.06em] text-[var(--vf-primary)] sm:text-5xl">
                      {siteMeta.name}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--vf-text-soft)]">
                      Premium African Catering & Hospitality
                    </p>
                  </div>

                  <div className="space-y-4">
                    <ContactInfoItem icon="location_on" title="Main Kitchen">
                      <p>{primaryLocation}</p>
                      <p>{supportingLocation}</p>
                    </ContactInfoItem>

                    <ContactInfoItem icon="call" title="Phone">
                      <a href={phoneHref} className="transition-colors hover:text-[var(--vf-primary)]">
                        {siteMeta.phone}
                      </a>
                    </ContactInfoItem>

                    <ContactInfoItem icon="mail" title="Email">
                      <a href={`mailto:${siteMeta.email}`} className="transition-colors hover:text-[var(--vf-primary)]">
                        {siteMeta.email}
                      </a>
                    </ContactInfoItem>
                  </div>
                </div>

                <article className="rounded-[calc(var(--vf-radius-md)+2px)] border border-[var(--vf-border-soft)] bg-[color-mix(in_srgb,var(--vf-surface)_72%,white)] p-6 shadow-[var(--vf-shadow-soft)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-bold text-[var(--vf-text)]">
                      <span className="material-symbols-rounded mr-2 align-[-4px] text-[var(--vf-primary)]">schedule</span>
                      Operating Hours
                    </h2>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--vf-success-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--vf-tertiary)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--vf-tertiary)]" />
                      Response in business hours
                    </span>
                  </div>

                  <ul className="mt-5 space-y-3">
                    {operatingHours.map((schedule) => (
                      <li
                        key={schedule.days}
                        className="flex items-center justify-between gap-4 border-b border-[var(--vf-border-soft)] pb-3 text-sm last:border-b-0 last:pb-0 sm:text-base"
                      >
                        <span className="text-soft">{schedule.days}</span>
                        <span className="font-bold text-[var(--vf-text)]">{schedule.hours}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--vf-text-soft)]">
                    Follow Our Journey
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--vf-primary-light)] text-[var(--vf-primary)] transition-all hover:bg-[var(--vf-primary)] hover:text-white"
                      aria-label="Share VISEMFOOD"
                    >
                      <span className="material-symbols-rounded">share</span>
                    </button>
                    <Link
                      to="/our-story"
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--vf-primary-light)] text-[var(--vf-primary)] transition-all hover:bg-[var(--vf-primary)] hover:text-white"
                      aria-label="Read our story"
                    >
                      <span className="material-symbols-rounded">public</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="card-surface relative min-h-[340px] overflow-hidden p-2 sm:min-h-[460px]">
                  <iframe
                    title="VISEMFOOD location map"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(siteMeta.address)}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-[calc(var(--vf-radius-lg)-6px)] border-0"
                  />

                  <div className="pointer-events-none absolute inset-x-6 top-6 rounded-[calc(var(--vf-radius-md)+2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-elevated)] px-4 py-3 shadow-[var(--vf-shadow-soft)] backdrop-blur-md sm:max-w-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)]">Visit or coordinate pickup</p>
                    <p className="mt-2 text-sm leading-6 text-soft sm:text-base">
                      Our hospitality team supports direct order questions, catering planning, and event-ready coordination from the main kitchen.
                    </p>
                  </div>

                  <div className="pointer-events-none absolute inset-x-6 bottom-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[calc(var(--vf-radius-md)+2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-elevated)] px-4 py-3 shadow-[var(--vf-shadow-soft)] backdrop-blur-md">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Call or email</p>
                      <p className="mt-1 text-sm font-bold text-[var(--vf-text)] sm:text-base">{siteMeta.phone}</p>
                      <p className="mt-1 text-sm text-soft">{siteMeta.email}</p>
                    </div>
                    <div className="rounded-[calc(var(--vf-radius-md)+2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-elevated)] px-4 py-3 shadow-[var(--vf-shadow-soft)] backdrop-blur-md">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">Service base</p>
                      <p className="mt-1 text-sm font-bold text-[var(--vf-text)] sm:text-base">{primaryLocation}</p>
                      <p className="mt-1 text-sm text-soft">{supportingLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-inquiry" className="relative overflow-hidden py-12 sm:py-14 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "var(--vf-pattern)", backgroundSize: "32px 32px, 48px 48px" }}
          />

          <div className="page-shell relative">
            <div className="mx-auto max-w-3xl rounded-[calc(var(--vf-radius-lg)+0.2rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-card)] p-6 shadow-[var(--vf-shadow-float)] sm:p-8 lg:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="heading-display text-4xl font-bold text-[var(--vf-primary)] sm:text-5xl">
                  Send an Inquiry
                </h2>
                <p className="mt-3 text-base leading-8 text-soft sm:text-lg">
                  Have a specific request? Our team is here to help you plan your next culinary experience.
                </p>
              </div>

              {submittedRef ? (
                <div className="mt-10 rounded-[calc(var(--vf-radius-md)+4px)] border border-[color-mix(in_srgb,var(--vf-tertiary)_40%,white)] bg-[color-mix(in_srgb,var(--vf-success-soft)_72%,white)] p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--vf-tertiary)_12%,white)] text-[var(--vf-tertiary)]">
                    <span className="material-symbols-rounded text-4xl">check_circle</span>
                  </div>
                  <h3 className="heading-display mt-5 text-3xl font-bold text-[var(--vf-text)]">Inquiry Received!</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-soft sm:text-base">
                    Thank you. Your inquiry reference is{" "}
                    <span className="rounded-md border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] px-2 py-1 font-bold text-[var(--vf-primary)]">
                      {submittedRef}
                    </span>
                    . Our hospitality team will respond during business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedRef(null)}
                    className="btn-primary mt-6 rounded-full px-6"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-10 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[var(--vf-text-soft)]" htmlFor="fullName">
                        Full Name <span className="text-[var(--vf-primary)]">*</span>
                      </label>
                      <input
                        id="fullName"
                        className="field"
                        placeholder="Jane Doe"
                        {...form.register("fullName")}
                      />
                      {form.formState.errors.fullName ? (
                        <p className="form-error mt-2">{form.formState.errors.fullName.message}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[var(--vf-text-soft)]" htmlFor="email">
                        Email Address <span className="text-[var(--vf-primary)]">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="field"
                        placeholder="jane@example.com"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email ? (
                        <p className="form-error mt-2">{form.formState.errors.email.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--vf-text-soft)]" htmlFor="subject">
                      Subject
                    </label>
                    <div className="relative">
                      <select id="subject" className="select-field appearance-none pr-12" {...form.register("subject")}>
                        {subjectOptions.map((option) => (
                          <option key={option} value={option}>
                            {option === "Catering" ? "Catering (Weddings, Banquets & Galas)" : option}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vf-text-soft)]">
                        <span className="material-symbols-rounded">expand_more</span>
                      </span>
                    </div>
                    {form.formState.errors.subject ? (
                      <p className="form-error mt-2">{form.formState.errors.subject.message}</p>
                    ) : null}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowEventDetails((current) => !current)}
                      className="text-sm font-semibold text-[var(--vf-primary)] hover:underline"
                    >
                      {showEventDetails ? "− Hide event details" : "+ Add event date & guest count (optional)"}
                    </button>

                    {showEventDetails ? (
                      <div className="mt-4 grid gap-4 border-t border-[var(--vf-border-soft)] pt-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[var(--vf-text-soft)]" htmlFor="eventDate">
                            Event Date
                          </label>
                          <input id="eventDate" type="date" className="field" {...form.register("eventDate")} />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[var(--vf-text-soft)]" htmlFor="guestCount">
                            Estimated Guests
                          </label>
                          <input
                            id="guestCount"
                            type="number"
                            min={5}
                            className="field"
                            placeholder="e.g. 50"
                            {...form.register("guestCount")}
                          />
                          {form.formState.errors.guestCount ? (
                            <p className="form-error mt-2">{form.formState.errors.guestCount.message}</p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--vf-text-soft)]" htmlFor="message">
                      Message <span className="text-[var(--vf-primary)]">*</span>
                    </label>
                    <textarea
                      id="message"
                      className="textarea-field"
                      placeholder="How can we help you today?"
                      rows={5}
                      {...form.register("message")}
                    />
                    {form.formState.errors.message ? (
                      <p className="form-error mt-2">{form.formState.errors.message.message}</p>
                    ) : null}
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="btn-primary w-full rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <span className="material-symbols-rounded text-base">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {showShareModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--vf-backdrop)] p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[calc(var(--vf-radius-lg)+0.2rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-6 shadow-[var(--vf-shadow-float)] sm:p-8">
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--vf-text-soft)] transition-colors hover:bg-[var(--vf-surface-muted)] hover:text-[var(--vf-text)]"
              aria-label="Close share dialog"
            >
              <span className="material-symbols-rounded">close</span>
            </button>

            <h2 className="heading-display text-3xl font-bold text-[var(--vf-secondary)]">Share VISEMFOOD</h2>
            <p className="mt-2 text-sm leading-7 text-soft">
              Share authentic African catering and refined hospitality with your friends, family, or event planners.
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-[calc(var(--vf-radius-md)+2px)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-muted)] p-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 bg-transparent px-2 text-xs text-[var(--vf-text)] outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-primary shrink-0 rounded-xl px-4 py-2 text-xs"
              >
                <span className="material-symbols-rounded text-sm">{copiedLink ? "check" : "content_copy"}</span>
                {copiedLink ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs font-semibold">
              <a
                href={whatsappShareHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[color-mix(in_srgb,var(--vf-success)_12%,white)] px-3 py-3 text-[var(--vf-tertiary)] transition-colors hover:bg-[color-mix(in_srgb,var(--vf-success)_20%,white)]"
              >
                WhatsApp
              </a>
              <a
                href={emailShareHref}
                className="rounded-xl bg-[color-mix(in_srgb,var(--vf-primary)_10%,white)] px-3 py-3 text-[var(--vf-primary)] transition-colors hover:bg-[color-mix(in_srgb,var(--vf-primary)_18%,white)]"
              >
                Email
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-xl bg-[var(--vf-surface-muted)] px-3 py-3 text-[var(--vf-text-soft)] transition-colors hover:bg-[var(--vf-surface-strong)]"
              >
                Direct Link
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ContactInfoItem({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-[calc(var(--vf-radius-md)+2px)] px-1 py-2">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--vf-primary)_10%,white)] text-[var(--vf-primary)]">
        <span className="material-symbols-rounded">{icon}</span>
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-bold text-[var(--vf-text)]">{title}</h3>
        <div className="mt-1 break-words text-base leading-7 text-soft">{children}</div>
      </div>
    </div>
  );
}
