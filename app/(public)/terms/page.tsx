import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-mint-deep">Privacidade</p>
        <h1 className="text-3xl font-bold text-ink">
          Como cuidamos dos seus dados
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          Dados de saúde ficam separados do perfil público. Você decide o que
          compartilhar, com consentimento registrado e possibilidade de
          revogar.
        </p>
      </div>

      <div className="surface space-y-4 p-6 text-base leading-relaxed text-ink">
        <p>
          Coletamos o mínimo necessário para filtrar treinos e refeições
          seguros para o seu contexto.
        </p>
        <p>
          Lesões, ciclo, gestação, peso e restrições alimentares não aparecem
          no feed do grupo nem no perfil visível para outras pessoas.
        </p>
        <p>
          Os textos legais completos entram no onboarding (passo de
          consentimento). Esta página é um resumo claro do compromisso.
        </p>
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
