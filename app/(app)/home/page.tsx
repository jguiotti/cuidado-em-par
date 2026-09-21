import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getMyCareCircleAction,
  listCareFeedAction,
} from "@/app/actions/care-circle";
import { getOrCreateTodayPlanAction } from "@/app/actions/daily-plan";
import {
  getTodayRitualAction,
  listSafeActivePauseExercisesAction,
} from "@/app/actions/habits";
import {
  listSafeExercisesForMeAction,
  listSafeMealsForMeAction,
} from "@/app/actions/safe-content";
import { getCycleAccountSnapshotAction } from "@/app/actions/profile-health";
import { CycleRemindersBanner } from "@/components/account/cycle-reminders-banner";
import { ActivePauseCard } from "@/components/habits/active-pause-card";
import { HabitRemindersOptIn } from "@/components/habits/habit-reminders-opt-in";
import { SleepCard } from "@/components/habits/sleep-card";
import { WaterCard } from "@/components/habits/water-card";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { CardioLogCard } from "@/components/plans/cardio-log-card";
import { TodayMealsPlan } from "@/components/plans/today-meals-plan";
import { TodayMovementPlan } from "@/components/plans/today-movement-plan";
import { InlineAlert } from "@/components/ui/inline-alert";
import { redirectIfTermsRevoked } from "@/lib/account/terms-gate";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";
import { TAG_SLUGS } from "@/lib/tags/constants";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/home");
  }

  await redirectIfTermsRevoked();

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);

  if (step !== "completed") {
    redirect(pathForOnboardingStep(step));
  }

  const [
    ritualResult,
    pauseResult,
    planResult,
    exercisesResult,
    mealsResult,
    circleResult,
    feedResult,
    cycleResult,
    clinicalResult,
  ] = await Promise.all([
    getTodayRitualAction(),
    listSafeActivePauseExercisesAction(),
    getOrCreateTodayPlanAction(),
    listSafeExercisesForMeAction(),
    listSafeMealsForMeAction(),
    getMyCareCircleAction(),
    listCareFeedAction({ days: 1 }),
    getCycleAccountSnapshotAction(),
    supabase
      .from("user_clinical_conditions")
      .select("capability_tags")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!ritualResult.ok) {
    return (
      <main className="flex flex-1 flex-col gap-6">
        <AppTopBar title={habitsCopy.home.title} />
        <InlineAlert tone="error">{habitsCopy.home.loadError}</InlineAlert>
      </main>
    );
  }

  const ritual = ritualResult.data;
  const pauseExercises = pauseResult.ok ? pauseResult.data : [];
  const plan = planResult.ok ? planResult.data : null;
  const swapExercises = exercisesResult.ok ? exercisesResult.items : [];
  const swapMeals = mealsResult.ok ? mealsResult.items : [];
  const allowRun = (clinicalResult.data?.capability_tags ?? []).includes(
    TAG_SLUGS.standing,
  );

  let circleNote: string | null = null;
  if (circleResult.ok && circleResult.data && feedResult.ok) {
    const today = feedResult.data[0];
    const mate = today?.entries.find(
      (entry) => entry.userId !== user.id && entry.kinds.length > 0,
    );
    circleNote = mate
      ? habitsCopy.home.circleMate(mate.displayName)
      : habitsCopy.home.circleEmpty;
  }

  return (
    <main className="flex flex-1 flex-col gap-6">
      <AppTopBar title={habitsCopy.home.title} />

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
          {habitsCopy.home.dateLabel(ritual.day)}
        </p>
        <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-surface-raised px-3 py-1 text-xs font-semibold text-mint-deep">
          <span className="h-2 w-2 rounded-full bg-mint-deep" aria-hidden />
          {habitsCopy.home.safetyPill}
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink">
          {habitsCopy.home.greeting}
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">
          {habitsCopy.home.support}
        </p>
      </div>

      {cycleResult.ok && cycleResult.data ? (
        <CycleRemindersBanner
          reminders={cycleResult.data.reminders}
          remindPeriodApproaching={cycleResult.data.remindPeriodApproaching}
          remindFertileWindow={cycleResult.data.remindFertileWindow}
          remindLateOrPossiblePregnancy={
            cycleResult.data.remindLateOrPossiblePregnancy
          }
        />
      ) : null}

      {circleNote ? (
        <div className="surface flex items-start gap-3 p-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-sm font-bold text-mint-deep">
            {circleResult.ok && circleResult.data
              ? (
                  circleResult.data.members.find((m) => m.userId !== user.id)
                    ?.displayName ?? "P"
                )
                  .slice(0, 1)
                  .toUpperCase()
              : "P"}
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-mint-deep">
              {habitsCopy.home.circleEyebrow}
            </p>
            <p className="text-sm leading-relaxed text-ink-soft">{circleNote}</p>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-lg font-bold text-ink">
            {habitsCopy.home.ringsTitle}
          </h3>
          <p className="text-sm text-ink-soft">{habitsCopy.home.ringsHint}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <WaterCard
            waterMl={ritual.waterMl}
            waterGoalMl={ritual.waterGoalMl}
            compact
          />
          <SleepCard initial={ritual.sleep} compact />
        </div>
      </section>

      <ActivePauseCard
        initialCount={ritual.activePauseCount}
        exercises={pauseExercises}
        highlight
      />

      {plan ? (
        <>
          <TodayMovementPlan
            isRestDay={plan.isRestDay}
            workoutMinutesPerDay={plan.workoutMinutesPerDay}
            exercises={plan.exercises}
            doneExerciseIds={plan.doneExerciseIds}
            swapCandidates={swapExercises}
          />
          <CardioLogCard
            suggestion={plan.cardioSuggestion}
            initialMinutes={ritual.cardioMinutes}
            allowRun={allowRun && plan.cardioSuggestion !== "seated"}
          />
          <TodayMealsPlan
            meals={plan.meals}
            doneMealSlots={plan.doneMealSlots}
            customMeals={plan.customMeals}
            swapCandidates={swapMeals}
          />
        </>
      ) : planResult.ok === false ? (
        <InlineAlert tone="error">{habitsCopy.home.loadError}</InlineAlert>
      ) : null}

      <HabitRemindersOptIn
        initiallyConsented={ritual.hasRemindersConsent}
        prefs={ritual.prefs}
      />

      <div className="flex flex-col gap-2 pb-2 sm:flex-row sm:justify-center">
        <Link
          href="/account"
          className="focus-ring inline-flex min-h-12 items-center justify-center text-base font-semibold text-mint-deep"
        >
          {habitsCopy.prefs.linkFromHome}
        </Link>
        <Link
          href="/progress"
          className="focus-ring inline-flex min-h-12 items-center justify-center text-base font-semibold text-mint-deep"
        >
          Ver progresso
        </Link>
        <Link
          href="/circle"
          className="focus-ring inline-flex min-h-12 items-center justify-center text-base font-semibold text-mint-deep"
        >
          Abrir círculo
        </Link>
      </div>

      <p className="pb-2 text-center text-sm leading-relaxed text-ink-soft">
        {habitsCopy.home.motto}
      </p>
    </main>
  );
}
