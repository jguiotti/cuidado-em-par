"use client";

import { useState, useTransition } from "react";

import { exportMyDataAction } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { accountCopy } from "@/lib/i18n/account-pt-br";

export function ExportDataPanel() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await exportMyDataAction();
      if (!result.ok) {
        setError(accountCopy.genericError);
        return;
      }

      const blob = new Blob([result.data.json], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.data.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage(accountCopy.export.ready);
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.export.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.export.support}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={handleExport}
        className="w-full"
      >
        {accountCopy.export.cta}
      </Button>
      {message && !error ? (
        <p className="text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </Surface>
  );
}
