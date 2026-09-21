"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { updatePublicProfileAction } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { accountCopy } from "@/lib/i18n/account-pt-br";

interface PublicProfileFormProps {
  displayName: string;
  genderIdentity: string | null;
}

export function PublicProfileForm({
  displayName,
  genderIdentity,
}: PublicProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [gender, setGender] = useState(genderIdentity ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await updatePublicProfileAction({
        displayName: name,
        genderIdentity: gender || null,
      });

      if (!result.ok) {
        setError(accountCopy.genericError);
        return;
      }

      setMessage(accountCopy.saved);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.profile.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.profile.support}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label={accountCopy.profile.displayName}
          name="displayName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isPending}
          required
        />
        <TextField
          label={accountCopy.profile.genderIdentity}
          hint={accountCopy.profile.genderHint}
          name="genderIdentity"
          value={gender}
          onChange={(event) => setGender(event.target.value)}
          disabled={isPending}
        />
        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
        {message && !error ? (
          <p className="text-sm text-ink-soft" role="status">
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending} className="w-full">
          {accountCopy.profile.save}
        </Button>
      </form>
    </Surface>
  );
}
