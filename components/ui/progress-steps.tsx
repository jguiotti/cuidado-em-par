interface ProgressStepsProps {
  current: number;
  total: number;
  label: string;
  phaseLabel?: string;
}

export function ProgressSteps({
  current,
  total,
  label,
  phaseLabel,
}: ProgressStepsProps) {
  const safeTotal = Math.max(total, 1);
  const safeCurrent = Math.min(Math.max(current, 1), safeTotal);
  const percent = Math.round((safeCurrent / safeTotal) * 100);

  return (
    <div className="flex flex-col gap-2" aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        {phaseLabel ? (
          <p className="text-sm font-medium text-ink-soft">{phaseLabel}</p>
        ) : null}
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-[var(--radius-pill)] bg-surface-raised"
        role="progressbar"
        aria-valuenow={safeCurrent}
        aria-valuemin={1}
        aria-valuemax={safeTotal}
      >
        <div
          className="h-full rounded-[var(--radius-pill)] bg-mint-deep transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
