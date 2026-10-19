// Налаштування мов. Цей файл без серверного коду, тому його можна підключати де завгодно,
// у тому числі в клієнтських компонентах.

// Російської мови в проєкті немає. Українська за замовчуванням.
export const locales = ["uk", "en", "pl", "cs"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uk";

// Назви мов пишемо їхніми ж мовами, щоб людина впізнала свою.
export const localeNames: Record<Locale, string> = {
  uk: "Українська",
  en: "English",
  pl: "Polski",
  cs: "Čeština",
};

// У цьому cookie браузер запам'ятовує обрану мову.
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Підставляє значення в шаблон: interpolate("Усього: {count}", { count: 6 }) -> "Усього: 6".
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
