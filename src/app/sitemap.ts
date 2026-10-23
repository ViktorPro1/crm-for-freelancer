import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

// Публічні сторінки, які мають бути в пошуку. Кабінет, адмінка й клієнти приховані за входом,
// тож їх тут немає. Для кожної сторінки перелічено всі мови, щоб пошукач показував потрібну.
const PUBLIC_PAGES = ["", "/tools", "/subscription", "/mobile-app", "/about", "/terms", "/privacy"];

function pageUrl(locale: string, page: string) {
  return `${SITE_URL}/${locale}${page}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.flatMap((page) =>
    locales.map((locale) => ({
      url: pageUrl(locale, page),
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map((l) => [l, pageUrl(l, page)])),
          "x-default": pageUrl(defaultLocale, page),
        },
      },
    })),
  );
}
