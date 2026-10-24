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

export type ByteUnits = { b: string; kb: string; mb: string; gb: string };

// Розмір даних у зрозумілому вигляді: "850 КБ", "24,3 МБ". Десяткові одиниці (1 КБ = 1000 Б),
// як у Neon. Форматуємо самі, а не через Intl, щоб сервер і браузер показували однаково.
export function formatBytes(bytes: number, locale: Locale, units: ByteUnits): string {
  const steps: [number, string][] = [
    [1e9, units.gb],
    [1e6, units.mb],
    [1e3, units.kb],
  ];

  for (const [size, unit] of steps) {
    if (bytes >= size) {
      return `${formatDecimal(bytes / size, locale)} ${unit}`;
    }
  }

  return `${Math.round(bytes)} ${units.b}`;
}

// Число з однією цифрою після коми: коми в uk/pl/cs, крапка в en.
export function formatDecimal(value: number, locale: Locale): string {
  const text = (Math.round(value * 10) / 10).toFixed(1);

  return locale === "en" ? text : text.replace(".", ",");
}
