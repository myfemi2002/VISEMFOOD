import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-2xl p-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Not Found</p>
      <h1 className="mt-4 font-display text-5xl text-ink">This page could not be found.</h1>
      <p className="mt-4 text-sm leading-7 text-ink-soft">
        The content may have been unpublished or the link may be outdated.
      </p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">
        Return Home
      </Link>
    </div>
  );
}
