"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updateHabitPrefsAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { TextField } from "@/components/ui/text-field";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import { ONBOARDING_TOTAL_STEPS } from "@/lib/onboarding/progress";

interface HabitsStepProps {
  initialWaterGoalMl?: number;
}

export function HabitsStep({ initialWaterGoalMl = 2000 }: HabitsStepProps) {
  const router = useRouter();
  const [waterGoalMl, setWaterGoalMl] = useState(String(initialWaterGoalMl));
  const [waterReminder, setWaterReminder] = useState(true);
  const [sleepReminder, setSleepReminder] = useState(true);
  const [sleepBedtime, setSleepBedtime] = useState("");
  const [activePause, setActivePause] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const goal = Number(waterGoalMl);
    if (!Number.isFinite(goal) || goal < 250 || goal > 8000) {
      setError(onboardingCopy.habits.errorWater);
      return;
    }

    startTransition(async () => {
      const result = await updateHabitPrefsAction({
        waterGoalMl: goal,
        waterReminderEnabled: waterReminder,
        sleepReminderEnabled: sleepReminder,
        sleepTargetBedtime: sleepBedtime || null,
        activePauseEnabled: activePause,
      });

      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.replace("/login?next=/onboarding/habits");
          return;
        }
        if (result.code === "invalid_water") {
          setError(onboardingCopy.habits.errorWater);
          return;
        }
        setError(onboardingCopy.genericError);
        return;
      }

      router.replace("/home");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <ProgressSteps
        current={8}
        total={ONBOARDING_TOTAL_STEPS}
        label={onboardingCopy.progressLabel(8, ONBOARDING_TOTAL_STEPS)}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink">
          {onboardingCopy.habits.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.habits.support}
        </p>
      </div>

      <TextField
        label={onboardingCopy.habits.waterLabel}
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
        {onboardingCopy.habits.waterReminder}
      </label>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          className="focus-ring size-5 accent-[var(--color-mint-deep)]"
          checked={sleepReminder}
          onChange={(event) => setSleepReminder(event.target.checked)}
        />
        {onboardingCopy.habits.sleepReminder}
      </label>

      <TextField
        label={onboardingCopy.habits.sleepBedtimeLabel}
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
        {onboardingCopy.habits.pauseReminder}
      </label>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? onboardingCopy.saving : onboardingCopy.habits.cta}
      </Button>
    </form>
  );
}
