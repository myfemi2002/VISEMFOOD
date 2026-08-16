import Link from "next/link";
import { getSiteSettings } from "@/lib/data";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/order-now", label: "Order Now" },
  { href: "/trays-coolers", label: "Trays & Coolers" },
  { href: "/catering", label: "Catering" },
  { href: "/contact", label: "Contact" },
  { href: "/our-story", label: "Our Story" }
];

export async function SiteHeader() {
  const site = await getSiteSettings();

  return (
    <header className="border-b border-line bg-surface/95 backdrop-blur">
      <div className="container-shell flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="font-display text-3xl font-semibold tracking-tight text-primary">
          {site.siteName}
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-ink-soft">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 hover:bg-white hover:text-primary ${
                item.label === "Order Now" ? "bg-primary text-white hover:bg-primary-soft hover:text-white" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
