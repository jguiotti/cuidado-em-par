import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getMyCareCircleAction,
  listCareFeedAction,
} from "@/app/actions/care-circle";
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
import { IconMeal, IconPlay } from "@/components/brand/soft-icons";
import { InlineAlert } from "@/components/ui/inline-alert";
import { redirectIfTermsRevoked } from "@/lib/account/terms-gate";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

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
    exercisesResult,
    mealsResult,
    circleResult,
    feedResult,
    cycleResult,
  ] = await Promise.all([
    getTodayRitualAction(),
    listSafeActivePauseExercisesAction(),
    listSafeExercisesForMeAction(),
    listSafeMealsForMeAction(),
    getMyCareCircleAction(),
    listCareFeedAction({ days: 1 }),
    getCycleAccountSnapshotAction(),
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
  const featuredExercise =
    exercisesResult.ok && exercisesResult.items.length > 0
      ? exercisesResult.items[0]
      : null;
  const featuredMeal =
    mealsResult.ok && mealsResult.items.length > 0
      ? mealsResult.items[0]
      : null;

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

      <ActivePauseCard
        initialCount={ritual.activePauseCount}
        exercises={pauseExercises}
        highlight
      />

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

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-ink">
            {habitsCopy.home.practiceTitle}
          </h3>
          <p className="text-sm leading-relaxed text-ink-soft">
            {habitsCopy.home.practiceSupport}
          </p>
        </div>

        <article className="surface space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-[var(--radius-pill)] bg-mint px-3 py-1 text-xs font-semibold text-mint-deep">
              {habitsCopy.home.moveChip}
            </span>
            <span className="rounded-[var(--radius-pill)] bg-surface-raised px-3 py-1 text-xs font-semibold text-ink-soft">
              {ritual.workoutCount > 0
                ? habitsCopy.move.done(ritual.workoutCount)
                : habitsCopy.move.pending}
            </span>
          </div>
          {featuredExercise ? (
            <>
              <h4 className="text-xl font-bold text-ink">
                {featuredExercise.title}
              </h4>
              <p className="text-sm leading-relaxed text-ink-soft">
                {featuredExercise.description}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-soft">{habitsCopy.move.pending}</p>
          )}
          <Link
            href="/workouts"
            className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-mint-deep px-5 text-base font-semibold text-surface"
          >
            <IconPlay size={18} />
            {habitsCopy.home.openMove}
          </Link>
        </article>

        <article className="surface space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-[var(--radius-pill)] bg-blush px-3 py-1 text-xs font-semibold text-blush-deep">
              {habitsCopy.home.eatChip}
            </span>
            {featuredMeal?.dietCompatibleTags.includes("low-cost") ? (
              <span className="rounded-[var(--radius-pill)] bg-surface-raised px-3 py-1 text-xs font-semibold text-ink-soft">
                {habitsCopy.home.lowCostChip}
              </span>
            ) : null}
          </div>
          {featuredMeal ? (
            <>
              <h4 className="text-xl font-bold text-ink">{featuredMeal.title}</h4>
              <p className="text-sm leading-relaxed text-ink-soft">
                {featuredMeal.description}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-soft">{habitsCopy.eat.pending}</p>
          )}
          <Link
            href="/meals"
            className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-surface-raised px-5 text-base font-semibold text-ink"
          >
            <IconMeal size={18} />
            {habitsCopy.home.openEat}
          </Link>
        </article>
      </section>

      <HabitRemindersOptIn
        initiallyConsented={ritual.hasRemindersConsent}
        prefs={ritual.prefs}
      />

      <Link
        href="/habits"
        className="focus-ring inline-flex min-h-12 items-center justify-center text-base font-semibold text-mint-deep"
      >
        {habitsCopy.prefs.linkFromHome}
      </Link>

      <p className="pb-2 text-center text-sm leading-relaxed text-ink-soft">
        {habitsCopy.home.motto}
      </p>
    </main>
  );
}
