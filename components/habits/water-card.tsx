"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { logWaterAction } from "@/app/actions/habits";
import { IconHabits } from "@/components/brand/soft-icons";
import { Button } from "@/components/ui/button";
import { HabitRing } from "@/components/ui/habit-ring";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";
import { WATER_DELTA_OPTIONS } from "@/lib/habits/water";

interface WaterCardProps {
  waterMl: number;
  waterGoalMl: number;
  compact?: boolean;
}

export function WaterCard({
  waterMl,
  waterGoalMl,
  compact = false,
}: WaterCardProps) {
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

  if (compact) {
    return (
      <Surface className="space-y-4 p-5">
        <HabitRing
          progress={progress}
          label={habitsCopy.water.ringLabel}
          detail={habitsCopy.water.ringDetail(total, waterGoalMl)}
        >
          <IconHabits size={22} />
        </HabitRing>
        <div className="flex flex-wrap gap-2">
          {WATER_DELTA_OPTIONS.map((delta) => (
            <Button
              key={delta}
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => handleAdd(delta)}
              className="min-h-11 flex-1 rounded-[var(--radius-pill)] bg-mint text-ink"
            >
              {habitsCopy.water.add(delta)}
            </Button>
          ))}
        </div>
        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
      </Surface>
    );
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

      <HabitRing
        progress={progress}
        label={habitsCopy.water.ringLabel}
        detail={habitsCopy.water.ringDetail(total, waterGoalMl)}
      >
        <IconHabits size={22} />
      </HabitRing>

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
