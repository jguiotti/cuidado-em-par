"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { logSleepAction } from "@/app/actions/habits";
import { Button } from "@/components/ui/button";
import { ChoiceCard, ChoiceCardGroup } from "@/components/ui/choice-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";
import {
  SLEEP_QUALITY_VALUES,
  type SleepLogSnapshot,
  type SleepQuality,
} from "@/lib/habits/types";

interface SleepCardProps {
  initial: SleepLogSnapshot | null;
}

const qualityLabels: Record<SleepQuality, string> = {
  poor: habitsCopy.sleep.poor,
  ok: habitsCopy.sleep.ok,
  good: habitsCopy.sleep.good,
};

export function SleepCard({ initial }: SleepCardProps) {
  const router = useRouter();
  const [quality, setQuality] = useState<SleepQuality | null>(
    initial?.quality ?? null,
  );
  const [minutes, setMinutes] = useState(
    initial?.minutes != null ? String(initial.minutes) : "",
  );
  const [message, setMessage] = useState<string | null>(
    initial ? habitsCopy.sleep.saved : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const parsedMinutes =
      minutes.trim() === "" ? null : Number(minutes.trim());

    startTransition(async () => {
      const result = await logSleepAction({
        quality,
        minutes: parsedMinutes,
      });

      if (!result.ok) {
        setError(habitsCopy.genericError);
        return;
      }

      setMessage(habitsCopy.sleep.saved);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-ink">
            {habitsCopy.sleep.title}
          </h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            {habitsCopy.sleep.support}
          </p>
        </div>
        <span className="text-sm font-medium text-mint-deep">
          {initial || message
            ? habitsCopy.statusDone
            : habitsCopy.statusPending}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ChoiceCardGroup legend={habitsCopy.sleep.qualityLegend}>
          {SLEEP_QUALITY_VALUES.map((value) => (
            <ChoiceCard
              key={value}
              name="sleepQuality"
              value={value}
              label={qualityLabels[value]}
              selected={quality === value}
              onSelect={() => setQuality(value)}
            />
          ))}
        </ChoiceCardGroup>

        <TextField
          label={habitsCopy.sleep.minutesLabel}
          hint={habitsCopy.sleep.minutesHint}
          name="sleepMinutes"
          inputMode="numeric"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
          disabled={isPending}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {habitsCopy.sleep.save}
        </Button>
      </form>

      {message && !error ? (
        <p className="text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </Surface>
  );
}
