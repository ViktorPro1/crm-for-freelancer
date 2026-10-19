import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  hasLocale,
  LOCALE_COOKIE,
  locales,
  type Locale,
} from "@/lib/i18n/config";

// Цей файл виконується перед кожним запитом до сторінки.
// Якщо в адресі немає мови (наприклад, /clients), він перенаправляє на адресу з мовою (/uk/clients).

function pickLocale(request: NextRequest): Locale {
  // 1. Мова, яку людина обрала кнопкою раніше.
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && hasLocale(saved)) {
    return saved;
  }

  // 2. Мови з налаштувань браузера (заголовок Accept-Language), від найважливішої.
  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), quality: quality ? Number(quality) : 1 };
    })
    .filter(({ quality }) => !Number.isNaN(quality))
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of preferred) {
    const primary = tag.split("-")[0]; // "pl-PL" -> "pl"
    if (hasLocale(primary)) {
      return primary;
    }
  }

  // 3. Якщо жодна не підійшла, українська.
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  // Пропускаємо службові файли Next.js та всі адреси з крапкою (картинки, іконки тощо).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
