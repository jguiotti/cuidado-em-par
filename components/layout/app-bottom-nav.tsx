"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  IconHabits,
  IconHome,
  IconPair,
  IconPerson,
  IconRoutine,
} from "@/components/brand/soft-icons";
import { appCopy } from "@/lib/i18n/app-pt-br";

const items = [
  { href: "/home", label: appCopy.nav.home, Icon: IconHome },
  { href: "/workouts", label: appCopy.nav.move, Icon: IconRoutine },
  { href: "/habits", label: appCopy.nav.habits, Icon: IconHabits },
  { href: "/circle", label: appCopy.nav.circle, Icon: IconPair },
  { href: "/account", label: appCopy.nav.account, Icon: IconPerson },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-0 bg-surface/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_32px_color-mix(in_srgb,var(--color-ink)_8%,transparent)] backdrop-blur-md"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-3">
        {items.map(({ href, label, Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-[var(--radius-soft)] px-1 text-[0.7rem] font-semibold transition ${
                  isActive ? "text-mint-deep" : "text-ink-soft"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                    isActive ? "bg-mint text-mint-deep" : "bg-transparent"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
