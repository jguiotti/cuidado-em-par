"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updateCycleAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import {
  ChoiceCard,
  ChoiceCardGroup,
} from "@/components/ui/choice-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import { ONBOARDING_TOTAL_STEPS } from "@/lib/onboarding/progress";
import type { CycleMode } from "@/lib/tags/constants";

type CycleChoice = "skip" | CycleMode;

export function CycleStep() {
  const router = useRouter();
  const [choice, setChoice] = useState<CycleChoice>("skip");
  const [trimester, setTrimester] = useState<1 | 2 | 3 | null>(null);
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateCycleAction({
        choice,
        trimester: choice === "pregnancy" ? trimester ?? undefined : undefined,
        acceptCycleConsent: choice === "skip" ? false : acceptConsent,
      });

      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.replace("/login?next=/onboarding/cycle");
          return;
        }
        if (result.code === "consent_required") {
          router.replace("/onboarding/consent");
          return;
        }
        if (result.code === "cycle_consent_required") {
          setError(onboardingCopy.cycle.errorConsent);
          return;
        }
        if (result.code === "trimester_required") {
          setError(onboardingCopy.cycle.errorTrimester);
          return;
        }
        setError(onboardingCopy.genericError);
        return;
      }

      router.push("/onboarding/habits");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <ProgressSteps
        current={7}
        total={ONBOARDING_TOTAL_STEPS}
        label={onboardingCopy.progressLabel(7, ONBOARDING_TOTAL_STEPS)}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink">
          {onboardingCopy.cycle.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.cycle.support}
        </p>
      </div>

      <ChoiceCardGroup legend={onboardingCopy.cycle.title}>
        <ChoiceCard
          name="cycle"
          value="skip"
          label={onboardingCopy.cycle.skip}
          selected={choice === "skip"}
          onSelect={() => setChoice("skip")}
        />
        <ChoiceCard
          name="cycle"
          value="menstrual-cycle"
          label={onboardingCopy.cycle.menstrual}
          description={onboardingCopy.cycle.phaseHint}
          selected={choice === "menstrual-cycle"}
          onSelect={() => setChoice("menstrual-cycle")}
        />
        <ChoiceCard
          name="cycle"
          value="pregnancy"
          label={onboardingCopy.cycle.pregnancy}
          selected={choice === "pregnancy"}
          onSelect={() => setChoice("pregnancy")}
        />
        <ChoiceCard
          name="cycle"
          value="postpartum"
          label={onboardingCopy.cycle.postpartum}
          selected={choice === "postpartum"}
          onSelect={() => setChoice("postpartum")}
        />
      </ChoiceCardGroup>

      {choice === "pregnancy" ? (
        <ChoiceCardGroup legend={onboardingCopy.cycle.trimesterLegend}>
          <ChoiceCard
            name="trimester"
            value="1"
            label={onboardingCopy.cycle.trimester1}
            selected={trimester === 1}
            onSelect={() => setTrimester(1)}
          />
          <ChoiceCard
            name="trimester"
            value="2"
            label={onboardingCopy.cycle.trimester2}
            selected={trimester === 2}
            onSelect={() => setTrimester(2)}
          />
          <ChoiceCard
            name="trimester"
            value="3"
            label={onboardingCopy.cycle.trimester3}
            selected={trimester === 3}
            onSelect={() => setTrimester(3)}
          />
        </ChoiceCardGroup>
      ) : null}

      {choice !== "skip" ? (
        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink">
          <input
            type="checkbox"
            className="focus-ring mt-0.5 size-5 shrink-0 accent-[var(--color-mint-deep)]"
            checked={acceptConsent}
            onChange={(event) => setAcceptConsent(event.target.checked)}
          />
          <span>{onboardingCopy.cycle.consent}</span>
        </label>
      ) : null}

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? onboardingCopy.saving : onboardingCopy.cycle.cta}
      </Button>
    </form>
  );
}
