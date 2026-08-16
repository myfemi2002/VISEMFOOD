import Link from "next/link";

type HeroProps = {
  title: string;
  subtitle?: string | null;
  body?: string | null;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function Hero({ title, subtitle, body, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary-soft to-secondary px-6 py-20 text-white shadow-ambient sm:px-10 lg:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />
      <div className="relative max-w-4xl">
        {subtitle ? (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">{subtitle}</p>
        ) : null}
        <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
        {body ? <p className="mt-6 max-w-2xl text-base leading-8 text-white/85">{body}</p> : null}
        {(primaryCta || secondaryCta) && (
          <div className="mt-8 flex flex-wrap gap-4">
            {primaryCta ? (
              <Link href={primaryCta.href} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary">
                {primaryCta.label}
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white"
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
