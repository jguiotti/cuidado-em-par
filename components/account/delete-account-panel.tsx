"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { deleteMyAccountAction } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { DELETE_ACCOUNT_CONFIRMATION } from "@/lib/account/consent";
import { accountCopy } from "@/lib/i18n/account-pt-br";

export function DeleteAccountPanel() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await deleteMyAccountAction({ confirmation });
      if (!result.ok) {
        if (result.code === "invalid_confirmation") {
          setError(accountCopy.delete.invalid);
          return;
        }
        setError(accountCopy.genericError);
        return;
      }

      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.delete.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.delete.support}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label={accountCopy.delete.confirmLabel}
          name="deleteConfirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          disabled={isPending}
          autoComplete="off"
          placeholder={DELETE_ACCOUNT_CONFIRMATION}
        />
        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-blush-deep text-ink hover:opacity-90"
        >
          {accountCopy.delete.cta}
        </Button>
      </form>
    </Surface>
  );
}
