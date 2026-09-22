"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updateAccountPasswordAction } from "@/app/actions/account";
import { IconLock } from "@/components/brand/soft-icons";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { accountCopy } from "@/lib/i18n/account-pt-br";

const MIN_PASSWORD_LENGTH = 8;

export function PasswordChangePanel() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
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

    startTransition(async () => {
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
    });
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          {accountCopy.password.newLabel}
          <span className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
              <IconLock size={18} />
            </span>
            <input
              type="password"
              name="newPassword"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-control min-h-14 w-full py-3 pl-12 pr-4 text-base text-ink"
              placeholder={accountCopy.password.placeholder}
              disabled={isPending}
            />
          </span>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          {accountCopy.password.confirmLabel}
          <span className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
              <IconLock size={18} />
            </span>
            <input
              type="password"
              name="confirmNewPassword"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="field-control min-h-14 w-full py-3 pl-12 pr-4 text-base text-ink"
              placeholder={accountCopy.password.placeholder}
              disabled={isPending}
            />
          </span>
        </label>

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
