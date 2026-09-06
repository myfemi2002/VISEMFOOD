type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
};

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  return (
    <div className="surface-overlay-strong border-soft inline-flex min-h-13 items-center gap-2 rounded-full border px-2 py-2 shadow-[var(--vf-shadow-soft)] sm:gap-3 sm:px-3">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--vf-secondary)] transition-colors hover:bg-[var(--vf-primary-light)] hover:text-[var(--vf-primary)]"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        <span className="material-symbols-rounded">remove</span>
      </button>
      <span className="min-w-8 text-center text-sm font-semibold text-[var(--vf-text)] sm:text-base">{value}</span>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--vf-secondary)] transition-colors hover:bg-[var(--vf-primary-light)] hover:text-[var(--vf-primary)]"
        onClick={() => onChange(value + 1)}
      >
        <span className="material-symbols-rounded">add</span>
      </button>
    </div>
  );
}
