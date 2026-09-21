import { Suspense, type ReactNode } from "react";

import { EnsureDevAdmin } from "@/components/dev/ensure-dev-admin";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { ShellRepairOnFlag } from "@/components/layout/shell-repair-on-flag";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-28 pt-5 sm:px-6">
      <RegisterServiceWorker />
      <Suspense fallback={null}>
        <ShellRepairOnFlag />
      </Suspense>
      <EnsureDevAdmin />
      <div className="flex flex-1 flex-col">{children}</div>
      <AppBottomNav />
    </div>
  );
}
