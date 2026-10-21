"use client";

import { useSyncExternalStore } from "react";

// Показує дату й час запису в часовому поясі людини.
// Сервер не знає пояс людини, тому спершу малює час за UTC, а в браузері одразу
// замінює його на місцевий. Через useSyncExternalStore це проходить без помилок гідратації.
const subscribe = () => () => {};

function format(iso: string, locale: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(iso));
}

export function LocalTime({ iso, locale }: { iso: string; locale: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => format(iso, locale),
    () => format(iso, locale, "UTC"),
  );

  return <time dateTime={iso}>{text}</time>;
}
