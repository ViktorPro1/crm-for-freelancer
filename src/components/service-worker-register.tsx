"use client";

import { useEffect } from "react";

// Реєструє service worker (файл public/sw.js). Лише в робочій збірці.
// У режимі розробки (npm run dev) він заважав би оновленню сторінок на льоту, тому там
// ми навпаки прибираємо service worker і його кеш, якщо вони лишилися після перевірки `npm start`.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((item) => item.unregister()))
        .catch(() => {});
      caches
        .keys()
        .then((keys) =>
          keys.filter((key) => key.startsWith("crm-static-")).forEach((key) => caches.delete(key)),
        )
        .catch(() => {});

      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Без service worker сайт працює як звичайно, просто його не можна встановити.
    });
  }, []);

  return null;
}
