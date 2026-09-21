"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { logWaterAction } from "@/app/actions/habits";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";
import { WATER_DELTA_OPTIONS } from "@/lib/habits/water";

interface WaterCardProps {
  waterMl: number;
  waterGoalMl: number;
}

export function WaterCard({ waterMl, waterGoalMl }: WaterCardProps) {
  const router = useRouter();
  const [total, setTotal] = useState(waterMl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const progress =
    waterGoalMl > 0 ? Math.min(100, Math.round((total / waterGoalMl) * 100)) : 0;

  function handleAdd(delta: number) {
    setError(null);
    startTransition(async () => {
      const result = await logWaterAction(delta);
      if (!result.ok) {
        setError(habitsCopy.genericError);
        return;
      }
      setTotal(result.data.waterMl);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-ink">
            {habitsCopy.water.title}
          </h2>
          <p className="text-sm text-ink-soft">
            {habitsCopy.water.meta(waterGoalMl)}
          </p>
        </div>
        <span className="text-sm font-medium text-mint-deep">
          {total >= waterGoalMl
            ? habitsCopy.statusDone
            : habitsCopy.statusPending}
        </span>
      </div>

      <p className="text-base font-semibold text-ink" aria-live="polite">
        {habitsCopy.water.total(total)}
      </p>

      <div
        className="h-3 overflow-hidden rounded-full bg-surface-raised"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={habitsCopy.water.progressLabel}
      >
        <div
          className="h-full rounded-full bg-mint-deep transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {WATER_DELTA_OPTIONS.map((delta) => (
          <Button
            key={delta}
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => handleAdd(delta)}
            className="min-h-12 flex-1"
          >
            {habitsCopy.water.add(delta)}
          </Button>
        ))}
      </div>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </Surface>
  );
}
