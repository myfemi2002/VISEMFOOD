import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { buildMeta } from "@/lib/meta";

export const Route = createFileRoute("/our-story")({
  head: () =>
    buildMeta({
      title: "Our Story | VISEMFOOD",
      description: "Discover the heritage, warmth, and premium hospitality values behind VISEMFOOD.",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80",
    }),
  component: OurStoryPage,
});

function OurStoryPage() {
  return (
    <main className="section-gap">
      <div className="page-shell space-y-8">
        <SectionHeading
          eyebrow="Heritage & Hospitality"
          title="A rooted brand story told with warmth, elegance, and cultural pride."
          body="Our Story follows the editorial Stitch direction and gives the platform emotional depth beyond ordering alone."
          as="h1"
        />
        <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <img
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80"
            alt="Warm hospitality table setup"
            className="card-surface h-full w-full object-cover p-4"
            loading="lazy"
          />
          <article className="card-surface p-6">
            <p className="text-base leading-8 text-soft">
              VISEMFOOD was imagined as a premium African hospitality platform that honors culinary tradition while presenting it with contemporary confidence. Every touchpoint, from food styling to digital experience, is designed to feel generous, grounded, and memorable.
            </p>
            <p className="mt-5 text-base leading-8 text-soft">
              The Heritage Hearth design system turns that philosophy into interface language: warm cream, editorial typography, cocoa-brown restraint, and subtle olive accents that echo freshness and care.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
