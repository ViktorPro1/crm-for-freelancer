import type { Locale } from "@/lib/i18n/config";

// Форматувальники створюємо один раз для кожної мови.
// timeZone: "UTC" потрібен, щоб дата скрізь показувалась однаково.
const formatters = new Map<Locale, Intl.DateTimeFormat>();

// Перетворює дату "2026-09-21" на текст залежно від мови:
// uk: "21 вересня 2026 р.", en: "September 21, 2026", pl: "21 września 2026", cs: "21. září 2026".
export function formatDate(isoDate: string, locale: Locale): string {
  let formatter = formatters.get(locale);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeZone: "UTC",
    });
    formatters.set(locale, formatter);
  }

  return formatter.format(new Date(isoDate));
}
