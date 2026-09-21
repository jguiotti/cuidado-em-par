"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updateSexAssignedAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import {
  ChoiceCard,
  ChoiceCardGroup,
} from "@/components/ui/choice-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { Surface } from "@/components/ui/surface";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import {
  ONBOARDING_TOTAL_STEPS,
  SEX_ASSIGNED_VALUES,
  type SexAssignedAtBirth,
} from "@/lib/onboarding/progress";

interface SexAssignedStepProps {
  initialValue?: SexAssignedAtBirth | null;
}

export function SexAssignedStep({
  initialValue = null,
}: SexAssignedStepProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<SexAssignedAtBirth | null>(
    initialValue,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function goNext(result: { ok: true } | { ok: false; code: string }) {
    if (!result.ok) {
      if (result.code === "unauthenticated") {
        router.replace("/login?next=/onboarding/sex-assigned");
        return;
      }
      if (result.code === "consent_required") {
        router.replace("/onboarding/consent");
        return;
      }
      setError(onboardingCopy.genericError);
      return;
    }
    router.push("/onboarding/clinical");
    router.refresh();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      if (!selected) {
        const result = await updateSexAssignedAction({ skip: true });
        goNext(result);
        return;
      }
      const result = await updateSexAssignedAction({
        sexAssignedAtBirth: selected,
      });
      goNext(result);
    });
  }

  function handleSkip() {
    setError(null);
    startTransition(async () => {
      const result = await updateSexAssignedAction({ skip: true });
      goNext(result);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <ProgressSteps
        current={4}
        total={ONBOARDING_TOTAL_STEPS}
        label={onboardingCopy.progressLabel(4, ONBOARDING_TOTAL_STEPS)}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink">
          {onboardingCopy.sexAssigned.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.sexAssigned.support}
        </p>
      </div>

      <Surface raised className="space-y-2">
        <h2 className="text-sm font-semibold text-ink">
          {onboardingCopy.sexAssigned.whyTitle}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {onboardingCopy.sexAssigned.whyBody}
        </p>
      </Surface>

      <ChoiceCardGroup legend={onboardingCopy.sexAssigned.title}>
        {SEX_ASSIGNED_VALUES.map((value) => (
          <ChoiceCard
            key={value}
            name="sexAssigned"
            value={value}
            label={onboardingCopy.sexAssigned.labels[value]}
            selected={selected === value}
            onSelect={() => setSelected(value)}
          />
        ))}
      </ChoiceCardGroup>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? onboardingCopy.saving
            : selected
              ? onboardingCopy.sexAssigned.cta
              : onboardingCopy.sexAssigned.skip}
        </Button>
        {selected ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={handleSkip}
            className="w-full"
          >
            {onboardingCopy.sexAssigned.skip}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
