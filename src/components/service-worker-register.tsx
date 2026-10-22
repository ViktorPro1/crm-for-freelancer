"use client";

import { useEffect } from "react";

// Реєструє service worker (файл public/sw.js). Лише в робочій збірці:
// у режимі розробки (npm run dev) він заважав би оновленню сторінок на льоту.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Без service worker сайт працює як звичайно, просто його не можна встановити.
    });
  }, []);

  return null;
}
