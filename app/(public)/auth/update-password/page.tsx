import Link from "next/link";
import { redirect } from "next/navigation";

import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { BrandLogo } from "@/components/brand/brand-logo";
import { InlineAlert } from "@/components/ui/inline-alert";
import { loginCopy } from "@/lib/i18n/brand-pt-br";
import { createClient } from "@/lib/supabase/server";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    token_hash?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;

  // Session exchange must happen in the Route Handler (cookies on the response).
  if (params.code || params.token_hash) {
    const query = new URLSearchParams();
    if (params.code) {
      query.set("code", params.code);
    }
    if (params.token_hash) {
      query.set("token_hash", params.token_hash);
    }
    if (params.type) {
      query.set("type", params.type);
    }
    query.set("next", "/auth/update-password");
    redirect(`/auth/callback?${query.toString()}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 pb-4">
      <div className="flex flex-col items-center gap-5 pt-2 text-center">
        <BrandLogo variant="stacked" href="/" />
        <div className="space-y-3">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[2rem]">
            {loginCopy.updatePasswordTitle}
          </h1>
          <p className="mx-auto max-w-md text-base leading-relaxed text-ink-soft">
            {loginCopy.updatePasswordSupport}
          </p>
        </div>
      </div>

      <div className="surface rounded-[1.75rem] p-6 sm:p-8">
        {user ? (
          <UpdatePasswordForm />
        ) : (
          <div className="space-y-4">
            <InlineAlert tone="error">
              {loginCopy.resetSessionExpired}
            </InlineAlert>
            <Link
              href="/login"
              className="focus-ring inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-pill)] bg-mint-deep px-6 text-base font-semibold text-surface"
            >
              {loginCopy.backToSignIn}
            </Link>
          </div>
        )}
      </div>

      <Link
        href="/login"
        className="focus-ring mx-auto text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
      >
        {loginCopy.back}
      </Link>
    </main>
  );
}
