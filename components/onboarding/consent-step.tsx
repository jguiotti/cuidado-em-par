"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { saveConsentStepAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { Surface } from "@/components/ui/surface";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import { ONBOARDING_TOTAL_STEPS } from "@/lib/onboarding/progress";

export function ConsentStep() {
  const router = useRouter();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptHealth, setAcceptHealth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!acceptTerms || !acceptHealth) {
      setError(onboardingCopy.consent.errorBothRequired);
      return;
    }

    startTransition(async () => {
      const result = await saveConsentStepAction({
        acceptTerms,
        acceptHealthPersonalization: acceptHealth,
      });

      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.replace("/login?next=/onboarding/consent");
          return;
        }
        if (result.code === "consent_required") {
          setError(onboardingCopy.consent.errorBothRequired);
          return;
        }
        setError(onboardingCopy.genericError);
        return;
      }

      router.push("/onboarding/identity");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <ProgressSteps
        current={1}
        total={ONBOARDING_TOTAL_STEPS}
        label={onboardingCopy.progressLabel(1, ONBOARDING_TOTAL_STEPS)}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink">
          {onboardingCopy.consent.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.consent.support}
        </p>
      </div>

      <Surface className="flex flex-col gap-4">
        <label className="flex cursor-pointer gap-3 text-base leading-relaxed text-ink">
          <input
            type="checkbox"
            className="focus-ring mt-1 size-5 shrink-0 rounded accent-[var(--color-mint-deep)]"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
          />
          <span>{onboardingCopy.consent.termsLabel}</span>
        </label>

        <label className="flex cursor-pointer gap-3 text-base leading-relaxed text-ink">
          <input
            type="checkbox"
            className="focus-ring mt-1 size-5 shrink-0 rounded accent-[var(--color-mint-deep)]"
            checked={acceptHealth}
            onChange={(event) => setAcceptHealth(event.target.checked)}
          />
          <span>{onboardingCopy.consent.healthLabel}</span>
        </label>

        <Link
          href="/terms"
          className="focus-ring text-sm font-medium text-mint-deep underline-offset-4 hover:underline"
        >
          {onboardingCopy.consent.privacyLink}
        </Link>
      </Surface>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : onboardingCopy.consent.cta}
      </Button>
    </form>
  );
}
