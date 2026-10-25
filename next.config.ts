import type { NextConfig } from "next";

// Політика безпеки вмісту (CSP): браузер завантажує лише з перелічених джерел.
// Це головний захист від впровадженого чужого скрипта (XSS).
// 'unsafe-inline' потрібен, бо Next.js вставляє у сторінку власні короткі скрипти й стилі,
// а скрипт вибору теми в layout.tsx теж вбудований. Google Analytics дозволено за списком із
// документації Google (адреси googletagmanager.com і google-analytics.com).
// У режимі розробки React потребує ще 'unsafe-eval' і WebSocket для швидкого оновлення,
// тому в dev політику не вмикаємо: перевіряємо її лише в production.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Забороняє браузеру "вгадувати" тип файлу, тож картинка не виконається як скрипт.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Забороняє показувати сайт у чужому iframe (захист від clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // На інші сайти йде лише адреса сайту, без шляху й параметрів сторінки.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Сайту не потрібні камера, мікрофон, геолокація тощо: вимикаємо їх повністю.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), interest-cohort=()",
  },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
    : []),
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Файл service worker браузер завжди має перевіряти заново, щоб оновлення доходили до людей.
  async headers() {
    return [
      // Захисні заголовки для всіх сторінок і файлів.
      { source: "/:path*", headers: securityHeaders },
      // APK віддається як файл для завантаження, а не відкривається в браузері.
      {
        source: "/downloads/FreelanceCRM.apk",
        headers: [
          { key: "Content-Type", value: "application/vnd.android.package-archive" },
          { key: "Content-Disposition", value: 'attachment; filename="FreelanceCRM.apk"' },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      // Файли для пошукових агентів і ШІ-агентів: дозволяємо читати їх з будь-якого сайту.
      {
        source: "/.well-known/:file(ard\\.json|ai-catalog\\.json)",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
