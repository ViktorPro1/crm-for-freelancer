"use client";

// Кнопка перемикання світлої та темної теми.
// Тема зберігається в браузері (localStorage) і застосовується класом "dark" на <html>.
// Який значок показати (сонце чи місяць), вирішує CSS за цим класом, тому стан у React не потрібен.

import { MoonIcon, SunIcon } from "@/components/icons";

export function ThemeToggle({ label }: { label: string }) {
  function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");

    root.classList.toggle("dark", nextIsDark);

    try {
      localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    } catch {
      // Якщо браузер забороняє зберігання, тема просто діє до оновлення сторінки.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="grid size-10 shrink-0 place-items-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-active focus-visible:outline-sidebar-ring"
    >
      <SunIcon className="hidden size-5 dark:block" />
      <MoonIcon className="size-5 dark:hidden" />
    </button>
  );
}
