import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ChangeEvent } from "react";

type SearchFieldProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  ariaLabel: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  id?: string;
};

export function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  label,
  className = "block",
  inputClassName = "",
  labelClassName = "mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vf-text-soft)]",
  id,
}: SearchFieldProps) {
  const inputClasses = ["field pr-12", inputClassName].filter(Boolean).join(" ");

  return (
    <label className={className}>
      {label ? <span className={labelClassName}>{label}</span> : <span className="sr-only">{ariaLabel}</span>}
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={inputClasses}
          autoComplete="off"
        />
        <span className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--vf-text-soft)]">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[0.9rem]" />
        </span>
      </div>
    </label>
  );
}
