import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";

const appNav = [
  { href: "/home", label: "Início" },
  { href: "/workouts", label: "Treinos" },
  { href: "/meals", label: "Refeições" },
  { href: "/habits", label: "Hábitos" },
  { href: "/circle", label: "Círculo" },
  { href: "/account", label: "Conta" },
] as const;

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("user_profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const greetingName = profile?.display_name?.trim() || "você";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-6 sm:px-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-mint-deep">Cuidado em Par</p>
          <p className="text-base text-ink-soft">Olá, {greetingName}</p>
        </div>
        <SignOutButton />
      </header>

      <nav
        aria-label="Navegação principal"
        className="mb-8 flex gap-2 overflow-x-auto pb-1"
      >
        {appNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="focus-ring shrink-0 rounded-[var(--radius-soft)] bg-surface-raised px-3 py-2 text-sm font-medium text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
