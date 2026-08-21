import { siteMeta } from "@/data/mock";

export function SiteFooter() {
  return (
    <footer className="surface-overlay-strong border-soft mt-20 border-t">
      <div className="page-shell grid gap-8 py-12 md:grid-cols-3">
        <div>
          <h2 className="heading-display text-3xl font-bold text-[var(--vf-primary)]">VISEMFOOD</h2>
          <p className="mt-3 max-w-sm text-sm leading-7 text-soft">
            Premium African hospitality with a refined digital ordering, catering, and operations experience.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--vf-tertiary)]">Experience</p>
          <ul className="mt-4 space-y-3 text-sm text-soft">
            <li>Luxury catering</li>
            <li>Trays and coolers</li>
            <li>Private and corporate hospitality</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--vf-tertiary)]">Contact</p>
          <ul className="mt-4 space-y-3 text-sm text-soft">
            <li>{siteMeta.phone}</li>
            <li>{siteMeta.email}</li>
            <li>{siteMeta.address}</li>
            <li>{siteMeta.hours}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
