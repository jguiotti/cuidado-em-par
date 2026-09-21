"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  reacceptConsentAction,
  revokeConsentAction,
  type ConsentStatusRow,
} from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { accountCopy } from "@/lib/i18n/account-pt-br";
import type { AccountConsentPurpose } from "@/lib/account/consent";

interface ConsentsPanelProps {
  consents: ConsentStatusRow[];
}

function statusLabel(accepted: boolean | null): string {
  if (accepted === true) {
    return accountCopy.consents.active;
  }
  if (accepted === false) {
    return accountCopy.consents.revoked;
  }
  return accountCopy.consents.never;
}

export function ConsentsPanel({ consents }: ConsentsPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRevoke(purpose: AccountConsentPurpose) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await revokeConsentAction({ purpose });
      if (!result.ok) {
        setError(accountCopy.genericError);
        return;
      }
      if (purpose === "health_personalization") {
        setMessage(accountCopy.consents.revokedHealth);
      }
      router.refresh();
    });
  }

  function handleReaccept(purpose: AccountConsentPurpose) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await reacceptConsentAction({ purpose });
      if (!result.ok) {
        setError(accountCopy.genericError);
        return;
      }
      if (result.data.redirectTo) {
        if (purpose === "health_personalization") {
          setMessage(accountCopy.consents.healthReacceptHint);
        }
        router.replace(result.data.redirectTo);
        router.refresh();
        return;
      }
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.consents.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.consents.support}
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {consents.map((row) => {
          const label =
            accountCopy.consents.purposes[
              row.purpose as keyof typeof accountCopy.consents.purposes
            ] ?? row.purpose;
          const isActive = row.accepted === true;

          return (
            <li
              key={row.purpose}
              className="rounded-[var(--radius-soft)] bg-surface-raised p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{label}</p>
                  <p className="text-sm text-ink-soft">
                    {statusLabel(row.accepted)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {isActive ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isPending}
                      onClick={() => handleRevoke(row.purpose)}
                    >
                      {accountCopy.consents.revoke}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReaccept(row.purpose)}
                    >
                      {accountCopy.consents.reaccept}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {message && !error ? (
        <p className="text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </Surface>
  );
}
