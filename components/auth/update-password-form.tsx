"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { IconArrowRight, IconLock } from "@/components/brand/soft-icons";
import { Button } from "@/components/ui/button";
import { MissingEnvError } from "@/lib/env";
import { loginCopy } from "@/lib/i18n/brand-pt-br";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 8;

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setHasError(false);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setHasError(true);
      setMessage(loginCopy.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setHasError(true);
      setMessage(loginCopy.passwordMismatch);
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setHasError(true);
          setMessage(loginCopy.resetSessionExpired);
          return;
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setHasError(true);
          setMessage(loginCopy.sendError);
          return;
        }

        setMessage(loginCopy.resetPasswordSaved);
        router.push("/home");
        router.refresh();
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
        {loginCopy.resetNewPasswordLabel}
        <span className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
            <IconLock size={18} />
          </span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field-control min-h-14 w-full py-3 pl-12 pr-4 text-base text-ink"
            placeholder={loginCopy.passwordPlaceholder}
            disabled={isPending}
          />
        </span>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        {loginCopy.confirmPasswordLabel}
        <span className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
            <IconLock size={18} />
          </span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="field-control min-h-14 w-full py-3 pl-12 pr-4 text-base text-ink"
            placeholder={loginCopy.confirmPasswordPlaceholder}
            disabled={isPending}
          />
        </span>
      </label>

      <Button
        type="submit"
        disabled={isPending}
        className="min-h-14 gap-2 rounded-[var(--radius-pill)] shadow-[0_10px_28px_color-mix(in_srgb,var(--color-mint-deep)_35%,transparent)]"
      >
        {isPending ? loginCopy.resetSubmitting : loginCopy.resetSubmit}
        {!isPending ? <IconArrowRight size={18} /> : null}
      </Button>

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
