import Link from "next/link";
import { getSiteSettings } from "@/lib/data";

export async function SiteFooter() {
  const site = await getSiteSettings();

  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-3">
        <div>
          <h2 className="font-display text-2xl text-primary">{site.siteName}</h2>
          <p className="mt-3 max-w-sm text-sm leading-7 text-ink-soft">
            Premium African culinary hospitality with a dynamic ordering, catering, and admin-driven content experience.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-2 text-sm text-ink-soft">
            <Link href="/order-now">Order Now</Link>
            <Link href="/trays-coolers">Trays & Coolers</Link>
            <Link href="/catering">Catering</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Contact</h3>
          <div className="mt-4 space-y-2 text-sm text-ink-soft">
            <p>{site.supportEmail}</p>
            <p>{site.supportPhone}</p>
            <p>{site.businessAddress}</p>
            <p>{site.businessHours}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
