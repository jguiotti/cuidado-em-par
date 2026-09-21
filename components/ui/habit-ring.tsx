import type { ReactNode } from "react";

interface HabitRingProps {
  progress: number;
  label: string;
  detail: string;
  children?: ReactNode;
}

/** Circular progress for daily habit snapshot (visual only). */
export function HabitRing({
  progress,
  label,
  detail,
  children,
}: HabitRingProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[88px] w-[88px] shrink-0">
        <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90" aria-hidden>
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="var(--color-surface-raised)"
            strokeWidth="8"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="var(--color-mint-deep)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-mint-deep">
          {children}
        </div>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-base font-bold text-ink">
          {label}{" "}
          <span className="font-semibold text-mint-deep">{clamped}%</span>
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">{detail}</p>
      </div>
    </div>
  );
}
