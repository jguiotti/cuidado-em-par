import Link from "next/link";

import { Surface } from "@/components/ui/surface";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";

interface LinkStatusCardProps {
  kind: "move" | "eat";
  count: number;
}

export function LinkStatusCard({ kind, count }: LinkStatusCardProps) {
  const copy = kind === "move" ? habitsCopy.move : habitsCopy.eat;
  const href = kind === "move" ? "/workouts" : "/meals";
  const done = count > 0;

  return (
    <Surface className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">{copy.title}</h2>
        <span className="text-sm font-medium text-mint-deep">
          {done ? habitsCopy.statusDone : habitsCopy.statusPending}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">
        {done ? copy.done(count) : copy.pending}
      </p>
      <Link
        href={href}
        className="focus-ring inline-flex min-h-12 items-center justify-center rounded-[var(--radius-soft)] bg-surface-raised px-5 text-base font-semibold text-ink"
      >
        {copy.open}
      </Link>
    </Surface>
  );
}
