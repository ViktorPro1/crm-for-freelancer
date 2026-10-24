import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";
import uk from "./dictionaries/uk.json";

// Вигляд словника береться з української версії.
// Якщо в іншій мові забути ключ, TypeScript одразу підкаже помилку.
export type Dictionary = typeof uk;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  uk: () => import("./dictionaries/uk.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  pl: () => import("./dictionaries/pl.json").then((module) => module.default),
  cs: () => import("./dictionaries/cs.json").then((module) => module.default),
};

// Мова поточної сторінки береться з адреси (/uk/..., /en/...).
// Якщо в адресі невідома мова, показуємо сторінку 404.
export async function getLocale(): Promise<Locale> {
  const value = await lang();

  if (!hasLocale(value)) {
    notFound();
  }

  return value;
}

// Переклади для вказаної мови. Потрібні там, де немає адреси сторінки з мовою (наприклад, у /api).
export async function getDictionaryFor(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

// Переклади для поточної мови. Працює лише в серверних компонентах.
export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
