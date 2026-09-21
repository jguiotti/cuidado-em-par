"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updateHabitPrefsFromAppAction } from "@/app/actions/habits";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import type { HabitPrefsSnapshot } from "@/lib/habits/types";
import { plansCopy } from "@/lib/i18n/plans-pt-br";

interface WorkoutAvailabilityFormProps {
  initial: HabitPrefsSnapshot;
}

export function WorkoutAvailabilityForm({
  initial,
}: WorkoutAvailabilityFormProps) {
  const router = useRouter();
  const [minutes, setMinutes] = useState(String(initial.workoutMinutesPerDay));
  const [weekdays, setWeekdays] = useState<number[]>(initial.workoutWeekdays);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleDay(day: number) {
    setWeekdays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const mins = Number(minutes);
    if (!Number.isFinite(mins) || mins < 5 || mins > 120) {
      setError(plansCopy.availability.errorMinutes);
      return;
    }

    startTransition(async () => {
      const result = await updateHabitPrefsFromAppAction({
        waterGoalMl: initial.waterGoalMl,
        waterReminderEnabled: initial.waterReminderEnabled,
        sleepReminderEnabled: initial.sleepReminderEnabled,
        sleepTargetBedtime: initial.sleepTargetBedtime,
        activePauseEnabled: initial.activePauseEnabled,
        activePauseIntervalMinutes: initial.activePauseIntervalMinutes,
        workoutMinutesPerDay: mins,
        workoutWeekdays: weekdays,
      });

      if (!result.ok) {
        setError(plansCopy.genericError);
        return;
      }

      setMessage(plansCopy.availability.saved);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {plansCopy.availability.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {plansCopy.availability.support}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label={plansCopy.availability.minutes}
          name="workoutMinutes"
          type="number"
          min={5}
          max={120}
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
          disabled={isPending}
          required
        />

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-ink">
            {plansCopy.availability.weekdays}
          </legend>
          <div className="flex flex-wrap gap-2">
            {plansCopy.availability.weekdayLabels.map((label, day) => {
              const selected = weekdays.includes(day);
              return (
                <button
                  key={label}
                  type="button"
                  className={`focus-ring min-h-10 min-w-12 rounded-[var(--radius-pill)] px-3 text-sm font-semibold ${
                    selected
                      ? "bg-mint text-mint-deep"
                      : "bg-surface-raised text-ink-soft"
                  }`}
                  aria-pressed={selected}
                  disabled={isPending}
                  onClick={() => toggleDay(day)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
        {message && !error ? (
          <p className="text-sm text-ink-soft" role="status">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="w-full">
          {plansCopy.availability.save}
        </Button>
      </form>
    </Surface>
  );
}
