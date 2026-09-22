import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { IconPerson, IconShield } from "@/components/brand/soft-icons";
import { appCopy } from "@/lib/i18n/app-pt-br";

interface AppTopBarProps {
  title: string;
}

export function AppTopBar({ title }: AppTopBarProps) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <div className="min-w-0 space-y-0.5">
        <BrandLogo variant="header" href="/home" />
        <p className="truncate text-sm font-semibold text-ink-soft">{title}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/terms"
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-raised text-mint-deep"
          aria-label={appCopy.topBar.privacy}
        >
          <IconShield size={20} />
        </Link>
        <Link
          href="/account"
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full bg-mint-deep text-surface"
          aria-label={appCopy.topBar.account}
        >
          <IconPerson size={20} />
        </Link>
      </div>
    </header>
  );
}
