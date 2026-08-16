import Link from "next/link";
import { Hero } from "@/components/site/hero";
import { getPageContent } from "@/lib/data";

export default async function CateringPage() {
  const content = await getPageContent("catering");

  return (
    <div className="space-y-10">
      <Hero
        title={content.heroTitle || "Catering"}
        subtitle="Catering"
        body={content.heroSubtitle || ""}
        primaryCta={{ label: "Start Inquiry", href: "/catering/inquiry" }}
        secondaryCta={{ label: "Explore Trays & Coolers", href: "/trays-coolers" }}
      />
      <section className="grid gap-6 lg:grid-cols-[1fr,0.8fr]">
        <article className="card p-8">
          <h2 className="font-display text-3xl text-ink">Catering built for confidence and premium presentation.</h2>
          <p className="mt-4 text-sm leading-8 text-ink-soft">{content.bodyContent}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Corporate events",
              "Private celebrations",
              "Family gatherings",
              "Executive hospitality"
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-surface-muted px-5 py-4 text-sm font-medium text-ink-soft">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">How it works</p>
          <ol className="mt-4 space-y-4 text-sm leading-7 text-ink-soft">
            <li>1. Review the VISEMFOOD catering direction and event suitability.</li>
            <li>2. Submit an inquiry with date, guest count, and event details.</li>
            <li>3. The team follows up with menu planning and service arrangement.</li>
          </ol>
          <Link href="/catering/inquiry" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">
            Open Catering Inquiry
          </Link>
        </article>
      </section>
    </div>
  );
}
