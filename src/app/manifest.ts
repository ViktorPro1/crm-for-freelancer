import type { MetadataRoute } from "next";

// Опис застосунку для встановлення на телефон чи комп'ютер (PWA).
// Next.js віддає його за адресою /manifest.webmanifest і сам додає посилання в <head>.
// start_url "/" ведуть на головну: проксі підбере мову (збережену або з браузера).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "FreelanceCRM",
    short_name: "CRM",
    description: "Облік клієнтів, проєктів і рахунків для фрилансера",
    lang: "uk",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f1f7f6",
    theme_color: "#0a3640",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
