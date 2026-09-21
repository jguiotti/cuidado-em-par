"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updateHabitPrefsFromAppAction } from "@/app/actions/habits";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";
import type { HabitPrefsSnapshot } from "@/lib/habits/types";

interface HabitPrefsFormProps {
  initial: HabitPrefsSnapshot;
}

export function HabitPrefsForm({ initial }: HabitPrefsFormProps) {
  const router = useRouter();
  const [waterGoalMl, setWaterGoalMl] = useState(String(initial.waterGoalMl));
  const [waterReminder, setWaterReminder] = useState(
    initial.waterReminderEnabled,
  );
  const [sleepReminder, setSleepReminder] = useState(
    initial.sleepReminderEnabled,
  );
  const [sleepBedtime, setSleepBedtime] = useState(
    initial.sleepTargetBedtime ?? "",
  );
  const [activePause, setActivePause] = useState(initial.activePauseEnabled);
  const [pauseInterval, setPauseInterval] = useState(
    String(initial.activePauseIntervalMinutes),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const goal = Number(waterGoalMl);
    const interval = Number(pauseInterval);

    if (!Number.isFinite(goal) || goal < 250 || goal > 8000) {
      setError(habitsCopy.prefs.errorWater);
      return;
    }
    if (!Number.isFinite(interval) || interval < 30 || interval > 240) {
      setError(habitsCopy.prefs.errorInterval);
      return;
    }

    startTransition(async () => {
      const result = await updateHabitPrefsFromAppAction({
        waterGoalMl: goal,
        waterReminderEnabled: waterReminder,
        sleepReminderEnabled: sleepReminder,
        sleepTargetBedtime: sleepBedtime || null,
        activePauseEnabled: activePause,
        activePauseIntervalMinutes: interval,
        workoutMinutesPerDay: initial.workoutMinutesPerDay,
        workoutWeekdays: initial.workoutWeekdays,
      });

      if (!result.ok) {
        if (result.code === "invalid_water") {
          setError(habitsCopy.prefs.errorWater);
          return;
        }
        if (result.code === "invalid_interval") {
          setError(habitsCopy.prefs.errorInterval);
          return;
        }
        setError(habitsCopy.genericError);
        return;
      }

      setMessage(habitsCopy.prefs.saved);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {habitsCopy.prefs.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {habitsCopy.prefs.support}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label={habitsCopy.prefs.waterLabel}
          name="waterGoalMl"
          inputMode="numeric"
          value={waterGoalMl}
          onChange={(event) => setWaterGoalMl(event.target.value)}
          disabled={isPending}
        />

        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="focus-ring size-5 accent-[var(--color-mint-deep)]"
            checked={waterReminder}
            onChange={(event) => setWaterReminder(event.target.checked)}
          />
          {habitsCopy.prefs.waterReminder}
        </label>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="focus-ring size-5 accent-[var(--color-mint-deep)]"
            checked={sleepReminder}
            onChange={(event) => setSleepReminder(event.target.checked)}
          />
          {habitsCopy.prefs.sleepReminder}
        </label>

        <TextField
          label={habitsCopy.prefs.sleepBedtimeLabel}
          name="sleepBedtime"
          type="time"
          value={sleepBedtime}
          onChange={(event) => setSleepBedtime(event.target.value)}
          disabled={isPending}
        />

        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="focus-ring size-5 accent-[var(--color-mint-deep)]"
            checked={activePause}
            onChange={(event) => setActivePause(event.target.checked)}
          />
          {habitsCopy.prefs.pauseEnabled}
        </label>

        <TextField
          label={habitsCopy.prefs.pauseIntervalLabel}
          name="pauseInterval"
          inputMode="numeric"
          value={pauseInterval}
          onChange={(event) => setPauseInterval(event.target.value)}
          disabled={isPending}
        />

        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
        {message && !error ? (
          <p className="text-sm text-ink-soft" role="status">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="w-full">
          {habitsCopy.prefs.save}
        </Button>
      </form>
    </Surface>
  );
}
