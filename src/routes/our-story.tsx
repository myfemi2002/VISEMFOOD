import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { buildMeta } from "@/lib/meta";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuADwphSBumNJ-UlUB0tb9q5T6yczFBfn8Yk83Nu2tC7LHnv6ZuifVT6Yw94CrPkSd20J0wYCgx1NyhFMOI49ua2o1Dca5u295cBVeOkmiF2cf3tkB5WKdSxrHRpNEpw98CmjyfYEC1xrpImKEbN1tgt2AeYeozo7N0w9dWuon3_2WQ4h1wC4tE0pGnSUlWTjFMmM9K4EZcfR6yQOoC-hLt39JhjG3yw2Tt_f2VMsndgyLdngLTbixy2";

const founderImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAEuwzD8z2RIYR4pvcyZHEv97igGkazgj5UDPeJCy_4YQ8c4NjLt6iB_9MV2Hc1Ruh5fI8CAP7WVfOxPDUAgmO5vt4H5_lhXfbcQ35OswOr24p5ejbasr3sviZ5CtqSle1gMGyb9PnzoxdC_r401yjPkL-_5FdmtR5oHNvQtjjOL801Vh1_ewQk4WEMlk2PDmFiK9HkLK9_32zET2fe7q326UmJvJVRHszOPMhDIeb7IBZnnFY7O4UZ";

const journeyMilestones = [
  {
    year: "2015",
    title: "The First Recipe",
    summary:
      "Perfecting family recipes in a small home kitchen while learning the balance of indigenous spices and deep, slow flavor.",
    deepDive:
      "The early work centered on documenting family proportions for tatase pepper reductions, slow-simmered iru bases, and smoked broths so the food could keep its soul without losing consistency.",
  },
  {
    year: "2018",
    title: "Opening in Lagos",
    summary:
      "Launching a small Lagos kitchen that quickly became known for authentic flavor, warm service, and celebration-ready food.",
    deepDive:
      "The flagship kitchen became especially known for smoky party jollof built with unhurried cooking, wood-fire character, and a hospitality style that made guests feel personally welcomed.",
  },
  {
    year: "2022",
    title: "Bringing the Hearth to the US",
    summary:
      "Expanding the vision across the Atlantic with premium catering, trays, and delivery designed for a new audience without flattening the culture.",
    deepDive:
      "The move required more than shipping ingredients. It meant building dependable sourcing relationships, refining transport standards, and translating Nigerian hospitality into a polished modern brand experience.",
  },
] as const;

const standards = [
  {
    id: 0,
    icon: "restaurant",
    title: "Authenticity",
    shortDesc:
      "Sourcing distinctive peppers and spices with care so the flavor profile stays true to its roots.",
    details:
      "We focus on ingredients, methods, and balance that preserve the emotional memory of Nigerian food rather than reducing it to a generic restaurant format.",
  },
  {
    id: 1,
    icon: "workspace_premium",
    title: "Quality",
    shortDesc:
      "Fresh produce, premium proteins, careful prep, and no compromise on the integrity of the final dish.",
    details:
      "From cooking rhythm to presentation, the standard is simple: food should feel worthy of the occasion whether it is a quiet dinner or a major event table.",
  },
  {
    id: 2,
    icon: "groups",
    title: "Community",
    shortDesc:
      "Building relationships through food because a shared meal remains one of the strongest forms of connection.",
    details:
      "The brand is shaped around generosity, communal joy, and the idea that hospitality is as important as the recipe itself.",
  },
  {
    id: 3,
    icon: "concierge",
    title: "Excellence",
    shortDesc:
      "From ordering to delivery to event support, every touchpoint should feel calm, dependable, and premium.",
    details:
      "We design the full experience, not just the plate: clearer choices, better service flow, and thoughtful details that build trust before the food arrives.",
  },
] as const;

const galleryItems = [
  {
    step: "01. Sourcing",
    desc: "Only the finest ingredients make it into the kitchen.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw787--IIe2exCXQ56H1Ik2-M9AwgeKdcgtHsrv4Upku7YR445x6RiBNMcFdy-k58ZrnGCByy3wiZP0OWeGXMEp8j1vBNqS41Z8p0lb2tIS6j3VccGuauBvGIVdFwrnTaX3VLe934DlzUFJjHhfUt_ykRnUVdfzwKRR6whDCjTTVd80P9C9d8AlG85mjURhOIxNTvyUtJlYUiNr5PTVWKYiz-yJHSS7KG1TPJaNXYluU79e_6fnpgq",
    alt: "Spices and ingredients being prepared for Nigerian cooking.",
  },
  {
    step: "02. Preparation",
    desc: "Slow-cooked and carefully shaped until flavor, texture, and warmth all feel right.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDOn8GgLXRncpit8fC5LpQEfVVh3WPgf9a-wr5Lpn3FZsFj2FVhdcxpUtVS1Yn33VoRVKsJMZWNq4ugvYDiVkTX7LQsAPqbwuZJrooVupttIwtOExG9oUSkFeSZ6L4xFbAzXnBz3aJo6Fbg-nYL5ft79MmNSWITjyMggNRSRc0MifmBS3hrf44zhVOwCoxL-zwHG8mwXV_NCCXHDNsPGJBGiuhBb9IheXn9OjwxeJ9t3CP7EfnH4WT3",
    alt: "Chef carefully plating a Nigerian dish.",
  },
  {
    step: "03. Presentation",
    desc: "Delivered and presented with the same premium care the brand promises online.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA379yhLEy6M5LJa2n_H3P9mxkzE6CJD8tL4Fh2hz04aYAwIYbHdBVVFmA82vqLdqK1opwfNujT9gahfR74urHu1MrEgfsb9ykO2Zmza-XlnZq6ZsDfWkX8UHAnahf3pvCtlwbqI79hFwiuLTzEwSUbgjAiUZnAmHCzlsNoLXhXvu-6yI9NWEMu8lAf_yjyQjBPdt0eobB-B_5NKkaYaKLwSOUeCBS7Er5Hgs4hFA3qev_3B1BGl6ri",
    alt: "Large premium tray of Nigerian food ready for catering service.",
  },
] as const;

const communityStories = [
  {
    title: "Meals Shared With Care",
    metric: "5,000+ meals served",
    body:
      "The spirit behind Shared Tables is simple: hospitality should travel beyond paid orders and reach people who need warmth, nourishment, and dignity.",
  },
  {
    title: "Farmer Relationships",
    metric: "40+ sourcing partners",
    body:
      "Long-term ingredient relationships help preserve flavor integrity while keeping the supply story connected to real communities and real people.",
  },
  {
    title: "Next Generation Learning",
    metric: "28 trained apprentices",
    body:
      "Culinary knowledge becomes stronger when it is passed on intentionally, with room for both tradition and professional growth.",
  },
] as const;

export const Route = createFileRoute("/our-story")({
  head: () =>
    buildMeta({
      title: "Our Story | VISEMFOOD",
      description:
        "Discover the VISEMFOOD story, from Lagos roots to premium Nigerian cuisine, catering, and hospitality in the United States.",
      image: heroImage,
    }),
  component: OurStoryPage,
});

function OurStoryPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [activeStandardTab, setActiveStandardTab] = useState(0);

  return (
    <main className="pb-6">
      <section id="founder-vision" className="section-gap">
        <div className="page-shell grid gap-10 md:grid-cols-12 md:items-center lg:gap-14">
          <div className="relative z-10 md:col-span-5 md:-mr-6 lg:-mr-8">
            <article className="card-surface p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vf-primary)]">
                Founding Philosophy
              </p>
              <h2 className="heading-display mt-4 text-4xl font-bold leading-tight text-[var(--vf-text)] sm:text-5xl">
                Rooted in Tradition.
                <br />
                <span className="italic font-normal text-[var(--vf-primary)]">The Founder&apos;s Vision.</span>
              </h2>
              <div className="mt-6 h-1 w-16 rounded-full bg-[var(--vf-primary)]" />

              <p className="mt-7 text-base leading-8 text-soft sm:text-lg sm:leading-9">
                VISEMFOOD began with a simple belief: the richness of Nigerian cuisine deserves the same elegance, care, and clarity people expect from a premium hospitality brand.
              </p>
              <p className="mt-6 border-l-2 border-[var(--vf-primary)] pl-4 text-base italic leading-8 text-soft sm:text-lg sm:leading-9">
                Bringing these flavors to the United States meant more than moving ingredients. It meant protecting the culture, respecting the recipes, and serving people with genuine warmth.
              </p>

              <div className="mt-8 flex flex-col gap-4 border-t border-[var(--vf-border-soft)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="heading-display text-2xl font-bold italic text-[var(--vf-primary)]">Visem</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vf-text-soft)]">
                    Founder & Executive Chef
                  </p>
                </div>
                <Link to="/catering" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)] hover:underline">
                  Book Visem For Events
                  <span className="material-symbols-rounded text-base">chevron_right</span>
                </Link>
              </div>
            </article>
          </div>

          <div className="md:col-span-7">
            <div className="card-surface overflow-hidden p-3 sm:p-4">
              <div className="relative overflow-hidden rounded-[var(--vf-radius-lg)]">
                <img
                  src={founderImage}
                  alt="Chef portrait representing the VISEMFOOD founder vision."
                  className="h-[420px] w-full object-cover sm:h-[560px] lg:h-[680px]"
                  loading="lazy"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-4 text-xs text-white sm:p-6 sm:text-sm"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--vf-footer-bg) 82%, transparent) 100%)",
                  }}
                >
                  Preserving generational West African spice formulas with modern culinary technique.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--vf-border-soft)] bg-[var(--vf-surface-muted)] py-20 sm:py-24 lg:py-28">
        <div className="page-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vf-primary)]">Evolution of Flavor</p>
            <h2 className="heading-display mt-4 text-4xl font-bold text-[var(--vf-text)] sm:text-5xl">Our Journey</h2>
            <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[var(--vf-primary)]" />
            <p className="mt-6 text-base leading-8 text-soft sm:text-lg">
              From Lagos roots to a refined US hospitality experience, each chapter has been guided by flavor, culture, and service.
            </p>
          </div>

          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-[var(--vf-line)] md:block" />

            <div className="space-y-8 md:space-y-12">
              {journeyMilestones.map((item, index) => {
                const isSelected = selectedMilestone === index;
                const isEven = index % 2 === 1;

                return (
                  <div key={item.year} className="relative flex flex-col md:flex-row md:items-center md:justify-between">
                    <div
                      className={`w-full md:w-[46%] ${
                        isEven ? "md:order-3 md:pl-10" : "md:pr-10"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedMilestone(isSelected ? null : index)}
                        className="card-surface w-full p-5 text-left transition hover:-translate-y-0.5 sm:p-6"
                      >
                        <p className="heading-display text-3xl font-bold text-[var(--vf-primary)]">{item.year}</p>
                        <h3 className="mt-2 text-xl font-semibold text-[var(--vf-text)]">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-soft">{item.summary}</p>

                        {isSelected ? (
                          <div className="mt-4 rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-primary-light)] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-primary)]">
                              Behind the Milestone
                            </p>
                            <p className="mt-2 text-sm leading-7 text-soft">{item.deepDive}</p>
                          </div>
                        ) : null}

                        <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--vf-primary)]">
                          {isSelected ? "Show Less" : "Explore Details"}
                          <span className={`material-symbols-rounded text-base transition-transform ${isSelected ? "rotate-90" : ""}`}>
                            chevron_right
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="absolute left-1/2 top-1/2 hidden h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[var(--vf-surface-muted)] bg-[var(--vf-primary)] md:block" />

                    <div className={`hidden md:block md:w-[46%] ${isEven ? "md:order-1" : ""}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="page-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vf-primary)]">Guiding Principles</p>
            <h2 className="heading-display mt-4 text-4xl font-bold text-[var(--vf-text)] sm:text-5xl">
              The VISEMFOOD Standard
            </h2>
            <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[var(--vf-primary)]" />
            <p className="mt-6 text-base leading-8 text-soft sm:text-lg">
              These pillars shape every meal, tray, and hospitality experience we put into the world.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {standards.map((item) => {
              const active = activeStandardTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveStandardTab(item.id)}
                  className={`rounded-[calc(var(--vf-radius-lg)+0.1rem)] border p-6 text-left transition sm:p-7 ${
                    active
                      ? "border-[var(--vf-primary)] bg-[var(--vf-surface-elevated)] shadow-[var(--vf-shadow-float)]"
                      : "border-[var(--vf-border-soft)] bg-[var(--vf-surface-strong)] hover:bg-[var(--vf-surface-card)]"
                  }`}
                >
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--vf-primary-light)] text-[var(--vf-primary)]">
                    <span className="material-symbols-rounded text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="heading-display mt-6 text-3xl font-bold text-[var(--vf-text)]">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-soft">{item.shortDesc}</p>
                  {active ? (
                    <div className="mt-5 border-t border-[var(--vf-border-soft)] pt-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--vf-primary)]">
                        <span className="material-symbols-rounded text-base">check_circle</span>
                        Commitment in Action
                      </div>
                      <p className="mt-2 text-sm leading-7 text-soft">{item.details}</p>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-14">
        <div className="page-shell">
          <div className="rounded-[calc(var(--vf-radius-lg)+0.75rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-card)] px-5 py-10 shadow-[var(--vf-shadow-soft)] sm:px-8 sm:py-12 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vf-primary)]">Craft & Precision</p>
              <h2 className="heading-display mt-4 text-4xl font-bold text-[var(--vf-text)] sm:text-5xl">Kitchen to Table</h2>
              <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[var(--vf-primary)]" />
              <p className="mt-6 text-base leading-8 text-soft sm:text-lg">
                A closer look at the discipline, patience, and presentation behind every VISEMFOOD meal.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {galleryItems.map((item) => (
                <article key={item.step} className="group flex flex-col">
                  <div className="overflow-hidden rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-muted)] shadow-[var(--vf-shadow-soft)]">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-[1.05] sm:h-80"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="heading-display mt-6 text-3xl font-bold text-[var(--vf-text)] transition-colors group-hover:text-[var(--vf-primary)]">
                    {item.step}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-soft">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--vf-border-soft)] bg-[var(--vf-surface)] py-20 sm:py-24">
        <div className="page-shell">
          <div className="mx-auto max-w-4xl rounded-[calc(var(--vf-radius-lg)+0.25rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-muted)] p-6 text-center shadow-[var(--vf-shadow-soft)] sm:p-8 lg:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--vf-tertiary)_18%,white)] text-[var(--vf-tertiary)]">
              <span className="material-symbols-rounded text-3xl">diversity_3</span>
            </div>
            <h2 className="heading-display mt-6 text-4xl font-bold text-[var(--vf-text)] sm:text-5xl">
              Shared Tables, Shared Heritage
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-soft sm:text-lg">
              Food is more than sustenance. It is one of the strongest ways communities remember, celebrate, and care for each other. That belief shapes how VISEMFOOD serves beyond the plate.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {communityStories.map((story) => (
                <article
                  key={story.title}
                  className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-card)] p-5 text-left"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-primary)]">{story.metric}</p>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--vf-text)]">{story.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-soft">{story.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--vf-primary)] hover:underline">
                Learn About Our Community Impact
                <span className="material-symbols-rounded text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="page-shell">
          <div className="rounded-[calc(var(--vf-radius-lg)+0.35rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-strong)] px-6 py-10 text-center shadow-[var(--vf-shadow-soft)] sm:px-8 sm:py-14 lg:px-10 lg:py-18">
            <h2 className="heading-display text-4xl font-bold text-[var(--vf-text)] sm:text-5xl">
              Experience Our Hospitality Today
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-soft sm:text-lg">
              Whether you are craving a taste of home or planning a premium event, VISEMFOOD is ready to serve with warmth, clarity, and real flavor.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/menu" className="btn-primary w-full sm:w-auto">
                Order Online
              </Link>
              <Link to="/catering" className="btn-secondary w-full sm:w-auto">
                Explore Catering
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
