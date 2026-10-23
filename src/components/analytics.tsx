import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/site";

// Google Analytics (GA4). Вмикається лише в production, щоб розробка на localhost
// не потрапляла в статистику. Скрипт вантажиться після того, як сторінка стала інтерактивною,
// тому на швидкість першого показу майже не впливає.
export function Analytics() {
  if (process.env.NODE_ENV !== "production") {
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
