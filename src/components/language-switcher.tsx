"use client";

// Вибір мови. Запам'ятовує вибір у cookie і переходить на ту саму сторінку іншою мовою.

import { usePathname } from "next/navigation";
import {
  hasLocale,
  LOCALE_COOKIE,
  localeNames,
  locales,
  type Locale,
} from "@/lib/i18n/config";

type Props = {
  currentLocale: Locale;
  label: string;
};

function LanguageSelect({
  currentLocale,
  label,
  onChange,
  disabled,
}: Props & { onChange?: (next: Locale) => void; disabled?: boolean }) {
  return (
    <select
      aria-label={label}
      title={label}
      value={currentLocale}
      disabled={disabled}
      onChange={(event) => {
        const next = event.target.value;
        if (hasLocale(next)) {
          onChange?.(next);
        }
      }}
      className="h-10 min-w-0 rounded-lg bg-sidebar-active/60 px-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-active focus-visible:outline-sidebar-ring"
    >
      {locales.map((locale) => (
        <option
          key={locale}
          value={locale}
          className="bg-sidebar text-sidebar-foreground"
        >
          {localeNames[locale]}
        </option>
      ))}
    </select>
  );
}

export function LanguageSwitcher({ currentLocale, label }: Props) {
  const pathname = usePathname();

  function changeLanguage(next: Locale) {
    // Запам'ятовуємо вибір на рік, щоб наступного разу відкривалась ця мова.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;

    // /uk/clients/3 -> ["", "uk", "clients", "3"]. Міняємо другий елемент на нову мову.
    const segments = pathname.split("/");
    segments[1] = next;

    // Свідомо робимо повне перезавантаження сторінки, а не router.push: мова є частиною
    // кореневої рамки (<html lang>), і React не вміє безпечно підміняти її в браузері.
    window.location.assign(segments.join("/"));
  }

  return (
    <LanguageSelect
      currentLocale={currentLocale}
      label={label}
      onChange={changeLanguage}
    />
  );
}

// Показується на мить, поки Next.js визначає адресу сторінки.
export function LanguageSwitcherFallback({ currentLocale, label }: Props) {
  return (
    <LanguageSelect currentLocale={currentLocale} label={label} disabled />
  );
}
