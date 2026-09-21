import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/brand/brand-logo";
import { IconLeaf, IconShield } from "@/components/brand/soft-icons";
import { isDevAuthBypassEnabled } from "@/lib/auth/dev-bypass";
import { loginCopy } from "@/lib/i18n/brand-pt-br";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next ?? "/home";
  const hasAuthError = params.error === "auth";
  const showDevBypass = isDevAuthBypassEnabled();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 pb-4">
      <div className="flex flex-col items-center gap-5 pt-2 text-center">
        <BrandLogo variant="stacked" href="/" />
        <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-mint px-4 py-2 text-sm font-semibold text-mint-deep">
          <IconLeaf size={18} />
          {loginCopy.badge}
        </span>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[2rem]">
            {loginCopy.title}
          </h1>
          <p className="mx-auto max-w-md text-base leading-relaxed text-ink-soft">
            {loginCopy.support}
          </p>
        </div>
      </div>

      {hasAuthError ? (
        <p
          className="surface-raised px-4 py-3 text-center text-sm text-ink"
          role="alert"
        >
          {loginCopy.authError}
        </p>
      ) : null}

      <div className="surface rounded-[1.75rem] p-6 sm:p-8">
        <LoginForm nextPath={nextPath} />
      </div>

      {showDevBypass ? (
        <p className="text-center text-sm text-ink-soft">
          Limite de e-mail do Supabase?{" "}
          <Link
            href="/dev/login"
            className="focus-ring font-semibold text-mint-deep underline-offset-4 hover:underline"
          >
            Entrar sem e-mail (desenvolvimento)
          </Link>
        </p>
      ) : null}

      <Link
        href="/"
        className="focus-ring mx-auto text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
      >
        {loginCopy.back}
      </Link>

      <div className="mt-auto flex items-start gap-3 rounded-[var(--radius-soft)] bg-sand-deep/80 px-4 py-4">
        <span className="mt-0.5 text-mint-deep">
          <IconShield size={18} />
        </span>
        <p className="text-sm leading-relaxed text-ink-soft">
          {loginCopy.privacyFooter}
        </p>
      </div>
    </main>
  );
}
