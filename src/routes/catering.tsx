import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { buildMeta } from "@/lib/meta";

export const Route = createFileRoute("/catering")({
  head: () =>
    buildMeta({
      title: "Catering | VISEMFOOD",
      description: "Premium catering overview for weddings, private celebrations, and executive hospitality.",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80",
    }),
  component: CateringPage,
});

function CateringPage() {
  return (
    <main className="section-gap">
      <div className="page-shell space-y-8">
        <SectionHeading
          eyebrow="Catering Overview"
          title="A polished hospitality service for intimate gatherings and large-format events."
          body="VISEMFOOD caters with warmth, premium presentation, and operational clarity from inquiry to delivery."
          as="h1"
        />
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <article className="card-surface p-6">
            <h2 className="heading-display text-3xl font-bold">What you can expect</h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-soft">
              <li>Curated menu planning and service guidance</li>
              <li>Private, family, corporate, and executive event support</li>
              <li>Premium food styling and dependable event-day coordination</li>
            </ul>
          </article>
          <article className="card-surface p-6">
            <h2 className="heading-display text-3xl font-bold">Next step</h2>
            <p className="mt-4 text-sm leading-7 text-soft">
              Share your event date, guest count, preferred menu direction, and service notes, and the team will follow up with a tailored response.
            </p>
            <Link to="/catering/inquiry" className="btn-primary mt-6">
              Open Catering Inquiry
            </Link>
          </article>
        </div>
      </div>
    </main>
  );
}
