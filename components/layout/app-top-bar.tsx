import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { IconPerson, IconShield } from "@/components/brand/soft-icons";

interface AppTopBarProps {
  title: string;
}

export function AppTopBar({ title }: AppTopBarProps) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <BrandLogo variant="header" href="/home" />
        <h1 className="truncate text-2xl font-bold tracking-tight text-ink">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/terms"
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-raised text-mint-deep"
          aria-label="Privacidade e proteção de dados"
        >
          <IconShield size={20} />
        </Link>
        <Link
          href="/account"
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full bg-mint-deep text-surface"
          aria-label="Conta"
        >
          <IconPerson size={20} />
        </Link>
      </div>
    </header>
  );
}
