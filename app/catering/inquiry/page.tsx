import { submitCateringInquiry } from "@/app/actions/public";
import { Hero } from "@/components/site/hero";

export default function CateringInquiryPage() {
  return (
    <div className="space-y-10">
      <Hero
        title="Tell us about the event, and we'll help shape the hospitality."
        subtitle="Catering Inquiry"
        body="Share the essentials and VISEMFOOD will follow up with a premium, tailored response."
      />
      <section className="card p-8">
        <form action={submitCateringInquiry} className="grid gap-4 lg:grid-cols-2">
          <input name="fullName" placeholder="Full name" required />
          <input name="phone" placeholder="Phone number" required />
          <input name="email" type="email" placeholder="Email address" required />
          <input name="eventType" placeholder="Event type" required />
          <input name="eventDate" type="date" />
          <input name="guestCount" type="number" min="1" placeholder="Guest count" />
          <input
            name="preferredMenu"
            placeholder="Preferred menu or dishes"
            className="lg:col-span-2"
          />
          <textarea
            name="notes"
            placeholder="Additional notes"
            className="lg:col-span-2"
            rows={5}
          />
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">
            Submit Catering Inquiry
          </button>
        </form>
      </section>
    </div>
  );
}
