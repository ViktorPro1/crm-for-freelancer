import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Файл service worker браузер завжди має перевіряти заново, щоб оновлення доходили до людей.
  async headers() {
    return [
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
