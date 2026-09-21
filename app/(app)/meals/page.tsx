import {
  listContentDoneTodayAction,
  listSafeMealsForMeAction,
} from "@/app/actions/safe-content";
import { SafeMealList } from "@/components/care/safe-meal-list";
import { IconShield } from "@/components/brand/soft-icons";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { InlineAlert } from "@/components/ui/inline-alert";
import { redirectIfTermsRevoked } from "@/lib/account/terms-gate";
import { accountCopy } from "@/lib/i18n/account-pt-br";
import { appCopy } from "@/lib/i18n/app-pt-br";
import { MEAL_SLOT_VALUES, type MealSlot } from "@/lib/tags/constants";
import { createClient } from "@/lib/supabase/server";

interface MealsPageProps {
  searchParams: Promise<{ slot?: string }>;
}

function parseSlot(value: string | undefined): MealSlot | "all" {
  if (!value || value === "all") {
    return "all";
  }
  if (MEAL_SLOT_VALUES.includes(value as MealSlot)) {
    return value as MealSlot;
  }
  return "all";
}

export default async function MealsPage({ searchParams }: MealsPageProps) {
  await redirectIfTermsRevoked();

  const params = await searchParams;
  const activeSlot = parseSlot(params.slot);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [listResult, doneResult, consentResult] = await Promise.all([
    listSafeMealsForMeAction(activeSlot),
    listContentDoneTodayAction("meal"),
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
    : accountCopy.eatEmptyAfterRevoke;
  const doneIds = doneResult.ok ? doneResult.contentIds : [];
  const doneCount = doneResult.ok ? doneResult.count : 0;

  return (
    <main className="flex flex-1 flex-col gap-6">
      <AppTopBar title={appCopy.nav.eat} />
      <div className="space-y-3">
        <h2 className="text-3xl font-bold leading-tight text-ink">
          {appCopy.eat.title}
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">
          {appCopy.eat.support}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-[var(--radius-pill)] bg-mint px-3 py-1 text-xs font-semibold text-mint-deep">
            {appCopy.eat.chipSafe}
          </span>
          <span className="rounded-[var(--radius-pill)] bg-surface-raised px-3 py-1 text-xs font-semibold text-ink-soft">
            {appCopy.eat.chipLowCost}
          </span>
        </div>
        <p className="text-sm font-medium text-mint-deep" aria-live="polite">
          {appCopy.eat.todayCount(doneCount)}
        </p>
      </div>

      <section className="surface-raised space-y-3 p-5">
        <div className="flex items-center gap-2 text-mint-deep">
          <IconShield size={18} />
          <h3 className="text-base font-bold text-ink">
            {appCopy.eat.safetyTitle}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          {appCopy.eat.safetyBody}
        </p>
      </section>

      {!listResult.ok ? (
        <InlineAlert tone="error">{appCopy.eat.loadError}</InlineAlert>
      ) : (
        <SafeMealList
          items={listResult.items}
          activeSlot={activeSlot}
          doneIds={doneIds}
          emptyMessage={emptyMessage}
        />
      )}
    </main>
  );
}
