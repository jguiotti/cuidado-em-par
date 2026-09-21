"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * After a denied /admin soft-nav, Next can leave the app shell without fresh CSS.
 * One hard navigation (query shell=1) restores utilities like fixed bottom nav.
 */
export function ShellRepairOnFlag() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("shell") !== "1") {
      return;
    }
    window.location.replace(pathname);
  }, [pathname, searchParams]);

  return null;
}
