"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  markContentDoneAction,
  unmarkContentDoneAction,
} from "@/app/actions/safe-content";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { appCopy } from "@/lib/i18n/app-pt-br";

interface MarkHabitDoneButtonProps {
  kind: "workout" | "meal";
  contentId: string;
  initiallyDone: boolean;
}

export function MarkHabitDoneButton({
  kind,
  contentId,
  initiallyDone,
}: MarkHabitDoneButtonProps) {
  const router = useRouter();
  const [done, setDone] = useState(initiallyDone);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy = kind === "workout" ? appCopy.move : appCopy.eat;

  function handleToggle() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = done
        ? await unmarkContentDoneAction(kind, contentId)
        : await markContentDoneAction(kind, contentId);

      if (!result.ok) {
        setError(appCopy.habit.genericError);
        return;
      }

      setDone(result.done);
      setMessage(result.done ? copy.marked : copy.unmarked);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={done ? "secondary" : "primary"}
        disabled={isPending}
        onClick={handleToggle}
        className="w-full"
        aria-pressed={done}
      >
        {done ? copy.marked : copy.markDone}
      </Button>
      {message && !error ? (
        <p className="text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </div>
  );
}
