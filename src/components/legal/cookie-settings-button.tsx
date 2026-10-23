"use client";

import { writeConsent } from "@/lib/consent";

// Посилання внизу сторінки: скидає вибір, і банер з'являється знову.
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => writeConsent(null)}
      className="underline-offset-4 hover:text-foreground hover:underline"
    >
      {label}
    </button>
  );
}
