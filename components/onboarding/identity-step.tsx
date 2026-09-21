"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updateIdentityAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { TextField } from "@/components/ui/text-field";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import { ONBOARDING_TOTAL_STEPS } from "@/lib/onboarding/progress";

interface IdentityStepProps {
  initialDisplayName?: string | null;
  initialGenderIdentity?: string | null;
}

export function IdentityStep({
  initialDisplayName = "",
  initialGenderIdentity = "",
}: IdentityStepProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [genderIdentity, setGenderIdentity] = useState(
    initialGenderIdentity ?? "",
  );
  const [skipGender, setSkipGender] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateIdentityAction({
        displayName,
        genderIdentity: skipGender ? null : genderIdentity,
        skipGender,
      });

      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.replace("/login?next=/onboarding/identity");
          return;
        }
        if (result.code === "consent_required") {
          router.replace("/onboarding/consent");
          return;
        }
        if (result.code === "invalid_name") {
          setError(onboardingCopy.identity.errorName);
          return;
        }
        setError(onboardingCopy.genericError);
        return;
      }

      router.push("/onboarding/focus");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <ProgressSteps
        current={2}
        total={ONBOARDING_TOTAL_STEPS}
        label={onboardingCopy.progressLabel(2, ONBOARDING_TOTAL_STEPS)}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink">
          {onboardingCopy.identity.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.identity.support}
        </p>
      </div>

      <TextField
        label={onboardingCopy.identity.displayNameLabel}
        name="displayName"
        autoComplete="nickname"
        required
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder={onboardingCopy.identity.displayNamePlaceholder}
        disabled={isPending}
      />

      <div className="flex flex-col gap-3">
        <TextField
          label={onboardingCopy.identity.genderLabel}
          name="genderIdentity"
          value={skipGender ? "" : genderIdentity}
          onChange={(event) => setGenderIdentity(event.target.value)}
          placeholder={onboardingCopy.identity.genderPlaceholder}
          disabled={isPending || skipGender}
        />
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="focus-ring size-5 accent-[var(--color-mint-deep)]"
            checked={skipGender}
            onChange={(event) => setSkipGender(event.target.checked)}
          />
          {onboardingCopy.identity.skipGender}
        </label>
      </div>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : onboardingCopy.identity.cta}
      </Button>
    </form>
  );
}
