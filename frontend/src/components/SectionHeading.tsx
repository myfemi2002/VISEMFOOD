type SectionHeadingProps = {
  eyebrow?: string;
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
      {eyebrow ? (
        <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--vf-tertiary)]">
          {eyebrow}
        </p>
      ) : null}
      <HeadingTag className="heading-display text-[2rem] font-bold text-[var(--vf-text)] sm:text-[2.7rem]">
        {title}
      </HeadingTag>
      {body ? <p className="mt-4 text-[0.98rem] leading-7 text-muted sm:text-base">{body}</p> : null}
    </div>
  );
}

