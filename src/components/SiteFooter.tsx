import { Link } from "@tanstack/react-router";
import { useSiteData } from "@/contexts/site-data-context";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/trays-coolers", label: "Bowls, Trays & Coolers" },
  { to: "/catering", label: "Catering" },
  { to: "/our-story", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  const { siteMeta } = useSiteData();
  const whatsappNumber =
    siteMeta.whatsappContactNumber || siteMeta.whatsappOrderNumber || siteMeta.phone.replace(/\D/g, "");
  const socialLinks = [
    { label: "Instagram", href: siteMeta.socialLinks.instagram || "https://instagram.com" },
    { label: "Facebook", href: siteMeta.socialLinks.facebook || "https://facebook.com" },
    { label: "WhatsApp", href: siteMeta.socialLinks.whatsapp || `https://wa.me/${whatsappNumber}` },
  ] as const;

  return (
    <footer className="footer-shell mt-20 border-t border-[var(--vf-footer-line)]">
      <div className="page-shell relative py-16 sm:py-18 lg:py-20">
        <div className="footer-grid">
          <div className="footer-brand space-y-5">
            <div>
              <h2 className="heading-display text-[2.5rem] font-bold sm:text-[3.2rem]">{siteMeta.name}</h2>
              <p className="mt-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--vf-footer-accent)]">
                Authentic African Food
              </p>
            </div>
            <p className="footer-muted max-w-md text-sm leading-7 sm:text-base">
              Authentic African meals prepared with care for individuals, families, gatherings and special occasions.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-link inline-flex min-h-11 items-center rounded-full border border-[var(--vf-footer-line)] px-4 text-sm font-medium transition hover:bg-[var(--vf-footer-hover)]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--vf-footer-accent)]">
              Quick Links
            </p>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--vf-footer-accent)]">
              Ordering
            </p>
            <ul className="space-y-3 text-sm">
              <li className="footer-muted">Freshly prepared meals</li>
              <li className="footer-muted">Pickup & delivery support</li>
              <li className="footer-muted">WhatsApp confirmation flow</li>
              <li className="footer-muted">Private & corporate hospitality</li>
            </ul>
            <div className="pt-2">
              <Link to="/menu" className="btn-primary rounded-full px-5 text-sm">
                Order Now
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--vf-footer-accent)]">
              Contact
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="material-symbols-rounded footer-muted mt-0.5 text-base">call</span>
                <a href={`tel:${siteMeta.phone}`} className="footer-link break-words">
                  {siteMeta.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-rounded footer-muted mt-0.5 text-base">mail</span>
                <a href={`mailto:${siteMeta.email}`} className="footer-link break-words">
                  {siteMeta.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-rounded footer-muted mt-0.5 text-base">location_on</span>
                <span className="footer-muted break-words">{siteMeta.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-rounded footer-muted mt-0.5 text-base">schedule</span>
                <span className="footer-muted break-words">{siteMeta.hours}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-rounded footer-muted mt-0.5 text-base">chat</span>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-link break-words"
                >
                  WhatsApp Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--vf-footer-line)] pt-6 text-sm md:flex-row md:items-center md:justify-between">
          <p className="footer-muted">Copyright 2026 VISEMFOOD. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/contact" className="footer-link">
              Privacy Policy
            </Link>
            <Link to="/contact" className="footer-link">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
