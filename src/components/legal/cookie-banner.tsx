"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { readConsent, subscribeConsent, writeConsent } from "@/lib/consent";

type Props = {
  privacyHref: string;
  labels: { title: string; text: string; accept: string; decline: string; learnMore: string };
};

const buttonClass =
  "inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-primary px-4 text-sm font-semibold transition-colors sm:flex-none";

// Банер згоди. Показується, доки людина не вибрала. Обидві кнопки однакового розміру й ваги,
// щоб відмова була такою ж простою, як згода.
export function CookieBanner({ privacyHref, labels }: Props) {
  // undefined означає, що сторінка ще не гідратувалась: банер не показуємо, щоб уникнути миготіння.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => undefined);

  if (consent !== null) {
    return null;
  }

  return (
    <section
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-3 bottom-[4.75rem] z-[60] md:bottom-3 mx-auto max-w-2xl rounded-2xl border bg-surface p-4 shadow-lg sm:p-5"
    >
      <h2 id="cookie-banner-title" className="text-base font-semibold">
        {labels.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {labels.text}{" "}
        <Link href={privacyHref} className="font-medium text-primary underline-offset-4 hover:underline">
          {labels.learnMore}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => writeConsent("granted")}
          className={`${buttonClass} bg-primary text-primary-foreground hover:bg-primary-hover`}
        >
          {labels.accept}
        </button>
        <button
          type="button"
          onClick={() => writeConsent("denied")}
          className={`${buttonClass} bg-surface text-primary hover:bg-primary/10`}
        >
          {labels.decline}
        </button>
      </div>
    </section>
  );
}
