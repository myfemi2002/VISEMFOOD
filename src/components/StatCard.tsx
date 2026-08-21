type StatCardProps = {
  label: string;
  value: string;
  note?: string;
};

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <article className="card-surface p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--vf-text-soft)]">
        {label}
      </p>
      <p className="heading-display mt-4 text-4xl font-bold text-[var(--vf-text)]">{value}</p>
      {note ? <p className="mt-2 text-sm text-soft">{note}</p> : null}
    </article>
  );
}
