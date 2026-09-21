import Link from "next/link";
import { redirect } from "next/navigation";

import { DevLoginButton } from "@/components/auth/dev-login-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { isDevAuthBypassEnabled } from "@/lib/auth/dev-bypass";

export default function DevLoginPage() {
  if (!isDevAuthBypassEnabled()) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 pb-4">
      <div className="space-y-3 text-center sm:text-left">
        <BrandLogo variant="stacked" href="/" />
        <h1 className="text-3xl font-bold text-ink">Acesso de desenvolvimento</h1>
        <p className="text-base leading-relaxed text-ink-soft">
          Usa uma conta local fixa no Supabase, sem enviar magic link. Serve
          para validar telas quando o limite gratuito de e-mail (429) trava o
          login. Não use em produção.
        </p>
      </div>

      <div className="surface space-y-4 rounded-[1.75rem] p-6">
        <DevLoginButton />
        <p className="text-sm leading-relaxed text-ink-soft">
          Conta: <span className="font-medium text-ink">dev@cuidado.local</span>
          . Se o onboarding pedir passos, conclua uma vez — depois as telas do
          app ficam acessíveis.
        </p>
      </div>

      <Link
        href="/login"
        className="focus-ring text-center text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
      >
        Voltar ao login por e-mail
      </Link>
    </main>
  );
}
