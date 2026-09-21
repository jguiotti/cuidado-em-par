"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { upsertBodyMeasurementAction } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { progressCopy } from "@/lib/i18n/plans-pt-br";

interface BodyMeasurementsFormProps {
  hasConsent: boolean;
  currentWeightKg: number | null;
}

export function BodyMeasurementsForm({
  hasConsent,
  currentWeightKg,
}: BodyMeasurementsFormProps) {
  const router = useRouter();
  const [weight, setWeight] = useState(
    currentWeightKg != null ? String(currentWeightKg) : "",
  );
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!hasConsent) {
    return (
      <Surface className="space-y-2">
        <h2 className="text-xl font-semibold text-ink">
          {progressCopy.measurementsTitle}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {progressCopy.needConsent}
        </p>
      </Surface>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await upsertBodyMeasurementAction({
        weightKg: weight.trim() ? Number(weight) : null,
        waistCm: waist.trim() ? Number(waist) : null,
        hipCm: hip.trim() ? Number(hip) : null,
      });
      if (!result.ok) {
        setError(progressCopy.loadError);
        return;
      }
      setMessage(progressCopy.saved);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {progressCopy.measurementsTitle}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {progressCopy.measurementsSupport}
        </p>
        {currentWeightKg != null ? (
          <p className="text-sm text-ink-soft">
            {progressCopy.currentWeight(currentWeightKg)}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label={progressCopy.weight}
          name="weightKg"
          type="number"
          step="0.1"
          min={1}
          max={500}
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          disabled={isPending}
        />
        <TextField
          label={progressCopy.waist}
          name="waistCm"
          type="number"
          step="0.1"
          min={1}
          max={300}
          value={waist}
          onChange={(event) => setWaist(event.target.value)}
          disabled={isPending}
        />
        <TextField
          label={progressCopy.hip}
          name="hipCm"
          type="number"
          step="0.1"
          min={1}
          max={300}
          value={hip}
          onChange={(event) => setHip(event.target.value)}
          disabled={isPending}
        />
        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
        {message && !error ? (
          <p className="text-sm text-ink-soft" role="status">
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending} className="w-full">
          {progressCopy.saveMeasurement}
        </Button>
      </form>
    </Surface>
  );
}
