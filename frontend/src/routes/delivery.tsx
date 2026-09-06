import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { buildMeta } from "@/lib/meta";

export const Route = createFileRoute("/delivery")({
  head: () =>
    buildMeta({
      title: "Delivery Information | VISEMFOOD",
      description: "Preparation, dispatch, and premium delivery guidance for orders, trays, and catering support.",
    }),
  component: DeliveryPage,
});

function DeliveryPage() {
  return (
    <main className="section-gap">
      <div className="page-shell space-y-8">
        <SectionHeading
          eyebrow="Delivery Information"
          title="Clear preparation and dispatch guidance helps every order feel premium."
          body="This page keeps service expectations explicit for food ordering, trays, coolers, and event support."
          as="h1"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Lead Times", "Standard meals typically need same-day confirmation, while trays and event orders require more notice."],
            ["Coverage", "Dispatch is coordinated within Lagos, with final cost shaped by zone, timing, and order format."],
            ["Pickup", "Pickup remains available for customers who prefer direct collection or faster turnaround."],
          ].map(([title, body]) => (
            <article key={title} className="card-surface p-6">
              <h2 className="heading-display text-3xl font-bold">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-soft">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
