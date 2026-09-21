import { redirect } from "next/navigation";

import { getTodayRitualAction } from "@/app/actions/habits";
import { HabitPrefsForm } from "@/components/habits/habit-prefs-form";
import { HabitRemindersOptIn } from "@/components/habits/habit-reminders-opt-in";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { WorkoutAvailabilityForm } from "@/components/plans/workout-availability-form";
import { InlineAlert } from "@/components/ui/inline-alert";
import { appCopy } from "@/lib/i18n/app-pt-br";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { redirectIfTermsRevoked } from "@/lib/account/terms-gate";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function HabitsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/habits");
  }

  await redirectIfTermsRevoked();

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);

  if (step !== "completed") {
    redirect(pathForOnboardingStep(step));
  }

  const ritualResult = await getTodayRitualAction();

  if (!ritualResult.ok) {
    return (
      <main className="flex flex-1 flex-col gap-4">
        <h1 className="text-3xl font-bold text-ink">{habitsCopy.prefs.title}</h1>
        <InlineAlert tone="error">{habitsCopy.home.loadError}</InlineAlert>
      </main>
    );
  }

  const ritual = ritualResult.data;

  return (
    <main className="flex flex-1 flex-col gap-6">
      <AppTopBar title={appCopy.nav.habits} />
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-ink">{habitsCopy.prefs.title}</h2>
        <p className="text-base leading-relaxed text-ink-soft">
          {habitsCopy.prefs.support}
        </p>
      </div>

      <HabitPrefsForm initial={ritual.prefs} />
      <WorkoutAvailabilityForm initial={ritual.prefs} />
      <HabitRemindersOptIn
        initiallyConsented={ritual.hasRemindersConsent}
        prefs={ritual.prefs}
      />
    </main>
  );
}
