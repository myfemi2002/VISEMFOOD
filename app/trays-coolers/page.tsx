import { submitBulkInquiry } from "@/app/actions/public";
import { Hero } from "@/components/site/hero";
import { TrayCard } from "@/components/site/tray-card";
import { getTrayPackages, getWhatsAppSettings } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default async function TraysCoolersPage() {
  const [packages, whatsapp] = await Promise.all([getTrayPackages(), getWhatsAppSettings()]);

  return (
    <div className="space-y-12">
      <Hero
        title="Bulk ordering that feels polished, practical, and celebration-ready."
        subtitle="Trays & Coolers"
        body="Choose the right package, then move straight into WhatsApp for confirmation, quantity, and arrangement."
        primaryCta={{ label: "Browse Packages", href: "#packages" }}
        secondaryCta={{ label: "Catering Inquiry", href: "/catering/inquiry" }}
      />

      <section id="packages" className="grid gap-6 lg:grid-cols-2">
        {packages.map((trayPackage: (typeof packages)[number]) => (
          <TrayCard
            key={trayPackage.id}
            name={trayPackage.name}
            shortDescription={trayPackage.shortDescription}
            servingRange={trayPackage.servingRange}
            price={trayPackage.price}
            image={trayPackage.image}
            whatsappUrl={buildWhatsAppUrl({
              phoneNumber: whatsapp.adminPhoneNumber,
              template: trayPackage.whatsappMessageTemplate || whatsapp.defaultTrayMessage,
              name: trayPackage.name,
              price: `NGN ${trayPackage.price}`
            })}
          />
        ))}
      </section>

      <section className="card p-8">
        <h2 className="font-display text-3xl text-ink">Need us to help coordinate a larger quantity?</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">
          Leave your details and the VISEMFOOD team can follow up directly for larger gatherings or custom arrangements.
        </p>
        <form action={submitBulkInquiry} className="mt-8 grid gap-4 lg:grid-cols-2">
          <input name="fullName" placeholder="Full name" required />
          <input name="phone" placeholder="Phone number" required />
          <input name="email" type="email" placeholder="Email (optional)" />
          <input name="quantity" type="number" min="1" placeholder="Quantity" />
          <input name="eventDate" type="date" />
          <textarea name="notes" placeholder="Event details or preferred package" className="lg:col-span-2" rows={4} />
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">
            Submit Bulk Request
          </button>
        </form>
      </section>
    </div>
  );
}
