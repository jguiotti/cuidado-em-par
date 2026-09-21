import Link from "next/link";

import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-28 pt-5 sm:px-6">
      <RegisterServiceWorker />
      <div className="flex flex-1 flex-col">{children}</div>
      <AppBottomNav />
    </div>
  );
}
