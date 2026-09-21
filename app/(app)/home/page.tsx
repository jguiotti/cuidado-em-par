import { redirect } from "next/navigation";

import { Surface } from "@/components/ui/surface";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/home");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);

  if (step !== "completed") {
    redirect(pathForOnboardingStep(step));
  }

  return (
    <main className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-ink">Seu cuidado de hoje</h1>
        <p className="text-base leading-relaxed text-ink-soft">
          Constância leve: água, sono, pausa ativa, movimento seguro e refeição
          acessível.
        </p>
      </div>

      <Surface className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Cadastro concluído</h2>
        <p className="text-base leading-relaxed text-ink-soft">
          Seu contexto já está salvo com segurança. Em breve: treinos e
          refeições filtrados no servidor, e o ritual do dia com água, sono e
          pausa ativa.
        </p>
      </Surface>
    </main>
  );
}
