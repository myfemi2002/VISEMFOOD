import { submitContactInquiry } from "@/app/actions/public";
import { Hero } from "@/components/site/hero";
import { getPageContent, getSiteSettings } from "@/lib/data";

export default async function ContactPage() {
  const [content, site] = await Promise.all([getPageContent("contact"), getSiteSettings()]);

  return (
    <div className="space-y-10">
      <Hero title={content.heroTitle || "Contact"} subtitle="Contact" body={content.heroSubtitle || ""} />
      <section className="grid gap-6 lg:grid-cols-[0.85fr,1.15fr]">
        <article className="card p-8">
          <h2 className="font-display text-3xl text-ink">Support and inquiries</h2>
          <div className="mt-6 space-y-3 text-sm leading-7 text-ink-soft">
            <p>{site.supportEmail}</p>
            <p>{site.supportPhone}</p>
            <p>{site.businessAddress}</p>
            <p>{site.businessHours}</p>
          </div>
        </article>
        <article className="card p-8">
          <form action={submitContactInquiry} className="grid gap-4">
            <input name="fullName" placeholder="Full name" required />
            <input name="phone" placeholder="Phone number" />
            <input name="email" type="email" placeholder="Email address" required />
            <input name="subject" placeholder="Subject" required />
            <textarea name="message" placeholder="Message" rows={6} required />
            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Send Message
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}
