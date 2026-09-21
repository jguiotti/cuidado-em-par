import Link from "next/link";
import { redirect } from "next/navigation";

import { adminCopy } from "@/lib/i18n/admin-pt-br";
import { createClient } from "@/lib/supabase/server";

const adminNav = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/exercises", label: adminCopy.exercisesNav },
  { href: "/admin/meals", label: adminCopy.mealsNav },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    redirect("/home");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-6 sm:px-6">
      <header className="mb-6 space-y-1">
        <p className="text-sm font-semibold text-blush-deep">Backoffice</p>
        <h1 className="text-2xl font-bold text-ink">Cuidado em Par</h1>
        <p className="text-sm text-ink-soft">
          Área interna de conteúdo. Sem acesso a dados de saúde de quem usa o
          app.
        </p>
      </header>

      <nav aria-label="Navegação do backoffice" className="mb-8 flex flex-wrap gap-2">
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="focus-ring rounded-[var(--radius-soft)] bg-surface-raised px-3 py-2 text-sm font-medium text-ink"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/home"
          className="focus-ring rounded-[var(--radius-soft)] bg-mint px-3 py-2 text-sm font-medium text-ink"
        >
          {adminCopy.backToApp}
        </Link>
      </nav>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
