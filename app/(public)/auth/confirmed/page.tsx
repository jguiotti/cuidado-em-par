import { BrandLogo } from "@/components/brand/brand-logo";
import { EmailConfirmedPanel } from "@/components/auth/email-confirmed-panel";
import { getOnboardingRedirectPath } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function AuthConfirmedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let continueHref = "/onboarding/consent";
  if (user) {
    continueHref = (await getOnboardingRedirectPath(user.id)) ?? "/home";
  }

  return (
    <div className="flex flex-col gap-6">
      <BrandLogo variant="header" href={null} />
      <EmailConfirmedPanel
        isLoggedIn={Boolean(user)}
        continueHref={continueHref}
      />
    </div>
  );
}
