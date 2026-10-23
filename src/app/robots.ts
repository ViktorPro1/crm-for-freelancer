import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Публічні сторінки відкриті для всіх. Закрито те, що залежить від входу або не має сенсу в пошуку.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/*/admin",
        "/*/account",
        "/*/clients",
        "/*/pending",
        "/*/verify",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
