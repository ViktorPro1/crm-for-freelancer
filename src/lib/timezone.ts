import type { Locale } from "./i18n/config";

// Часовий пояс, за яким рахуємо "сьогодні" для нагадувань. Сервер працює в UTC,
// тому без цього "сьогодні" збивалося б уночі на кілька годин.
// Англійська версія теж рахує за київським часом: основна аудиторія сервісу в Україні.
export const TIME_ZONES: Record<Locale, string> = {
  uk: "Europe/Kyiv",
  en: "Europe/Kyiv",
  pl: "Europe/Warsaw",
  cs: "Europe/Prague",
};
