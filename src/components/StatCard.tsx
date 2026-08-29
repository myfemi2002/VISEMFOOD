type StatCardProps = {
  label: string;
  value: string;
  note?: string;
};

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <article className="card-surface p-6">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--vf-text-muted)]">
        {label}
      </p>
      <p className="heading-display mt-4 text-[2rem] font-bold text-[var(--vf-text)] sm:text-[2.35rem]">{value}</p>
      {note ? <p className="mt-2 text-sm text-soft">{note}</p> : null}
    </article>
  );
}
