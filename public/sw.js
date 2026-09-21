/* Shell-only service worker: local reminders + static asset cache.
 * Never cache health, habit, account, or Supabase payloads.
 * `/_next/static` uses network-first so soft navigations never keep stale CSS. */

const SHELL_CACHE = "cep-shell-v2";
const PRECACHE_URLS = [
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon.png",
  "/icons/icon-maskable.svg",
  "/icons/icon-maskable.png",
  "/brand/mark.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isImmutableShellAsset(url) {
  return (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/brand/mark.png"
  );
}

function isNextStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  // Never cache the worker itself; always take the network copy.
  if (url.pathname === "/sw.js") {
    event.respondWith(fetch(request));
    return;
  }

  // Next chunks change often in dev/deploy — prefer network, fall back offline.
  if (isNextStaticAsset(url)) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || Response.error())),
    );
    return;
  }

  if (!isImmutableShellAsset(url)) {
    return;
  }

  event.respondWith(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "SHOW_HABIT_REMINDER") {
    return;
  }

  const title = typeof data.title === "string" ? data.title : "Cuidado em Par";
  const body = typeof data.body === "string" ? data.body : "";
  const tag = typeof data.tag === "string" ? data.tag : "habit-reminder";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag,
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      (clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow("/home");
        }
        return undefined;
      },
    ),
  );
});
