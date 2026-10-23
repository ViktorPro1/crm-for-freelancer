"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import {
  clearAnalyticsCookies,
  readConsent,
  subscribeConsent,
} from "@/lib/consent";
import { GA_MEASUREMENT_ID } from "@/lib/site";

// Google Analytics (GA4). Вмикається лише в production і лише після згоди людини.
// Без згоди (або після її відкликання) скрипт не вантажиться, а cookie _ga видаляються.
export function Analytics() {
  // На сервері й під час гідратації відповідь undefined: аналітика вимкнена.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => undefined);
  const enabled = process.env.NODE_ENV === "production" && consent === "granted";

  useEffect(() => {
    // Прапорець, який Google сам враховує: true повністю зупиняє збір даних.
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] =
      !enabled;

    if (consent !== undefined && consent !== "granted") {
      clearAnalyticsCookies();
    }
  }, [enabled, consent]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
