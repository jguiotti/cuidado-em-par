import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next ?? "/home";
  const hasAuthError = params.error === "auth";

  return (
    <main className="flex flex-1 flex-col justify-center gap-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-mint-deep">Cuidado em Par</p>
        <h1 className="text-3xl font-bold text-ink">Boas-vindas</h1>
        <p className="text-base leading-relaxed text-ink-soft">
          Entre com o e-mail para receber um link seguro de acesso. Sem senha
          para lembrar agora.
        </p>
      </div>

      {hasAuthError ? (
        <p
          className="surface-raised px-4 py-3 text-sm text-ink"
          role="alert"
        >
          Não foi possível concluir o acesso. Tente pedir um novo link.
        </p>
      ) : null}

      <div className="surface p-6">
        <LoginForm nextPath={nextPath} />
      </div>

      <Link
        href="/"
        className="focus-ring text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
