import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getSiteSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();

  return {
    title: `${site.siteName} | Premium Culinary & Hospitality`,
    description:
      "Dynamic premium African culinary platform for food ordering, trays and coolers, catering, and hospitality."
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="container-shell py-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
