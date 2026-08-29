import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroMediaFrame } from "@/components/HeroMediaFrame";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { useSiteData } from "@/contexts/site-data-context";
import { buildMeta } from "@/lib/meta";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAXIiOo1d4KnfGk1qfi1Zi51ywVFueVqbGqZyvCbGON2co7-QQcky16p242UFb7YnnQF1BkNUT4honwH2cbdagyQs2bIa_xjkyOKcYMG3hZ8ys4Rt4bN6_DHymMoGylxNAwLwPsEIQ_OlxE_n4U_YTyVNJ0dFe1M7NXlQJGaIICUoBmPMn-eCKi7CCJl-ZO2SPMbWyPDVQ7zzE-ymkJY1HIvEpUa5DYuL2pUMGMZ-BwTRMACG-6n6MV";
// Paste a public YouTube, Facebook, or Instagram video URL here to replace the homepage hero image.
const heroVideoUrl = "";
const storyImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuApCXd_WmNeVEJRZpDuzJIyZ2g9BSmK8dy2BzLnax54Y9WDOcpIU1pcg_Q9_OY36dCgwTkseCkMLP6roc-E1dlTEQYmx1yXgvkWqSh8Z2mR5qXBq5bI76v4XtB76ggB60zFn73FSkQ5_H3AyJELswJqD-K_QDoFBNnPZ6e8QGUWSbYuwEZTaqIxUF9a5e2YDAe9ZQj8-Z_GAJWcJ4EoxnzB4egjbMi4C8EPDxKzF58ScxMavFXr3TZA";

const formatNaira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const pillars = [
  {
    icon: "menu_book",
    title: "Authentic Heritage",
    body: "Traditional recipes prepared with patience, bold spice layering, and the warmth of shared African dining.",
  },
  {
    icon: "workspace_premium",
    title: "Premium Quality",
    body: "Refined presentation, carefully sourced ingredients, and portions designed for everyday comfort or elevated hosting.",
  },
  {
    icon: "local_shipping",
    title: "Seamless Ordering",
    body: "From direct orders to trays, coolers, and event catering, the platform keeps every next step clear and convenient.",
  },
] as const;

const testimonials = [
  {
    name: "Amina T.",
    order: "Wedding Catering",
    quote:
      "The presentation felt premium from the first setup, and every tray carried the kind of warmth that makes guests ask where the food came from.",
  },
  {
    name: "David O.",
    order: "Family Tray Order",
    quote:
      "Ordering was simple, the portions were generous, and the Jollof and grilled proteins arrived looking as good as they tasted.",
  },
  {
    name: "Kemi A.",
    order: "Corporate Lunch",
    quote:
      "VISEMFOOD gave us polished hospitality without losing the soul of the food. It felt thoughtful, modern, and deeply familiar all at once.",
  },
] as const;

export const Route = createFileRoute("/")({
  head: () =>
    buildMeta({
      title: "VISEMFOOD | Premium African Hospitality & Culinary Heritage",
      description:
        "Authentic African food, premium catering, bowls, trays, and celebration-ready ordering built around warmth, heritage, and polished hospitality.",
      image: heroImage,
    }),
  component: LandingPage,
});

function LandingPage() {
  const { products, siteMeta, trayPackages } = useSiteData();
  const featuredProducts = [
    ...products.filter((product) => product.featured && product.productType !== "tray" && product.productType !== "cooler"),
    ...products.filter((product) => !product.featured && product.productType !== "tray" && product.productType !== "cooler"),
  ].slice(0, 4);
  const leadTray = trayPackages.find((item) => item.type === "Tray") ?? trayPackages[0];
  const leadCooler = trayPackages.find((item) => item.type === "Cooler") ?? trayPackages[1] ?? trayPackages[0];
  const heroProduct = featuredProducts[0] ?? products[0];

  const orderMoments = [
    {
      icon: "schedule",
      title: "Ordering Window",
      body: `Place your order during ${siteMeta.hours} for smooth pickup, dispatch, and catering coordination.`,
    },
    {
      icon: "delivery_dining",
      title: "Pickup & Delivery",
      body: "Choose the format that fits your day, from personal bowls to celebration trays and cooler-sized service.",
    },
    {
      icon: "forum",
      title: "WhatsApp Confirmation",
      body: "Continue your order with a structured confirmation flow that keeps customer details and meal selections organized.",
    },
    {
      icon: "location_on",
      title: "Service Base",
      body: `${siteMeta.address} with hospitality support for private, family, and corporate gatherings.`,
    },
  ];

  const experiences = [
    {
      eyebrow: "Daily Ordering",
      title: "Food that feels special, even on an ordinary day.",
      body: "Explore polished bowls, soups, rice dishes, and proteins designed for quick direct ordering without compromising on flavor or presentation.",
      href: "/menu" as const,
      cta: "Explore Menu",
      image: heroProduct?.image ?? heroImage,
      dark: true,
      detail: "Bowls, plates, and ready-to-order favorites",
    },
    {
      eyebrow: "Bowls, Trays & Coolers",
      title: "Something for intimate meals, gifting, and full tables.",
      body: `${leadTray?.name ?? "Party trays"} and ${leadCooler?.name ?? "cooler packs"} make it easier to order for families, teams, birthdays, and celebration weekends.`,
      href: "/trays-coolers" as const,
      cta: "View Packages",
      image: leadTray?.image ?? products[1]?.image ?? heroImage,
      dark: false,
      detail: `Starting from ${formatNaira.format(leadTray?.price ?? 0)}`,
    },
    {
      eyebrow: "Catering & Events",
      title: "Bring VISEMFOOD to weddings, private dinners, and corporate hospitality.",
      body: "Request a premium catering experience shaped around guest count, service style, timing, and the dishes that suit your event best.",
      href: "/catering/inquiry" as const,
      cta: "Request Catering",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80",
      dark: false,
      detail: "Private events, celebrations, and office dining",
    },
  ];

  return (
    <main>
      <section className="section-gap pt-8 sm:pt-10 lg:pt-14">
        <div className="page-shell grid gap-8 xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] xl:items-center">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vf-text-soft)]">
              <span className="rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] px-4 py-2 text-[var(--vf-primary)]">
                Premium African Catering
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-[var(--vf-primary)] sm:block" />
              <span>Bespoke Hospitality</span>
            </div>

            <div className="space-y-4">
              <h1 className="heading-display max-w-4xl text-[3rem] font-bold leading-[1.02] text-[var(--vf-text)] sm:text-[3.9rem] lg:text-[4.7rem] xl:text-[5rem]">
                Rich flavors, <span className="italic text-[var(--vf-secondary)]">elevated</span> for every occasion.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-soft sm:text-lg sm:leading-9">
                VISEMFOOD brings authentic African meals into a refined, modern ordering experience for personal dining,
                family gatherings, gifting, and premium event service.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/menu" className="btn-primary w-full sm:w-auto">
                Order Now
                <span className="material-symbols-rounded text-base">arrow_outward</span>
              </Link>
              <Link to="/catering" className="btn-secondary w-full sm:w-auto">
                Explore Catering
              </Link>
            </div>

            <div className="grid w-full gap-4 rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] p-4 shadow-[var(--vf-shadow-soft)] sm:w-auto sm:self-start sm:grid-cols-3 sm:p-5">
              {[
                { value: "100%", label: "Authentic Flavor" },
                { value: "500+", label: "Gatherings Served" },
                { value: "4.9", label: "Guest Rating" },
              ].map((item) => (
                <div key={item.label} className="space-y-1 sm:min-w-[10rem]">
                  <p className="heading-display text-3xl font-bold text-[var(--vf-text)]">{item.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 text-sm font-medium text-[var(--vf-text-soft)]">
              {["Freshly prepared", "Pickup & delivery", "Catering available"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] px-4 py-2"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="floating-surface overflow-hidden p-3 sm:p-4">
              <div className="overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.25rem)]">
                <HeroMediaFrame
                  videoUrl={heroVideoUrl}
                  imageSrc={heroImage}
                  imageAlt="Elegant African cuisine spread prepared for premium hospitality"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--vf-border-soft)] bg-[var(--vf-surface-strong)] py-8 sm:py-10">
        <div className="page-shell grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="mx-auto flex max-w-sm flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--vf-surface-muted)] text-[var(--vf-primary)] shadow-[var(--vf-shadow-soft)]">
                <span className="material-symbols-rounded text-3xl">{pillar.icon}</span>
              </div>
              <h2 className="heading-display mt-6 text-3xl font-bold text-[var(--vf-text)]">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-gap">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Curated Experiences"
            title="Choose the VISEMFOOD experience that fits the moment."
            body="From quick weekday meals to celebration trays and full-service hospitality, each path is designed to feel clear, polished, and easy to trust."
            align="center"
          />

          <div className="mt-10 grid gap-6 xl:grid-cols-3">
            {experiences.map((experience) => (
              <article
                key={experience.title}
                className={
                  experience.dark
                    ? "dark-surface-shell overflow-hidden rounded-[var(--vf-radius-lg)] shadow-[var(--vf-shadow-float)]"
                    : "card-surface overflow-hidden"
                }
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img src={experience.image} alt={experience.title} className="h-full w-full object-cover" loading="lazy" />
                  <div
                    className={
                      experience.dark
                        ? "absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                        : "absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent"
                    }
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p
                      className={
                        experience.dark
                          ? "text-xs font-bold uppercase tracking-[0.18em] text-[var(--vf-footer-accent)]"
                          : "text-xs font-bold uppercase tracking-[0.18em] text-white/90"
                      }
                    >
                      {experience.eyebrow}
                    </p>
                    <p className="mt-2 max-w-xs text-sm font-medium text-white/90">{experience.detail}</p>
                  </div>
                </div>

                <div className="flex h-full flex-col p-6 sm:p-7">
                  <h2 className={experience.dark ? "heading-display text-4xl font-bold text-white" : "heading-display text-4xl font-bold text-[var(--vf-text)]"}>
                    {experience.title}
                  </h2>
                  <p className={experience.dark ? "mt-4 flex-1 text-sm leading-7 text-white/78 sm:text-base" : "mt-4 flex-1 text-sm leading-7 text-soft sm:text-base"}>
                    {experience.body}
                  </p>
                  <Link to={experience.href} className={experience.dark ? "btn-primary mt-6 w-full sm:w-fit" : "btn-ghost mt-6 w-full sm:w-fit"}>
                    {experience.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="page-shell">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Customer Favorites"
              title="Signature dishes that lead with photography, clarity, and quick ordering."
              body="Explore standout dishes with clear pricing, strong imagery, and a simple path into the full menu whenever you are ready to order."
            />
            <div className="floating-surface max-w-md p-5">
              <p className="text-sm leading-7 text-soft">
                Browse polished product cards, compare categories, and move straight into the menu when you are ready to place a full order.
              </p>
              <Link to="/menu" className="btn-secondary mt-4 w-full sm:w-fit">
                See Full Menu
              </Link>
            </div>
          </div>

          <div className="site-grid mt-8 sm:mt-10 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="page-shell grid gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] xl:items-center">
          <div className="relative overflow-hidden rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-3 shadow-[var(--vf-shadow-float)] sm:p-4">
            <img
              src={storyImage}
              alt="Chef preparing traditional African cuisine with modern presentation"
              className="h-[320px] w-full rounded-[calc(var(--vf-radius-lg)-0.25rem)] object-cover sm:h-[430px] lg:h-[520px]"
              loading="lazy"
            />
            <div
              className="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl"
              style={{ backgroundColor: "color-mix(in srgb, var(--vf-primary) 12%, transparent)" }}
            />
            <div
              className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full blur-2xl"
              style={{ backgroundColor: "color-mix(in srgb, var(--vf-tertiary) 12%, transparent)" }}
            />
          </div>

          <div>
            <SectionHeading
              eyebrow="Heritage Hearth"
              title="Food rooted in culture, presented for every table."
              body="Our kitchen is inspired by the familiar warmth of home gatherings and elevated by the kind of presentation that makes every order feel intentional."
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: "local_fire_department", label: "Firewood-inspired depth" },
                { icon: "volunteer_activism", label: "Hospitality-led service" },
                { icon: "public", label: "Cultural pride, modern finish" },
              ].map((item) => (
                <div key={item.label} className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] p-4">
                  <span className="material-symbols-rounded text-[var(--vf-primary)]">{item.icon}</span>
                  <p className="mt-3 text-sm font-semibold text-[var(--vf-text)]">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[var(--vf-radius-lg)] border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] p-5 shadow-[var(--vf-shadow-soft)] sm:p-6">
              <p className="heading-display text-2xl font-bold text-[var(--vf-text)]">
                "We cook for the feeling around the table, not just the plate."
              </p>
              <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                That means familiar flavors, confident presentation, and meals that still feel generous and human whether you are ordering lunch, gifting trays, or planning a celebration.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/our-story" className="btn-primary w-full sm:w-auto">
                Read Our Story
              </Link>
              <Link to="/contact" className="btn-secondary w-full sm:w-auto">
                Contact VISEMFOOD
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="page-shell">
          <div className="rounded-[calc(var(--vf-radius-lg)+0.25rem)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] p-6 shadow-[var(--vf-shadow-soft)] sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Plan Your Order"
                title="Simple details that make ordering feel easier."
                body="A little clarity goes a long way, especially when customers want to know when to order, how delivery works, and what happens next."
              />
              <Link to="/delivery" className="btn-ghost w-full sm:w-fit">
                View Delivery Info
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {orderMoments.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[var(--vf-radius-md)] border border-[var(--vf-border-soft)] bg-[var(--vf-overlay-strong)] p-5"
                >
                  <span className="material-symbols-rounded text-[var(--vf-primary)]">{item.icon}</span>
                  <h2 className="mt-4 text-lg font-semibold text-[var(--vf-text)]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-soft">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div
          className="page-shell overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.4rem)] border border-[var(--vf-footer-line)] px-6 py-8 text-white shadow-[var(--vf-shadow-float)] sm:px-8 sm:py-10 lg:px-10"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(107, 69, 48, 0.28), transparent 32%), radial-gradient(circle at bottom left, rgba(126, 154, 84, 0.22), transparent 36%), linear-gradient(180deg, var(--vf-footer-bg-soft), var(--vf-footer-bg))",
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Guest Reviews"
              title="The trust signal customers look for before they order."
              body="Real praise helps new guests feel confident that the food, service, and presentation will match the promise."
            />
            <Link
              to="/contact"
              className="btn-secondary w-full border-[var(--vf-dark-border)] text-[var(--vf-on-dark)] hover:bg-[var(--vf-footer-hover)] sm:w-fit"
            >
              Share an Enquiry
            </Link>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-[var(--vf-radius-lg)] border border-[var(--vf-dark-border)] bg-white/6 p-6 backdrop-blur-sm"
              >
                <div className="flex gap-1 text-[var(--vf-footer-accent)]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={`${testimonial.name}-${index}`} className="material-symbols-rounded text-base">
                      star
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-base leading-8 text-white/88">"{testimonial.quote}"</p>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-white/64">{testimonial.order}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
