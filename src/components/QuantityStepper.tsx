type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
};

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  return (
    <div className="surface-overlay-strong border-soft inline-flex items-center gap-3 rounded-full border px-3 py-2">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}>
        <span className="material-symbols-rounded">remove</span>
      </button>
      <span className="min-w-6 text-center font-semibold">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}>
        <span className="material-symbols-rounded">add</span>
      </button>
    </div>
  );
}
