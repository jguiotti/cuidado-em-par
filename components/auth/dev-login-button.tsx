"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { enterDevSessionAction } from "@/app/actions/dev-auth";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";

export function DevLoginButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEnter() {
    setError(null);
    startTransition(async () => {
      const result = await enterDevSessionAction();
      if (!result.ok) {
        if (result.code === "disabled") {
          setError(
            "Bypass desligado. No .env local, defina DEV_AUTH_BYPASS=true e reinicie o npm run dev.",
          );
          return;
        }
        if (result.code === "setup_failed") {
          setError(
            "Não foi possível preparar a conta de desenvolvimento. Confira SUPABASE_SERVICE_ROLE_KEY.",
          );
          return;
        }
        setError("Não foi possível entrar agora. Tente de novo em instantes.");
        return;
      }
      router.replace("/home");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={handleEnter}
        className="w-full rounded-[var(--radius-pill)]"
      >
        {isPending ? "Entrando..." : "Entrar sem e-mail (só desenvolvimento)"}
      </Button>
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </div>
  );
}
