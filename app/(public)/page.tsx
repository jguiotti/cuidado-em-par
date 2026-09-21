import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-10">
      <div className="space-y-4">
        <p className="text-sm font-semibold tracking-wide text-mint-deep">
          Cuidado em Par
        </p>
        <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Saúde acessível, no seu ritmo
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-ink-soft">
          Treinos e refeições pensados para o seu corpo, com hábitos diários e
          companhia para manter a constância — sem mensalidade cara e sem
          promessa milagrosa.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-[var(--radius-soft)] bg-mint-deep px-6 text-base font-semibold text-surface transition hover:opacity-90"
        >
          Entrar
        </Link>
        <Link
          href="/terms"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-[var(--radius-soft)] bg-surface-raised px-6 text-base font-semibold text-ink transition hover:opacity-90"
        >
          Como cuidamos dos seus dados
        </Link>
      </div>
    </main>
  );
}
