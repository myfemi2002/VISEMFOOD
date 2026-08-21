type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  as = "h2",
}: SectionHeadingProps) {
  const HeadingTag = as;

  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--vf-tertiary)]">
        {eyebrow}
      </p>
      <HeadingTag className="heading-display text-4xl font-bold text-[var(--vf-text)] sm:text-5xl">
        {title}
      </HeadingTag>
      {body ? <p className="mt-4 text-base leading-8 text-soft">{body}</p> : null}
    </div>
  );
}
