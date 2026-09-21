"use client";

import { useEffect } from "react";

/**
 * Registers the shell service worker once on the client.
 * Does not request notifications (that stays opt-in on Hoje/Hábitos).
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure is non-blocking.
    });
  }, []);

  return null;
}
