import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { SessionPayload } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/trays-coolers", label: "Trays & Coolers" },
  { href: "/admin/catering-inquiries", label: "Catering Inquiries" },
  { href: "/admin/contact-inquiries", label: "Contact Inquiries" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/content", label: "Website Content" },
  { href: "/admin/media-settings", label: "Media Settings" },
  { href: "/admin/whatsapp-settings", label: "WhatsApp Settings" },
  { href: "/admin/site-settings", label: "Site Settings" }
];

export function AdminShell({
  user,
  children
}: {
  user: SessionPayload;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface lg:grid-cols-[280px,1fr]">
      <aside className="border-r border-line bg-white">
        <div className="p-6">
          <Link href="/admin" className="font-display text-3xl text-primary">
            VISEMFOOD
          </Link>
          <p className="mt-2 text-sm text-ink-soft">{user.name}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">{user.role.replaceAll("_", " ")}</p>
        </div>
        <nav className="space-y-1 px-4 pb-6">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-xl px-4 py-3 text-sm font-medium text-ink-soft hover:bg-surface-muted hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-line bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Admin Workspace</p>
              <h1 className="font-display text-3xl text-ink">Operations & Content Management</h1>
            </div>
            <form action={logoutAction}>
              <button className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft">
                Logout
              </button>
            </form>
          </div>
        </header>
        <main className="space-y-8 p-6">{children}</main>
      </div>
    </div>
  );
}
