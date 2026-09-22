"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { accountCopy } from "@/lib/i18n/account-pt-br";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaInstallCardProps {
  /** Compact card for post-auth flows. */
  compact?: boolean;
}

export function PwaInstallCard({ compact = false }: PwaInstallCardProps) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua);
    setIsIos(ios);
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator &&
          Boolean(
            (window.navigator as Navigator & { standalone?: boolean })
              .standalone,
          )),
    );

    function onPrompt(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (isStandalone) {
    return null;
  }

  async function handleInstall() {
    if (!deferred) {
      return;
    }
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <Surface className={compact ? "space-y-3 p-4" : "space-y-4"}>
      <div className="space-y-1">
        <h2
          className={
            compact
              ? "text-lg font-semibold text-ink"
              : "text-xl font-semibold text-ink"
          }
        >
          {accountCopy.install.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.install.support}
        </p>
      </div>

      {deferred ? (
        <Button type="button" onClick={handleInstall} className="w-full">
          {accountCopy.install.cta}
        </Button>
      ) : null}

      {isIos ? (
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.install.iosHint}
        </p>
      ) : null}

      {!deferred && !isIos ? (
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.install.unsupported}
        </p>
      ) : null}
    </Surface>
  );
}
