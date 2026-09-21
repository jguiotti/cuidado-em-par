import {
  listContentDoneTodayAction,
  listSafeExercisesForMeAction,
} from "@/app/actions/safe-content";
import { SafeExerciseList } from "@/components/care/safe-exercise-list";
import { IconShield } from "@/components/brand/soft-icons";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { InlineAlert } from "@/components/ui/inline-alert";
import { redirectIfTermsRevoked } from "@/lib/account/terms-gate";
import { accountCopy } from "@/lib/i18n/account-pt-br";
import { appCopy } from "@/lib/i18n/app-pt-br";
import { createClient } from "@/lib/supabase/server";

export default async function WorkoutsPage() {
  await redirectIfTermsRevoked();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [listResult, doneResult, consentResult] = await Promise.all([
    listSafeExercisesForMeAction(),
    listContentDoneTodayAction("workout"),
    user
      ? supabase
          .from("lgpd_consent_logs")
          .select("accepted")
          .eq("user_id", user.id)
          .eq("purpose", "health_personalization")
          .order("recorded_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const hasHealth = consentResult.data?.accepted === true;
  const emptyMessage = hasHealth
    ? undefined
    : accountCopy.moveEmptyAfterRevoke;
  const doneIds = doneResult.ok ? doneResult.contentIds : [];
  const doneCount = doneResult.ok ? doneResult.count : 0;

  return (
    <main className="flex flex-1 flex-col gap-6">
      <AppTopBar title={appCopy.nav.move} />

      <div className="space-y-3">
        <h2 className="text-3xl font-bold leading-tight text-ink">
          {appCopy.move.title}
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">
          {appCopy.move.support}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-[var(--radius-pill)] bg-mint px-3 py-1 text-xs font-semibold text-mint-deep">
            {appCopy.move.chipSafe}
          </span>
          <span className="rounded-[var(--radius-pill)] bg-surface-raised px-3 py-1 text-xs font-semibold text-ink-soft">
            {appCopy.move.chipBodyweight}
          </span>
        </div>
        <p className="text-sm font-medium text-mint-deep" aria-live="polite">
          {appCopy.move.todayCount(doneCount)}
        </p>
      </div>

      <section className="surface-raised space-y-3 p-5">
        <div className="flex items-center gap-2 text-mint-deep">
          <IconShield size={18} />
          <h3 className="text-base font-bold text-ink">
            {appCopy.move.safetyTitle}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          {appCopy.move.safetyBody}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-ink">
          {appCopy.move.sequenceTitle}
        </h3>
        {!listResult.ok ? (
          <InlineAlert tone="error">{appCopy.move.loadError}</InlineAlert>
        ) : (
          <SafeExerciseList
            items={listResult.items}
            doneIds={doneIds}
            emptyMessage={emptyMessage}
          />
        )}
      </section>

      <p className="rounded-[var(--radius-soft)] bg-sand-deep/80 px-4 py-3 text-sm leading-relaxed text-ink-soft">
        {appCopy.move.autonomy}
      </p>
    </main>
  );
}
