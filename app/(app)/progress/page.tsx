import Link from "next/link";
import { redirect } from "next/navigation";

import { getProgressSnapshotAction } from "@/app/actions/progress";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { BodyMeasurementsForm } from "@/components/progress/body-measurements-form";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { redirectIfTermsRevoked } from "@/lib/account/terms-gate";
import { progressCopy } from "@/lib/i18n/plans-pt-br";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

interface ProgressPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function ProgressPage({ searchParams }: ProgressPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/progress");
  }

  await redirectIfTermsRevoked();

  const onboarding = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(onboarding);
  if (step !== "completed") {
    redirect(pathForOnboardingStep(step));
  }

  const params = await searchParams;
  const rangeDays: 7 | 30 = params.range === "30" ? 30 : 7;
  const snapshot = await getProgressSnapshotAction(rangeDays);

  if (!snapshot.ok) {
    return (
      <main className="flex flex-1 flex-col gap-4">
        <AppTopBar title={progressCopy.title} />
        <InlineAlert tone="error">{progressCopy.loadError}</InlineAlert>
      </main>
    );
  }

  const data = snapshot.data;
  const firstMeasure = data.measurements[0];
  const lastMeasure = data.measurements[data.measurements.length - 1];

  const weightDelta =
    firstMeasure?.weightKg != null && lastMeasure?.weightKg != null
      ? lastMeasure.weightKg - firstMeasure.weightKg
      : null;

  return (
    <main className="flex flex-1 flex-col gap-6">
      <AppTopBar title={progressCopy.title} />

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-ink">{progressCopy.title}</h2>
        <p className="text-base leading-relaxed text-ink-soft">
          {progressCopy.support}
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href="/progress?range=7"
          className={`focus-ring inline-flex min-h-10 items-center rounded-[var(--radius-pill)] px-4 text-sm font-semibold ${
            rangeDays === 7
              ? "bg-mint text-mint-deep"
              : "bg-surface-raised text-ink-soft"
          }`}
        >
          {progressCopy.range7}
        </Link>
        <Link
          href="/progress?range=30"
          className={`focus-ring inline-flex min-h-10 items-center rounded-[var(--radius-pill)] px-4 text-sm font-semibold ${
            rangeDays === 30
              ? "bg-mint text-mint-deep"
              : "bg-surface-raised text-ink-soft"
          }`}
        >
          {progressCopy.range30}
        </Link>
      </div>

      <Surface className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-ink">
            {progressCopy.consistencyTitle}
          </h3>
          <p className="text-sm text-ink-soft">
            {progressCopy.careDays(data.careDays, data.rangeDays)}
          </p>
          <p className="text-sm text-ink-soft">
            {progressCopy.cardio}:{" "}
            {progressCopy.cardioSummary(
              data.totalCardioMinutes,
              data.totalCardioDistanceM,
            )}
          </p>
        </div>

        <ul className="space-y-2">
          {data.days.map((day) => {
            const cared =
              day.waterMl > 0 ||
              day.hasSleep ||
              day.pauseCount > 0 ||
              day.workoutCount > 0 ||
              day.mealCount > 0 ||
              day.cardioMinutes > 0;
            return (
              <li
                key={day.day}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[1rem] bg-surface-raised px-3 py-2 text-sm"
              >
                <span className="font-semibold text-ink">{day.day.slice(5)}</span>
                <span className="text-ink-soft">
                  {cared ? progressCopy.dayCare : progressCopy.dayRest}
                </span>
                <span className="w-full text-xs text-ink-soft">
                  {[
                    day.waterMl > 0 ? progressCopy.water : null,
                    day.hasSleep ? progressCopy.sleep : null,
                    day.pauseCount > 0 ? progressCopy.pause : null,
                    day.workoutCount > 0 ? progressCopy.workout : null,
                    day.mealCount > 0 ? progressCopy.meal : null,
                    day.cardioMinutes > 0 ? progressCopy.cardio : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </span>
              </li>
            );
          })}
        </ul>
      </Surface>

      <BodyMeasurementsForm
        hasConsent={data.hasBiometricsConsent}
        currentWeightKg={data.currentWeightKg}
      />

      {data.hasBiometricsConsent ? (
        <Surface className="space-y-3">
          <h3 className="text-lg font-bold text-ink">{progressCopy.history}</h3>
          {data.measurements.length === 0 ? (
            <p className="text-sm text-ink-soft">{progressCopy.emptyHistory}</p>
          ) : (
            <ul className="space-y-2">
              {data.measurements.map((row) => (
                <li
                  key={row.recordedOn}
                  className="rounded-[1rem] bg-surface-raised px-3 py-2 text-sm text-ink"
                >
                  <span className="font-semibold">{row.recordedOn}</span>
                  <span className="mt-1 block text-ink-soft">
                    {[
                      row.weightKg != null
                        ? `${progressCopy.weight}: ${row.weightKg}`
                        : null,
                      row.waistCm != null
                        ? `${progressCopy.waist}: ${row.waistCm}`
                        : null,
                      row.hipCm != null
                        ? `${progressCopy.hip}: ${row.hipCm}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {weightDelta != null && Math.abs(weightDelta) >= 0.1 ? (
            <p className="text-sm text-ink-soft">
              {progressCopy.delta(progressCopy.weight, weightDelta)}
            </p>
          ) : null}
        </Surface>
      ) : null}

      <div className="flex flex-col gap-2">
        <Link
          href="/account"
          className="focus-ring inline-flex min-h-12 items-center justify-center text-base font-semibold text-mint-deep"
        >
          {progressCopy.openHabits}
        </Link>
      </div>
    </main>
  );
}
