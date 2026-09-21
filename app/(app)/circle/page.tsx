import { redirect } from "next/navigation";

import {
  getMyCareCircleAction,
  listCareFeedAction,
} from "@/app/actions/care-circle";
import { CircleActivePanel } from "@/components/circle/circle-active-panel";
import { CircleEmptyPanel } from "@/components/circle/circle-empty-panel";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { InlineAlert } from "@/components/ui/inline-alert";
import { redirectIfTermsRevoked } from "@/lib/account/terms-gate";
import { appCopy } from "@/lib/i18n/app-pt-br";
import { circleCopy } from "@/lib/i18n/circle-pt-br";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function CirclePage() {
  await redirectIfTermsRevoked();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/circle");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);
  if (step !== "completed") {
    redirect(pathForOnboardingStep(step));
  }

  const [circleResult, feedResult] = await Promise.all([
    getMyCareCircleAction(),
    listCareFeedAction({ days: 7 }),
  ]);

  if (!circleResult.ok) {
    return (
      <main className="flex flex-1 flex-col gap-4">
        <h1 className="text-3xl font-bold text-ink">{circleCopy.title}</h1>
        <InlineAlert tone="error">{circleCopy.errors.load}</InlineAlert>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6">
      <AppTopBar title={appCopy.nav.circle} />
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-ink">{circleCopy.title}</h2>
        <p className="text-base leading-relaxed text-ink-soft">
          {circleCopy.support}
        </p>
      </div>

      {circleResult.data ? (
        <CircleActivePanel
          circle={circleResult.data}
          feed={feedResult.ok ? feedResult.data : []}
          currentUserId={user.id}
        />
      ) : (
        <CircleEmptyPanel />
      )}
    </main>
  );
}
