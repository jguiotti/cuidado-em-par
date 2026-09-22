import Link from "next/link";
import { redirect } from "next/navigation";

import { getAccountSnapshotAction } from "@/app/actions/account";
import { getTodayRitualAction } from "@/app/actions/habits";
import {
  getCycleAccountSnapshotAction,
  getMyHealthEditSnapshotAction,
} from "@/app/actions/profile-health";
import { ConsentsPanel } from "@/components/account/consents-panel";
import { CycleCalendarPanel } from "@/components/account/cycle-calendar-panel";
import { DeleteAccountPanel } from "@/components/account/delete-account-panel";
import { EquipmentEditPanel } from "@/components/account/equipment-edit-panel";
import { ExportDataPanel } from "@/components/account/export-data-panel";
import { HealthConditionsEditPanel } from "@/components/account/health-conditions-edit-panel";
import { InstallPwaPanel } from "@/components/account/install-pwa-panel";
import { NutritionEditPanel } from "@/components/account/nutrition-edit-panel";
import { PublicProfileForm } from "@/components/account/public-profile-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { HabitPrefsForm } from "@/components/habits/habit-prefs-form";
import { HabitRemindersOptIn } from "@/components/habits/habit-reminders-opt-in";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { WorkoutAvailabilityForm } from "@/components/plans/workout-availability-form";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { accountCopy } from "@/lib/i18n/account-pt-br";
import { appCopy } from "@/lib/i18n/app-pt-br";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [snapshot, healthResult, cycleResult, ritualResult] = await Promise.all([
    getAccountSnapshotAction(),
    getMyHealthEditSnapshotAction(),
    getCycleAccountSnapshotAction(),
    getTodayRitualAction(),
  ]);

  if (!snapshot.ok) {
    return (
      <main className="flex flex-1 flex-col gap-4">
        <h1 className="text-3xl font-bold text-ink">{accountCopy.title}</h1>
        <InlineAlert tone="error">{accountCopy.loadError}</InlineAlert>
      </main>
    );
  }

  const data = snapshot.data;
  const health = healthResult.ok ? healthResult.data : null;
  const cycle = cycleResult.ok ? cycleResult.data : null;
  const ritual = ritualResult.ok ? ritualResult.data : null;

  return (
    <main className="flex flex-1 flex-col gap-6">
      <AppTopBar title={appCopy.nav.account} />
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-ink">{accountCopy.title}</h2>
        <p className="text-base leading-relaxed text-ink-soft">
          {accountCopy.support}
        </p>
      </div>

      {!data.hasAcceptedTerms ? (
        <InlineAlert tone="error">{accountCopy.consents.termsGate}</InlineAlert>
      ) : null}

      <PublicProfileForm
        displayName={data.profile.displayName}
        genderIdentity={data.profile.genderIdentity}
      />

      <Surface className="space-y-2">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.motor.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.motor.support}
        </p>
      </Surface>

      {health ? (
        <section className="space-y-4" aria-labelledby="health-edit-heading">
          <div className="space-y-2">
            <h2
              id="health-edit-heading"
              className="text-xl font-semibold text-ink"
            >
              {accountCopy.healthEdit.title}
            </h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              {accountCopy.healthEdit.support}
            </p>
          </div>
          <HealthConditionsEditPanel
            initialConditions={health.conditionTags}
          />
          <EquipmentEditPanel
            initialSelected={health.extraEquipmentTags}
          />
          <NutritionEditPanel
            initialDietPattern={health.dietPattern}
            initialAvoids={health.avoidsTags}
            initialDislikes={health.dislikedFoods}
          />
        </section>
      ) : null}

      {ritual ? (
        <section className="space-y-4" id="habits-prefs">
          <WorkoutAvailabilityForm initial={ritual.prefs} />
          <HabitPrefsForm initial={ritual.prefs} />
          <HabitRemindersOptIn
            initiallyConsented={ritual.hasRemindersConsent}
            prefs={ritual.prefs}
          />
        </section>
      ) : null}

      <div id="cycle-calendar">
        <CycleCalendarPanel
          snapshot={cycle}
          cycleMode={health?.cycleMode ?? null}
          hasCycleModule={health?.hasCycleModule ?? Boolean(cycle)}
        />
      </div>

      <ConsentsPanel consents={data.consents} />

      <ExportDataPanel />

      <InstallPwaPanel />

      <Link
        href="/progress"
        className="focus-ring inline-flex min-h-12 items-center justify-center text-base font-semibold text-mint-deep"
      >
        Ver progresso
      </Link>

      <div className="flex justify-center">
        <SignOutButton />
      </div>

      <DeleteAccountPanel />
    </main>
  );
}
