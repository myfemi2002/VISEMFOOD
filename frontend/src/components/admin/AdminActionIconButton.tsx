import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type AdminActionIconButtonProps = {
  icon: IconDefinition;
  label: string;
  title: string;
  onClick: () => void;
  tone?: "neutral" | "secondary" | "success" | "danger";
  disabled?: boolean;
};

export function AdminActionIconButton({
  icon,
  label,
  title,
  onClick,
  tone = "neutral",
  disabled = false,
}: AdminActionIconButtonProps) {
  const className =
    tone === "danger"
      ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--vf-danger)]/25 bg-[var(--vf-surface-elevated)] text-[var(--vf-danger)] transition-colors hover:bg-[var(--vf-danger-soft)] disabled:cursor-not-allowed disabled:opacity-45"
      : tone === "success"
        ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--vf-primary)]/20 bg-[var(--vf-primary-light)] text-[var(--vf-primary)] transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
        : tone === "secondary"
          ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--vf-secondary)]/18 bg-[var(--vf-secondary-light)] text-[var(--vf-secondary)] transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
          : "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] text-[var(--vf-text-soft)] transition-colors hover:border-[var(--vf-primary)] hover:bg-[var(--vf-primary-light)] hover:text-[var(--vf-primary)] disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <button type="button" aria-label={label} title={title} onClick={onClick} disabled={disabled} className={className}>
      <FontAwesomeIcon icon={icon} className="text-[0.8rem]" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

export function AdminActionGroup({ children }: { children: ReactNode }) {
  return <div className="flex min-w-[7.75rem] flex-nowrap items-center justify-end gap-1.5 whitespace-nowrap">{children}</div>;
}

