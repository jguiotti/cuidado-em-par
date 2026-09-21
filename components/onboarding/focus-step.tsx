"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updateFocusAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import {
  ChoiceCard,
  ChoiceCardGroup,
} from "@/components/ui/choice-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import { ONBOARDING_TOTAL_STEPS } from "@/lib/onboarding/progress";
import {
  HEALTH_FOCUS_VALUES,
  type HealthFocus,
} from "@/lib/tags/constants";

interface FocusStepProps {
  initialHealthFocus?: string | null;
}

export function FocusStep({ initialHealthFocus = null }: FocusStepProps) {
  const router = useRouter();
  const [healthFocus, setHealthFocus] = useState<HealthFocus | null>(
    initialHealthFocus &&
      (HEALTH_FOCUS_VALUES as readonly string[]).includes(initialHealthFocus)
      ? (initialHealthFocus as HealthFocus)
      : null,
  );
  const [weightInput, setWeightInput] = useState("");
  const [acceptBiometrics, setAcceptBiometrics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!healthFocus) {
      setError(onboardingCopy.focus.errorFocus);
      return;
    }

    const trimmedWeight = weightInput.trim();
    const hasWeight = trimmedWeight.length > 0;
    const weightKg = hasWeight ? Number(trimmedWeight.replace(",", ".")) : null;

    if (hasWeight && !acceptBiometrics) {
      setError(onboardingCopy.focus.errorWeightConsent);
      return;
    }

    startTransition(async () => {
      const result = await updateFocusAction({
        healthFocus,
        weightKg: hasWeight ? weightKg : null,
        acceptBiometrics: hasWeight ? acceptBiometrics : false,
      });

      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.replace("/login?next=/onboarding/focus");
          return;
        }
        if (result.code === "consent_required") {
          router.replace("/onboarding/consent");
          return;
        }
        if (result.code === "invalid_focus") {
          setError(onboardingCopy.focus.errorFocus);
          return;
        }
        if (result.code === "biometrics_required") {
          setError(onboardingCopy.focus.errorWeightConsent);
          return;
        }
        if (result.code === "invalid_weight") {
          setError(onboardingCopy.focus.errorWeightInvalid);
          return;
        }
        setError(onboardingCopy.genericError);
        return;
      }

      router.push("/onboarding/sex-assigned");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <ProgressSteps
        current={3}
        total={ONBOARDING_TOTAL_STEPS}
        label={onboardingCopy.progressLabel(3, ONBOARDING_TOTAL_STEPS)}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink">
          {onboardingCopy.focus.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.focus.support}
        </p>
      </div>

      <ChoiceCardGroup legend={onboardingCopy.focus.title}>
        {HEALTH_FOCUS_VALUES.map((value) => (
          <ChoiceCard
            key={value}
            name="healthFocus"
            value={value}
            label={onboardingCopy.healthFocusLabels[value]}
            description={
              value === "body-composition"
                ? onboardingCopy.focus.bodyCompositionHint
                : undefined
            }
            selected={healthFocus === value}
            onSelect={() => setHealthFocus(value)}
          />
        ))}
      </ChoiceCardGroup>

      <Surface raised className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-ink">
            {onboardingCopy.focus.weightTitle}
          </h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            {onboardingCopy.focus.weightSupport}
          </p>
        </div>

        <TextField
          label={onboardingCopy.focus.weightLabel}
          name="weightKg"
          inputMode="decimal"
          value={weightInput}
          onChange={(event) => setWeightInput(event.target.value)}
          disabled={isPending}
        />

        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink">
          <input
            type="checkbox"
            className="focus-ring mt-0.5 size-5 shrink-0 accent-[var(--color-mint-deep)]"
            checked={acceptBiometrics}
            onChange={(event) => setAcceptBiometrics(event.target.checked)}
            disabled={isPending}
          />
          <span>{onboardingCopy.focus.weightConsent}</span>
        </label>
      </Surface>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : onboardingCopy.focus.cta}
      </Button>
    </form>
  );
}
