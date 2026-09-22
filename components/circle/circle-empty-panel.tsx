"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import {
  createGroupAction,
  createPairAction,
  joinCircleAction,
} from "@/app/actions/care-circle";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { circleCopy } from "@/lib/i18n/circle-pt-br";

function mapError(code: string): string {
  if (code === "invalid_invite") {
    return circleCopy.errors.invalid_invite;
  }
  if (code === "pair_full") {
    return circleCopy.errors.pair_full;
  }
  if (code === "group_full") {
    return circleCopy.errors.group_full;
  }
  if (code === "already_in_circle") {
    return circleCopy.errors.already_in_circle;
  }
  return circleCopy.errors.generic;
}

export function CircleEmptyPanel() {
  const router = useRouter();
  const [pairName, setPairName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreatePair(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPairAction({ name: pairName || null });
      if (!result.ok) {
        setError(mapError(result.code));
        return;
      }
      router.refresh();
    });
  }

  function handleCreateGroup(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createGroupAction({ name: groupName || null });
      if (!result.ok) {
        setError(mapError(result.code));
        return;
      }
      router.refresh();
    });
  }

  function handleJoin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await joinCircleAction({ inviteCode });
      if (!result.ok) {
        setError(mapError(result.code));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Surface className="space-y-2">
        <h2 className="text-xl font-semibold text-ink">
          {circleCopy.emptyTitle}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {circleCopy.emptySupport}
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          {circleCopy.emptyValue}
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          {circleCopy.privacy}
        </p>
      </Surface>

      <Surface className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-ink">
            {circleCopy.createPair}
          </h3>
          <p className="text-sm leading-relaxed text-ink-soft">
            {circleCopy.pairSupport}
          </p>
        </div>
        <form onSubmit={handleCreatePair} className="flex flex-col gap-3">
          <TextField
            label={circleCopy.createPairNameLabel}
            name="pairName"
            value={pairName}
            onChange={(event) => setPairName(event.target.value)}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {circleCopy.createPair}
          </Button>
        </form>
      </Surface>

      <Surface className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-ink">
            {circleCopy.createGroup}
          </h3>
          <p className="text-sm leading-relaxed text-ink-soft">
            {circleCopy.groupSupport}
          </p>
        </div>
        <form onSubmit={handleCreateGroup} className="flex flex-col gap-3">
          <TextField
            label={circleCopy.createGroupNameLabel}
            name="groupName"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {circleCopy.createGroup}
          </Button>
        </form>
      </Surface>

      <Surface className="space-y-4">
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <TextField
            label={circleCopy.joinCodeLabel}
            name="inviteCode"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            disabled={isPending}
            autoComplete="off"
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={isPending}
            className="w-full"
          >
            {circleCopy.join}
          </Button>
        </form>
      </Surface>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </div>
  );
}
