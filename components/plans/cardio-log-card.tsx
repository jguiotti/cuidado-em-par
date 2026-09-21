"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { logCardioAction } from "@/app/actions/habits";
import { Button } from "@/components/ui/button";
import {
  ChoiceCard,
  ChoiceCardGroup,
} from "@/components/ui/choice-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { plansCopy } from "@/lib/i18n/plans-pt-br";
import type { CardioSuggestion } from "@/lib/plans/daily-movement";

interface CardioLogCardProps {
  suggestion: CardioSuggestion;
  initialMinutes?: number;
  allowRun: boolean;
}

export function CardioLogCard({
  suggestion,
  initialMinutes = 0,
  allowRun,
}: CardioLogCardProps) {
  const router = useRouter();
  const defaultMode =
    suggestion === "run" && allowRun
      ? "run"
      : suggestion === "walk" || suggestion === "seated" || !allowRun
        ? "walk"
        : "walk";
  const [mode, setMode] = useState<"walk" | "run">(
    allowRun ? defaultMode : "walk",
  );
  const [minutes, setMinutes] = useState(
    initialMinutes > 0 ? String(initialMinutes) : "20",
  );
  const [distance, setDistance] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const mins = Number(minutes);
    const dist = distance.trim() ? Number(distance) : null;

    startTransition(async () => {
      const result = await logCardioAction({
        mode: allowRun ? mode : "walk",
        minutes: mins,
        distanceM: dist,
      });
      if (!result.ok) {
        setError(plansCopy.genericError);
        return;
      }
      setMessage(plansCopy.cardio.saved);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-ink">{plansCopy.cardio.title}</h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          {plansCopy.cardio.support}
        </p>
        <p className="text-sm font-medium text-mint-deep">
          {plansCopy.cardio.suggestion[suggestion]}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {allowRun ? (
          <ChoiceCardGroup legend={plansCopy.cardio.title}>
            <ChoiceCard
              name="cardioMode"
              value="walk"
              label={plansCopy.cardio.walk}
              selected={mode === "walk"}
              onSelect={() => setMode("walk")}
            />
            <ChoiceCard
              name="cardioMode"
              value="run"
              label={plansCopy.cardio.run}
              selected={mode === "run"}
              onSelect={() => setMode("run")}
            />
          </ChoiceCardGroup>
        ) : (
          <p className="text-sm font-semibold text-ink">
            {plansCopy.cardio.walk}
          </p>
        )}

        <TextField
          label={plansCopy.cardio.minutes}
          name="cardioMinutes"
          type="number"
          min={1}
          max={300}
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
          disabled={isPending}
          required
        />
        <TextField
          label={plansCopy.cardio.distance}
          name="cardioDistance"
          type="number"
          min={0}
          max={100000}
          value={distance}
          onChange={(event) => setDistance(event.target.value)}
          disabled={isPending}
        />

        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
        {message && !error ? (
          <p className="text-sm text-ink-soft" role="status">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="w-full">
          {plansCopy.cardio.save}
        </Button>
      </form>
    </Surface>
  );
}
