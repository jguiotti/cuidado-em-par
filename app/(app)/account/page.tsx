import Link from "next/link";
import { redirect } from "next/navigation";

import { getAccountSnapshotAction } from "@/app/actions/account";
import { ConsentsPanel } from "@/components/account/consents-panel";
import { DeleteAccountPanel } from "@/components/account/delete-account-panel";
import { ExportDataPanel } from "@/components/account/export-data-panel";
import { InstallPwaPanel } from "@/components/account/install-pwa-panel";
import { PublicProfileForm } from "@/components/account/public-profile-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AppTopBar } from "@/components/layout/app-top-bar";
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

  const snapshot = await getAccountSnapshotAction();

  if (!snapshot.ok) {
    return (
      <main className="flex flex-1 flex-col gap-4">
        <h1 className="text-3xl font-bold text-ink">{accountCopy.title}</h1>
        <InlineAlert tone="error">{accountCopy.loadError}</InlineAlert>
      </main>
    );
  }

  const data = snapshot.data;

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

      <ConsentsPanel consents={data.consents} />

      <ExportDataPanel />

      <InstallPwaPanel />

      <Link
        href="/habits"
        className="focus-ring inline-flex min-h-12 items-center justify-center text-base font-semibold text-mint-deep"
      >
        {accountCopy.habitsLink}
      </Link>

      <div className="flex justify-center">
        <SignOutButton />
      </div>

      <DeleteAccountPanel />
    </main>
  );
}
