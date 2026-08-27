import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { siteMeta } from "@/data/mock";
import { buildMeta } from "@/lib/meta";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDLr8dtm6vU1eWAJQ9B1fxlIVTIko1M5rPXtfvqe3lBRxI_Om-15whDZAAkXuX4pzaqx_7j8515ye7scMr_CNEPOQlj1SKGeHvFe2OE0BMenTCS44HGHPFd9accSXXpnT9aikoBTXMKYEI1-lqVfHj8QckSPtimiozj93r9zNEqWxwdZkFTMOXyN3aPUK7k7fx3j8DlBc_bQUPd3vzCuFJOkwGq_qxtv3RmVxT0Qi-ORwOK9avRyTQ3";

const trustStats = [
  { value: "500+", label: "Bespoke Galas & Weddings" },
  { value: "100%", label: "Authentic Heritage Recipes" },
  { value: "5-Star", label: "Executive Hospitality" },
] as const;

type CateringService = "Bespoke Catering" | "Private Chef" | "Signature Trays";

type ExperienceCard = {
  id: string;
  title: string;
  eventType: string;
  service: CateringService;
  image: string;
  description: string;
  bullets: string[];
  cta: string;
  badge?: string;
  featured?: boolean;
};

const experienceCards: readonly ExperienceCard[] = [
  {
    id: "corporate",
    title: "Corporate Galas",
    eventType: "Corporate Gala",
    service: "Bespoke Catering" as const,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBddU6WX5ISVlYTc5R-vK19MIRBtqlg2RXigGVaVpuGLYY84oK_alcKU9BvAWqRr02ERvwHA_JChJm6mTjHo_hMeTAMyHpR3cnCJZi-Z3PId7VK_e64xkS-Fioo-s0VCUgcOxorLg9d3gbd5YLfB9vBQIDAU9ExL7gy5AXx9VWgfuSsZ8pd0uSX15eB0MXuuYI8L6Pwb-6J4d9Z51oNo-nqYdfNFDtdwi2J3sy8spv6CeBH0HTk7ggS",
    description:
      "Professional, seamless service designed for high-stakes business gatherings where authentic African flavor meets polished modern presentation.",
    bullets: ["Seated 3-course service or executive buffet", "Cocktail reception and pass-around canapes"],
    cta: "Explore Corporate",
  },
  {
    id: "celebrations",
    title: "Social Celebrations",
    eventType: "Wedding",
    service: "Bespoke Catering" as const,
    badge: "Most Requested",
    featured: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjnXoFcqetSjchLhiXbSxOQ75Wfh7MCMk8KKaGlVQZ0KUYy1qOIZ7PNNvup1_3hDuOi_OF88JvTAsck2S6lmDAj5lCZ9y0J_pKwGu0VaB2LCNU2XzAHgWUo0hHc8OFRJQqTSfOrkXSV0dIr99yVIPRkbh7uEBMRH-L_81-QdVsU_ve8oQ0raYwnI2ppFU9KHO1lGmUjdsDZqe24MFzkR2WlPNEGiYEaqRG9WiDAv6rmgqLINCJyxzD",
    description:
      "Heartfelt, vibrant catering for weddings, anniversaries, and milestone gatherings where abundant hospitality becomes part of the memory.",
    bullets: ["Live charcoal suya and plantain stations", "Family-style signature banquet service"],
    cta: "Explore Celebrations",
  },
  {
    id: "private-chef",
    title: "Private Chef",
    eventType: "Private Dining",
    service: "Private Chef" as const,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBvK2507xrFStNRPLUdxL8I4QCNgzq39Iygcu_gSgcNrhluDbrKSHi-q_8MZXAG4CKwEMmRHPd6PE_dBMxCjEYrcQ6rciIKaGDJWWDkGWJmUTdwu4_yu1b2z5VtzMqddaBDjV9qThN0OlwemW4-JuG6gwPBBzxBSJkNFF7MI9eCsjLpqIBJhVHmv-Zzuq72aaLTmdycMvf6iPeSU4rIXtfre0LnNRrsuntWUNQVhjxInsIYFfq8GnB7",
    description:
      "Intimate, highly personalized dining experiences for exclusive tables where culinary storytelling and bespoke menus take center stage.",
    bullets: ["5-course contemporary tasting menu", "In-home chef prep, plating, and pairing support"],
    cta: "Explore Private Dining",
  },
] as const;

const serviceOptions = [
  {
    value: "Bespoke Catering",
    label: "Bespoke Catering",
    description: "Full-service event",
  },
  {
    value: "Private Chef",
    label: "Private Chef",
    description: "Intimate dining",
  },
  {
    value: "Signature Trays",
    label: "Signature Trays",
    description: "Drop-off service",
  },
] as const;

const standards = [
  {
    icon: "auto_awesome",
    title: "Authentic Heritage",
    description:
      "Recipes passed down through generations, celebrating true African flavors with firewood depth, warmth, and cultural memory.",
  },
  {
    icon: "eco",
    title: "Premium Sourcing",
    description:
      "We work with quality ingredients and dependable prep standards so the final table feels as refined as the promise behind it.",
  },
  {
    icon: "workspace_premium",
    title: "Bespoke Curation",
    description:
      "Every menu is shaped around your event, your guests, and the kind of impression you want VISEMFOOD to leave behind.",
  },
] as const;

const cateringSchema = z.object({
  eventType: z.string().min(2, "Please select the event type."),
  guestCount: z.coerce.number().min(5, "Guest count must be at least 5."),
  preferredService: z.enum(["Bespoke Catering", "Private Chef", "Signature Trays"]),
  eventDate: z.string().min(1, "Please choose the event date."),
  venueLocation: z.string().min(2, "Please enter the venue location."),
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(7, "Please enter a reachable phone number."),
  specialNotes: z.string().optional(),
});

type CateringFormValues = z.input<typeof cateringSchema>;
type CateringValues = z.output<typeof cateringSchema>;

type SubmissionSummary = CateringValues & {
  estimateMin: number;
  estimateMax: number;
  reference: string;
};

export const Route = createFileRoute("/catering")({
  head: () =>
    buildMeta({
      title: "Catering | VISEMFOOD",
      description:
        "Discover bespoke VISEMFOOD catering for weddings, celebrations, corporate galas, and private chef experiences.",
      image: heroImage,
    }),
  component: CateringPage,
});

function rateForService(service: CateringValues["preferredService"]) {
  switch (service) {
    case "Private Chef":
      return 145;
    case "Signature Trays":
      return 35;
    default:
      return 85;
  }
}

function estimateFor(service: CateringValues["preferredService"], guests: number) {
  const average = Math.max(guests, 0) * rateForService(service);
  return {
    min: Math.round(average * 0.9),
    max: Math.round(average * 1.15),
    average,
  };
}

function getDefaultEventDate() {
  const base = new Date();
  base.setDate(base.getDate() + 30);
  return base.toISOString().slice(0, 10);
}

function CateringPage() {
  const [submitted, setSubmitted] = useState<SubmissionSummary | null>(null);

  const form = useForm<CateringFormValues, unknown, CateringValues>({
    resolver: zodResolver(cateringSchema),
    defaultValues: {
      eventType: "Wedding",
      guestCount: 150,
      preferredService: "Bespoke Catering",
      eventDate: getDefaultEventDate(),
      venueLocation: "",
      fullName: "",
      email: "",
      phone: "",
      specialNotes: "",
    },
  });

  const guestCount = form.watch("guestCount");
  const preferredService = form.watch("preferredService");
  const estimate = useMemo(
    () => estimateFor(preferredService, Number(guestCount) || 0),
    [guestCount, preferredService],
  );

  function scrollToInquiry() {
    document.getElementById("catering-inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function primeInquiry(card: ExperienceCard) {
    form.setValue("eventType", card.eventType, { shouldDirty: true, shouldTouch: true });
    form.setValue("preferredService", card.service, { shouldDirty: true, shouldTouch: true });
    if (submitted) {
      setSubmitted(null);
    }
    scrollToInquiry();
  }

  const submit = form.handleSubmit((values) => {
    const totals = estimateFor(values.preferredService, values.guestCount);
    const reference = `INQ-${Math.floor(1000 + Math.random() * 9000)}`;

    setSubmitted({
      ...values,
      estimateMin: totals.min,
      estimateMax: totals.max,
      reference,
    });

    toast.success("Catering inquiry prepared", {
      description: "This first pass is still mock-only, but the event brief has been captured in the page state.",
    });
  });

  return (
    <main className="pb-8">
      <section className="pt-5 sm:pt-6 lg:pt-8">
        <div className="page-shell">
          <div className="relative overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.75rem)] border border-[var(--vf-border-soft)] shadow-[var(--vf-shadow-float)]">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={heroImage}
                alt="Lavish African feast laid out on an elegant wooden table bathed in warm lighting."
                className="h-full w-full scale-105 object-cover object-center"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, color-mix(in srgb, var(--vf-surface) 96%, transparent) 0%, color-mix(in srgb, var(--vf-surface) 76%, transparent) 48%, color-mix(in srgb, var(--vf-surface) 18%, transparent) 100%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--vf-surface) 8%, transparent) 0%, transparent 55%, color-mix(in srgb, var(--vf-surface) 94%, transparent) 100%)",
                }}
              />
            </div>

            <div className="relative z-10 grid min-h-[38rem] items-center gap-8 px-5 py-8 sm:px-7 sm:py-10 lg:min-h-[48rem] lg:grid-cols-12 lg:px-10 lg:py-12 xl:px-12">
              <div className="lg:col-span-7 xl:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vf-primary)] backdrop-blur-sm">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[var(--vf-primary)]" />
                  Premium Events
                </div>

                <h1 className="heading-display mt-5 max-w-[15ch] text-5xl font-bold leading-[1.08] text-[var(--vf-text)] sm:text-6xl lg:text-[4rem]">
                  Bespoke Catering & <span className="text-[var(--vf-secondary)] italic font-normal">Premium Hospitality</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-soft sm:text-lg sm:leading-9">
                  Elevating your most significant moments by bringing the heart, warmth, and vibrant flavors of authentic African culinary heritage to the table. Exquisite presentation meets uncompromising taste.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button type="button" onClick={scrollToInquiry} className="btn-primary w-full sm:w-auto">
                    Start Your Inquiry
                  </button>
                  <Link to="/menu" className="btn-secondary w-full sm:w-auto">
                    View Catering Menu
                  </Link>
                </div>

                <div className="mt-8 grid max-w-xl grid-cols-3 gap-4 border-t border-[var(--vf-border-soft)] pt-6">
                  {trustStats.map((stat) => (
                    <div key={stat.label}>
                      <p className="heading-display text-2xl font-bold text-[var(--vf-primary)] sm:text-3xl">{stat.value}</p>
                      <p className="mt-1 text-xs font-medium leading-5 text-soft sm:text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="page-shell relative">
          <div
            className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "color-mix(in srgb, var(--vf-primary) 12%, transparent)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full blur-3xl"
            style={{ background: "color-mix(in srgb, var(--vf-tertiary) 10%, transparent)" }}
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="heading-display text-4xl font-bold text-[var(--vf-text)] sm:text-5xl">Curated Experiences</h2>
            <p className="mt-4 text-base leading-8 text-soft sm:text-lg">
              We tailor our exceptional culinary services to suit the scale, tone, and prestige of your event, ensuring every detail reflects our commitment to excellence.
            </p>
            <div className="mx-auto mt-6 h-px w-24 bg-[var(--vf-primary)] opacity-60" />
          </div>

          <div className="relative z-10 mt-12 grid gap-6 lg:grid-cols-3 lg:items-start">
            {experienceCards.map((card) => (
              <article
                key={card.id}
                className={`card-surface flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
                  card.featured ? "lg:-translate-y-4 lg:border-[color:var(--vf-primary)]" : ""
                }`}
              >
                <div className="relative h-72 overflow-hidden">
                  {card.badge ? (
                    <div className="absolute right-4 top-4 z-10 rounded-full bg-[var(--vf-primary)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                      {card.badge}
                    </div>
                  ) : null}
                  <img
                    src={card.image}
                    alt={`${card.title} by VISEMFOOD.`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, color-mix(in srgb, var(--vf-footer-bg) 6%, transparent) 0%, color-mix(in srgb, var(--vf-footer-bg) 18%, transparent) 42%, color-mix(in srgb, var(--vf-footer-bg) 78%, transparent) 100%)",
                    }}
                  />
                  <h3 className="heading-display absolute bottom-6 left-6 text-3xl font-bold text-white">{card.title}</h3>
                </div>

                <div className="flex grow flex-col justify-between p-6 sm:p-7">
                  <div>
                    <p className="text-sm leading-7 text-soft sm:text-[15px]">{card.description}</p>
                    <div className="mt-6 space-y-3 text-xs text-[var(--vf-text-soft)] sm:text-sm">
                      {card.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-2.5">
                          <span className="material-symbols-rounded mt-0.5 text-base text-[var(--vf-tertiary)]">check_circle</span>
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => primeInquiry(card)}
                    className="mt-6 inline-flex items-center gap-2 border-t border-[var(--vf-border-soft)] pt-4 text-left text-sm font-bold text-[var(--vf-primary)] transition-all hover:gap-3"
                  >
                    <span>{card.cta}</span>
                    <span className="material-symbols-rounded text-base">arrow_forward</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="catering-inquiry" className="pb-6 sm:pb-10">
        <div className="page-shell grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)] lg:items-start">
          <div className="rounded-[calc(var(--vf-radius-lg)+0.5rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-strong)] p-5 shadow-[var(--vf-shadow-soft)] sm:p-7 lg:p-10">
            <h2 className="heading-display text-4xl font-bold text-[var(--vf-text)] sm:text-5xl">Party & Event Inquiry</h2>
            <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
              Please provide details about your upcoming event, and our curation team will be in touch within 24 hours.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-[var(--vf-radius-lg)] border border-[color:var(--vf-primary)] bg-[var(--vf-surface-card)] p-6 text-center shadow-[var(--vf-shadow-soft)] sm:p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--vf-primary-light)] text-[var(--vf-primary)]">
                  <span className="material-symbols-rounded text-4xl">check_circle</span>
                </div>
                <h3 className="heading-display mt-5 text-3xl font-bold text-[var(--vf-text)]">
                  Inquiry Received with Distinction
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-soft">
                  Thank you for entrusting VISEMFOOD. Your inquiry reference is{" "}
                  <strong className="font-mono text-[var(--vf-primary)]">{submitted.reference}</strong>. Our event director will review your menu requirements and reach out directly.
                </p>

                <div className="mx-auto mt-6 max-w-xl rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-card)] p-4 text-left text-sm text-soft">
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--vf-border-soft)] pb-3">
                    <span className="font-medium">Event</span>
                    <span className="font-semibold text-[var(--vf-text)]">
                      {submitted.eventType} ({submitted.guestCount} Guests)
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4 border-b border-[var(--vf-border-soft)] pb-3">
                    <span className="font-medium">Service Model</span>
                    <span className="font-semibold text-[var(--vf-secondary)]">{submitted.preferredService}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="font-medium">Estimated Catering Range</span>
                    <span className="font-semibold text-[var(--vf-tertiary)]">
                      ${submitted.estimateMin.toLocaleString()} - ${submitted.estimateMax.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => setSubmitted(null)}
                    className="btn-primary w-full sm:w-auto"
                  >
                    Submit Another Inquiry
                  </button>
                  <Link to="/catering/inquiry" className="btn-secondary w-full sm:w-auto">
                    Open Full Inquiry Route
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text)]">
                      Nature of Event
                    </label>
                    <select className="select-field" {...form.register("eventType")}>
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate Gala">Corporate Gala</option>
                      <option value="Social Celebration">Social Celebration</option>
                      <option value="Milestone Anniversary">Milestone Anniversary</option>
                      <option value="Private Dining">Private Dining</option>
                      <option value="Other">Other</option>
                    </select>
                    {form.formState.errors.eventType ? (
                      <p className="form-error mt-2">{form.formState.errors.eventType.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text)]">
                        Estimated Guest Count
                      </label>
                      <span className="text-xs font-medium text-[var(--vf-text-soft)]">
                        Est. from ${estimate.min.toLocaleString()}
                      </span>
                    </div>
                    <input type="number" min={5} max={2000} className="field" {...form.register("guestCount")} />
                    {form.formState.errors.guestCount ? (
                      <p className="form-error mt-2">{form.formState.errors.guestCount.message}</p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text)]">
                    Preferred Service
                  </label>
                  <div className="grid gap-4 md:grid-cols-3">
                    {serviceOptions.map((option) => {
                      const active = preferredService === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            form.setValue("preferredService", option.value, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            })
                          }
                          className={`relative rounded-[var(--vf-radius-md)] border p-4 text-left transition-all ${
                            active
                              ? "border-[color:var(--vf-primary)] bg-[var(--vf-surface-card)] ring-2 ring-[color:color-mix(in_srgb,var(--vf-primary)_24%,transparent)]"
                              : "border-[var(--vf-border-soft)] bg-[var(--vf-surface-card)] hover:bg-[color-mix(in_srgb,var(--vf-surface-muted)_36%,white)]"
                          }`}
                        >
                          <span className="block pr-6 text-sm font-bold text-[var(--vf-text)]">{option.label}</span>
                          <span className="mt-1 block text-xs text-soft">{option.description}</span>
                          <span
                            className={`absolute right-4 top-4 flex h-4 w-4 items-center justify-center rounded-full border ${
                              active
                                ? "border-[color:var(--vf-primary)] bg-[var(--vf-primary)]"
                                : "border-[var(--vf-outline)]"
                            }`}
                          >
                            {active ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.preferredService ? (
                    <p className="form-error mt-2">{form.formState.errors.preferredService.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text)]">
                      Event Date
                    </label>
                    <input
                      type="date"
                      min="2026-08-23"
                      className="field"
                      {...form.register("eventDate")}
                    />
                    {form.formState.errors.eventDate ? (
                      <p className="form-error mt-2">{form.formState.errors.eventDate.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text)]">
                      Venue Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, State or Venue Name"
                      className="field"
                      {...form.register("venueLocation")}
                    />
                    {form.formState.errors.venueLocation ? (
                      <p className="form-error mt-2">{form.formState.errors.venueLocation.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text)]">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Femi Adebayo"
                      className="field"
                      {...form.register("fullName")}
                    />
                    {form.formState.errors.fullName ? (
                      <p className="form-error mt-2">{form.formState.errors.fullName.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text)]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="host@domain.com"
                      className="field"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email ? (
                      <p className="form-error mt-2">{form.formState.errors.email.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text)]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 555 000 0000"
                      className="field"
                      {...form.register("phone")}
                    />
                    {form.formState.errors.phone ? (
                      <p className="form-error mt-2">{form.formState.errors.phone.message}</p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text)]">
                    Culinary Preferences or Special Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. live charcoal suya bar, halal requirements, vegetarian swallows, or custom canapes."
                    className="textarea-field"
                    {...form.register("specialNotes")}
                  />
                </div>

                <div className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-card)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                        Estimated Catering Range
                      </p>
                      <p className="mt-1 text-sm leading-7 text-soft">
                        Based on {Number(guestCount) || 0} guests and {preferredService}.
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="heading-display text-3xl font-bold text-[var(--vf-primary)]">
                        ${estimate.min.toLocaleString()} - ${estimate.max.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--vf-text-soft)]">Planning estimate only</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" className="btn-primary w-full sm:w-auto">
                    Submit Inquiry
                  </button>
                  <Link to="/catering/inquiry" className="btn-ghost w-full sm:w-auto">
                    Open Dedicated Inquiry Route
                  </Link>
                </div>
              </form>
            )}
          </div>

          <aside className="lg:pl-4 xl:pl-8">
            <div className="lg:border-l lg:border-[var(--vf-border-soft)] lg:pl-8 xl:pl-10">
              <div>
                <h2 className="heading-display text-3xl font-bold text-[var(--vf-text)] sm:text-4xl">
                  The VISEMFOOD Standard
                </h2>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vf-text-soft)]">
                  The guiding pillars of our craft
                </p>
              </div>

              <div className="mt-8 grid gap-7">
                {standards.map((standard) => (
                  <div key={standard.title} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--vf-primary-light)] text-[var(--vf-primary)] shadow-sm">
                      <span className="material-symbols-rounded">{standard.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--vf-text)]">{standard.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-soft">{standard.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-primary-light)] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-primary)]">
                  Direct Event Concierge
                </p>
                <p className="mt-2 text-sm leading-7 text-soft">
                  Planning on a tight schedule or need an immediate custom quotation?
                </p>
                <div className="mt-4 grid gap-3 text-sm">
                  <a href={`mailto:${siteMeta.email}`} className="inline-flex items-center gap-2 font-semibold text-[var(--vf-primary)] hover:underline">
                    <span className="material-symbols-rounded text-base">mail</span>
                    {siteMeta.email}
                  </a>
                  <a href={`tel:${siteMeta.phone}`} className="inline-flex items-center gap-2 font-semibold text-[var(--vf-primary)] hover:underline">
                    <span className="material-symbols-rounded text-base">call</span>
                    {siteMeta.phone}
                  </a>
                  <p className="text-xs text-[var(--vf-text-soft)]">{siteMeta.hours}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
