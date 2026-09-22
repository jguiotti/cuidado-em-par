"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  markRestDayAction,
  unmarkRestDayAction,
} from "@/app/actions/care-circle";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";

interface RestDayCardProps {
  initiallyMarked: boolean;
}

export function RestDayCard({ initiallyMarked }: RestDayCardProps) {
  const router = useRouter();
  const [marked, setMarked] = useState(initiallyMarked);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = marked
        ? await unmarkRestDayAction()
        : await markRestDayAction();
      if (!result.ok) {
        setError(habitsCopy.restDay.error);
        return;
      }
      setMarked(!marked);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-ink">
          {habitsCopy.restDay.title}
        </h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          {habitsCopy.restDay.support}
        </p>
      </div>
      {marked ? (
        <p className="rounded-[var(--radius-soft)] bg-mint px-4 py-3 text-sm font-semibold text-ink">
          {habitsCopy.restDay.done}
        </p>
      ) : null}
      <Button
        type="button"
        variant={marked ? "secondary" : "primary"}
        className="w-full"
        disabled={isPending}
        onClick={handleToggle}
      >
        {marked ? habitsCopy.restDay.undo : habitsCopy.restDay.cta}
      </Button>
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </Surface>
  );
}
