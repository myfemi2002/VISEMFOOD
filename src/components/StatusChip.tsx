import clsx from "clsx";

type StatusChipProps = {
  tone: "neutral" | "success" | "warning" | "danger" | "olive";
  children: React.ReactNode;
};

export function StatusChip({ tone, children }: StatusChipProps) {
  return (
    <span
      className={clsx(
        "status-chip",
        tone === "success" && "status-chip-success",
        tone === "warning" && "status-chip-warning",
        tone === "danger" && "status-chip-danger",
        tone === "olive" && "status-chip-olive",
        tone === "neutral" && "status-chip-neutral",
      )}
    >
      {children}
    </span>
  );
}
