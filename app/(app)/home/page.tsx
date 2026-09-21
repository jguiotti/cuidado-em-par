import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getTodayRitualAction,
  listSafeActivePauseExercisesAction,
} from "@/app/actions/habits";
import { ActivePauseCard } from "@/components/habits/active-pause-card";
import { HabitRemindersOptIn } from "@/components/habits/habit-reminders-opt-in";
import { LinkStatusCard } from "@/components/habits/link-status-card";
import { SleepCard } from "@/components/habits/sleep-card";
import { WaterCard } from "@/components/habits/water-card";
import { InlineAlert } from "@/components/ui/inline-alert";
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

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);

  if (step !== "completed") {
    redirect(pathForOnboardingStep(step));
  }

  const [ritualResult, pauseResult] = await Promise.all([
    getTodayRitualAction(),
    listSafeActivePauseExercisesAction(),
  ]);

  if (!ritualResult.ok) {
    return (
      <main className="flex flex-1 flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ink">
            {habitsCopy.home.title}
          </h1>
        </div>
        <InlineAlert tone="error">{habitsCopy.home.loadError}</InlineAlert>
      </main>
    );
  }

  const ritual = ritualResult.data;
  const pauseExercises = pauseResult.ok ? pauseResult.data : [];

  return (
    <main className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-ink">{habitsCopy.home.title}</h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {habitsCopy.home.support}
        </p>
      </div>

      <WaterCard waterMl={ritual.waterMl} waterGoalMl={ritual.waterGoalMl} />
      <SleepCard initial={ritual.sleep} />
      <ActivePauseCard
        initiallyDone={ritual.activePauseDone}
        exercises={pauseExercises}
      />
      <LinkStatusCard kind="move" done={ritual.workoutDone} />
      <LinkStatusCard kind="eat" done={ritual.mealDone} />

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
    </main>
  );
}
