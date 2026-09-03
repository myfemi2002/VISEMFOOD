import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { useSiteData } from "@/contexts/site-data-context";
import {
  buildTelHref,
  getBusinessLocation,
  getBusinessWhatsAppHref,
} from "@/lib/site-settings";

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
  const location = getBusinessLocation(siteMeta);
  const phoneHref = buildTelHref(siteMeta.phone);
  const secondaryPhoneHref = buildTelHref(siteMeta.secondaryPhone);
  const whatsappHref = getBusinessWhatsAppHref(siteMeta);
  const socialLinks = [
    siteMeta.socialLinks.instagram ? { label: "Instagram", href: siteMeta.socialLinks.instagram } : null,
    siteMeta.socialLinks.facebook ? { label: "Facebook", href: siteMeta.socialLinks.facebook } : null,
    siteMeta.socialLinks.tiktok ? { label: "TikTok", href: siteMeta.socialLinks.tiktok } : null,
    siteMeta.socialLinks.youtube ? { label: "YouTube", href: siteMeta.socialLinks.youtube } : null,
    siteMeta.socialLinks.whatsapp
      ? { label: "WhatsApp", href: siteMeta.socialLinks.whatsapp }
      : whatsappHref
        ? { label: "WhatsApp", href: whatsappHref }
        : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  const contactItems = [
    siteMeta.phone && phoneHref ? { icon: "call", href: phoneHref, label: siteMeta.phone } : null,
    siteMeta.secondaryPhone && secondaryPhoneHref
      ? { icon: "call", href: secondaryPhoneHref, label: siteMeta.secondaryPhone }
      : null,
    siteMeta.email ? { icon: "mail", href: `mailto:${siteMeta.email}`, label: siteMeta.email } : null,
    location.full && location.full !== "Business address pending"
      ? { icon: "location_on", href: null, label: location.full }
      : null,
    siteMeta.hours ? { icon: "schedule", href: null, label: siteMeta.hours } : null,
    whatsappHref ? { icon: "chat", href: whatsappHref, label: "WhatsApp Contact" } : null,
  ].filter(Boolean) as Array<{ icon: string; href: string | null; label: string }>;

  return (
    <footer className="footer-shell mt-20 border-t border-[var(--vf-footer-line)]">
      <div className="page-shell relative py-16 sm:py-18 lg:py-20">
        <div className="footer-grid">
          <div className="footer-brand space-y-5">
            <div>
              <Link to="/" aria-label={`${siteMeta.name || "VISEMFOOD"} home`} className="inline-flex">
                <BrandLogo
                  variant="light"
                  alt={`${siteMeta.name || "VISEMFOOD"} logo`}
                  className="w-[11rem] sm:w-[12.5rem] xl:w-[13.5rem] drop-shadow-[0_8px_18px_rgba(247,241,228,0.08)]"
                />
              </Link>
              <p className="mt-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--vf-footer-accent)]">
                {siteMeta.tagline || "Authentic African Food"}
              </p>
            </div>
            <p className="footer-muted max-w-md text-sm leading-7 sm:text-base">
              Authentic African meals prepared with care for individuals, families, gatherings and special occasions.
            </p>
            {socialLinks.length > 0 ? (
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
            ) : (
              <p className="footer-muted text-sm">Social links will appear here once they are configured in Admin settings.</p>
            )}
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
            {contactItems.length > 0 ? (
              <ul className="space-y-4 text-sm">
                {contactItems.map((item) => (
                  <li key={`${item.icon}-${item.label}`} className="flex items-start gap-3">
                    <span className="material-symbols-rounded footer-muted mt-0.5 text-base">{item.icon}</span>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("https://") ? "_blank" : undefined}
                        rel={item.href.startsWith("https://") ? "noreferrer" : undefined}
                        className="footer-link break-words"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className="footer-muted break-words">{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="footer-muted text-sm">Contact details will appear here once they are configured in Admin settings.</p>
            )}
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
