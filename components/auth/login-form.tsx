"use client";

import { useState, useTransition, type FormEvent } from "react";

import { MissingEnvError } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  nextPath: string;
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setHasError(false);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: redirectTo,
          },
        });

        if (error) {
          setHasError(true);
          setMessage(
            "Não foi possível enviar o link agora. Confira o e-mail e tente de novo.",
          );
          return;
        }

        setMessage(
          "Se o e-mail estiver correto, você receberá um link de acesso em instantes.",
        );
      } catch (error) {
        setHasError(true);
        if (error instanceof MissingEnvError) {
          setMessage(
            "Falta configurar o arquivo .env com a URL e a chave anon do Supabase. Depois reinicie o npm run dev.",
          );
          return;
        }
        setMessage(
          "Não foi possível enviar o link agora. Confira o e-mail e tente de novo.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        E-mail
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field-control min-h-12 px-4 text-base text-ink"
          placeholder="seu@email.com"
          disabled={isPending}
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="focus-ring inline-flex min-h-12 items-center justify-center rounded-[var(--radius-soft)] bg-mint-deep px-5 text-base font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Receber link de acesso"}
      </button>

      {message ? (
        <p
          className="text-sm leading-relaxed text-ink-soft"
          role={hasError ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
