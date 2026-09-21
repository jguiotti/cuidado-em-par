"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { logSleepAction } from "@/app/actions/habits";
import { IconMoon } from "@/components/brand/soft-icons";
import { Button } from "@/components/ui/button";
import { ChoiceCard, ChoiceCardGroup } from "@/components/ui/choice-card";
import { HabitRing } from "@/components/ui/habit-ring";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { sleepMinutesToHoursLabel } from "@/lib/habits/sleep";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";
import {
  SLEEP_QUALITY_VALUES,
  type SleepLogSnapshot,
  type SleepQuality,
} from "@/lib/habits/types";

interface SleepCardProps {
  initial: SleepLogSnapshot | null;
  compact?: boolean;
}

const qualityLabels: Record<SleepQuality, string> = {
  poor: habitsCopy.sleep.poor,
  ok: habitsCopy.sleep.ok,
  good: habitsCopy.sleep.good,
};

function sleepProgress(initial: SleepLogSnapshot | null): number {
  if (!initial) {
    return 0;
  }
  if (initial.minutes != null && initial.minutes > 0) {
    return Math.min(100, Math.round((initial.minutes / 480) * 100));
  }
  if (initial.quality === "good") {
    return 90;
  }
  if (initial.quality === "ok") {
    return 70;
  }
  if (initial.quality === "poor") {
    return 40;
  }
  return 100;
}

export function SleepCard({ initial, compact = false }: SleepCardProps) {
  const router = useRouter();
  const [quality, setQuality] = useState<SleepQuality | null>(
    initial?.quality ?? null,
  );
  const [hours, setHours] = useState(
    initial?.minutes != null ? sleepMinutesToHoursLabel(initial.minutes) : "",
  );
  const [message, setMessage] = useState<string | null>(
    initial ? habitsCopy.sleep.saved : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(!compact || !initial);

  const progress = sleepProgress(initial);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await logSleepAction({
        quality,
        hours: hours.trim() === "" ? null : hours.trim(),
      });

      if (!result.ok) {
        setError(
          result.code === "invalid_sleep"
            ? habitsCopy.sleep.invalidHours
            : habitsCopy.genericError,
        );
        return;
      }

      setMessage(habitsCopy.sleep.saved);
      setExpanded(false);
      router.refresh();
    });
  }

  if (compact && !expanded) {
    return (
      <Surface className="space-y-4 p-5">
        <HabitRing
          progress={progress}
          label={habitsCopy.sleep.ringLabel}
          detail={
            initial
              ? habitsCopy.sleep.ringDetail(initial.minutes)
              : habitsCopy.sleep.ringEmpty
          }
        >
          <IconMoon size={22} />
        </HabitRing>
        <Button
          type="button"
          variant="secondary"
          className="w-full rounded-[var(--radius-pill)]"
          onClick={() => setExpanded(true)}
        >
          {habitsCopy.sleep.adjust}
        </Button>
      </Surface>
    );
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
          label={habitsCopy.sleep.hoursLabel}
          hint={habitsCopy.sleep.hoursHint}
          name="sleepHours"
          inputMode="decimal"
          value={hours}
          onChange={(event) => setHours(event.target.value)}
          disabled={isPending}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {habitsCopy.sleep.save}
        </Button>
        {compact ? (
          <button
            type="button"
            className="focus-ring w-full text-sm font-medium text-ink-soft"
            onClick={() => setExpanded(false)}
          >
            {habitsCopy.sleep.cancelAdjust}
          </button>
        ) : null}
      </form>

      {message && !error ? (
        <p className="text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
      {!compact ? (
        <Link
          href="/habits"
          className="focus-ring text-sm font-semibold text-mint-deep"
        >
          {habitsCopy.prefs.linkFromHome}
        </Link>
      ) : null}
    </Surface>
  );
}
