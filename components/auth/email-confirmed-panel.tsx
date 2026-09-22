"use client";

import Link from "next/link";

import { PwaInstallCard } from "@/components/pwa/pwa-install-card";
import { Surface } from "@/components/ui/surface";
import { emailConfirmedCopy } from "@/lib/i18n/brand-pt-br";

interface EmailConfirmedPanelProps {
  isLoggedIn: boolean;
  continueHref: string;
}

const ctaClassName =
  "focus-ring inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-soft)] bg-mint-deep px-5 text-base font-semibold text-surface transition hover:opacity-90";

export function EmailConfirmedPanel({
  isLoggedIn,
  continueHref,
}: EmailConfirmedPanelProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <Surface className="space-y-4">
        <div
          className="rounded-[var(--radius-soft)] bg-mint px-4 py-3 text-sm font-medium text-mint-deep"
          role="status"
        >
          {emailConfirmedCopy.title}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {emailConfirmedCopy.title}
          </h1>
          <p className="text-sm leading-relaxed text-ink-soft">
            {isLoggedIn
              ? emailConfirmedCopy.supportLoggedIn
              : emailConfirmedCopy.supportLoggedOut}
          </p>
        </div>

        {isLoggedIn ? (
          <Link href={continueHref} className={ctaClassName}>
            {emailConfirmedCopy.continueCta}
          </Link>
        ) : (
          <Link href="/login" className={ctaClassName}>
            {emailConfirmedCopy.loginCta}
          </Link>
        )}

        <p className="text-xs leading-relaxed text-ink-soft">
          {emailConfirmedCopy.installNote}
        </p>
        <p className="text-xs leading-relaxed text-ink-soft">
          {emailConfirmedCopy.openInBrowserHint}
        </p>
      </Surface>

      <PwaInstallCard compact />
    </div>
  );
}
