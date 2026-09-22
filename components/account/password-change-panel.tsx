"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { updateAccountPasswordAction } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { PasswordField } from "@/components/ui/password-field";
import { Surface } from "@/components/ui/surface";
import { accountCopy } from "@/lib/i18n/account-pt-br";

const MIN_PASSWORD_LENGTH = 8;

export function PasswordChangePanel() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isPending) {
      return;
    }

    setError(null);
    setMessage(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(accountCopy.password.tooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(accountCopy.password.mismatch);
      return;
    }

    setIsPending(true);
    try {
      const result = await updateAccountPasswordAction({ password });

      if (!result.ok) {
        if (result.code === "password_too_short") {
          setError(accountCopy.password.tooShort);
          return;
        }
        setError(accountCopy.password.updateError);
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setMessage(accountCopy.password.saved);
      router.refresh();
    } catch {
      setError(accountCopy.password.updateError);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.password.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.password.support}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <PasswordField
          label={accountCopy.password.newLabel}
          name="newPassword"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={accountCopy.password.placeholder}
          disabled={isPending}
          showLabel={accountCopy.password.showPassword}
          hideLabel={accountCopy.password.hidePassword}
        />

        <PasswordField
          label={accountCopy.password.confirmLabel}
          name="confirmNewPassword"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder={accountCopy.password.placeholder}
          disabled={isPending}
          showLabel={accountCopy.password.showPassword}
          hideLabel={accountCopy.password.hidePassword}
        />

        <Button type="submit" disabled={isPending} className="min-h-12">
          {isPending
            ? accountCopy.password.submitting
            : accountCopy.password.submit}
        </Button>
      </form>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
      {message ? <InlineAlert tone="info">{message}</InlineAlert> : null}
    </Surface>
  );
}
