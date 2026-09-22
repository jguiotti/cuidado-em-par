"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { IconArrowRight } from "@/components/brand/soft-icons";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { PasswordField } from "@/components/ui/password-field";
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
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isPending) {
      return;
    }

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

    setIsPending(true);
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
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {message ? (
        <InlineAlert tone={hasError ? "error" : "info"}>{message}</InlineAlert>
      ) : null}

      <PasswordField
        label={loginCopy.resetNewPasswordLabel}
        name="password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder={loginCopy.passwordPlaceholder}
        disabled={isPending}
        showLabel={loginCopy.showPassword}
        hideLabel={loginCopy.hidePassword}
      />

      <PasswordField
        label={loginCopy.confirmPasswordLabel}
        name="confirmPassword"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder={loginCopy.confirmPasswordPlaceholder}
        disabled={isPending}
        showLabel={loginCopy.showPassword}
        hideLabel={loginCopy.hidePassword}
      />

      <Button
        type="submit"
        disabled={isPending}
        className="min-h-14 gap-2 rounded-[var(--radius-pill)] shadow-[0_10px_28px_color-mix(in_srgb,var(--color-mint-deep)_35%,transparent)]"
      >
        {isPending ? loginCopy.resetSubmitting : loginCopy.resetSubmit}
        {!isPending ? <IconArrowRight size={18} /> : null}
      </Button>
    </form>
  );
}
