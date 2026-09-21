import type { ReactNode } from "react";

interface InlineAlertProps {
  children: ReactNode;
  tone?: "info" | "error";
}

export function InlineAlert({ children, tone = "info" }: InlineAlertProps) {
  const toneClass =
    tone === "error"
      ? "bg-blush text-ink"
      : "bg-surface-raised text-ink";

  return (
    <p
      className={`rounded-[var(--radius-soft)] px-4 py-3 text-sm leading-relaxed ${toneClass}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
