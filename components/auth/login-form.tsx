"use client";

import { useState, useTransition, type FormEvent } from "react";

import { IconArrowRight, IconMail } from "@/components/brand/soft-icons";
import { Button } from "@/components/ui/button";
import { MissingEnvError } from "@/lib/env";
import { loginCopy } from "@/lib/i18n/brand-pt-br";
import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  nextPath: string;
}

function isRateLimited(error: { status?: number; message?: string; code?: string }) {
  if (error.status === 429) {
    return true;
  }
  const haystack = `${error.message ?? ""} ${error.code ?? ""}`.toLowerCase();
  return (
    haystack.includes("429") ||
    haystack.includes("rate") ||
    haystack.includes("too many") ||
    haystack.includes("over_email_send_rate_limit")
  );
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
            isRateLimited(error)
              ? loginCopy.rateLimitError
              : loginCopy.sendError,
          );
          return;
        }

        setMessage(loginCopy.sendOk);
      } catch (error) {
        setHasError(true);
        if (error instanceof MissingEnvError) {
          setMessage(loginCopy.envError);
          return;
        }
        setMessage(loginCopy.sendError);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        {loginCopy.emailLabel}
        <span className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
            <IconMail size={18} />
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-control min-h-14 w-full py-3 pl-12 pr-4 text-base text-ink"
            placeholder={loginCopy.emailPlaceholder}
            disabled={isPending}
          />
        </span>
      </label>

      <Button
        type="submit"
        disabled={isPending}
        className="min-h-14 gap-2 rounded-[var(--radius-pill)] shadow-[0_10px_28px_color-mix(in_srgb,var(--color-mint-deep)_35%,transparent)]"
      >
        {isPending ? loginCopy.submitting : loginCopy.submit}
        {!isPending ? <IconArrowRight size={18} /> : null}
      </Button>

      <p className="text-center text-sm font-medium text-mint-deep">
        {loginCopy.firstAccess}
      </p>

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
