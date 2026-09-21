"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updateMobilityAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import {
  ChoiceCard,
  ChoiceCardGroup,
} from "@/components/ui/choice-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import {
  MOBILITY_VALUES,
  ONBOARDING_TOTAL_STEPS,
  type MobilityProfile,
} from "@/lib/onboarding/progress";

export function MobilityStep() {
  const router = useRouter();
  const [mobility, setMobility] = useState<MobilityProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!mobility) {
      setError(onboardingCopy.mobility.error);
      return;
    }

    startTransition(async () => {
      const result = await updateMobilityAction({ mobility });
      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.replace("/login?next=/onboarding/mobility");
          return;
        }
        if (result.code === "consent_required") {
          router.replace("/onboarding/consent");
          return;
        }
        setError(onboardingCopy.genericError);
        return;
      }

      router.push("/onboarding/nutrition");
      router.refresh();
    });
  }

  const labels: Record<MobilityProfile, string> = {
    full: onboardingCopy.mobility.full,
    wheelchair: onboardingCopy.mobility.wheelchair,
    reduced: onboardingCopy.mobility.reduced,
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <ProgressSteps
        current={6}
        total={ONBOARDING_TOTAL_STEPS}
        label={onboardingCopy.progressLabel(6, ONBOARDING_TOTAL_STEPS)}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink">
          {onboardingCopy.mobility.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.mobility.support}
        </p>
      </div>

      <ChoiceCardGroup legend={onboardingCopy.mobility.title}>
        {MOBILITY_VALUES.map((value) => (
          <ChoiceCard
            key={value}
            name="mobility"
            value={value}
            label={labels[value]}
            selected={mobility === value}
            onSelect={() => setMobility(value)}
          />
        ))}
      </ChoiceCardGroup>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? onboardingCopy.saving : onboardingCopy.mobility.cta}
      </Button>
    </form>
  );
}
