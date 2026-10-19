import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import { BrandMark } from "@/components/icons";
import { SidebarNav, SidebarNavFallback } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: { default: "CRM для фрилансера", template: "%s | CRM" },
  description: "Облік клієнтів, проєктів і рахунків",
};

// Цей короткий скрипт виконується ще до показу сторінки: бере збережену тему
// (або тему системи, якщо вибору ще не було) і ставить клас "dark".
// Завдяки цьому сторінка не блимає світлим кольором перед темною темою.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning потрібен, бо скрипт вище змінює клас до того, як React прокинеться.
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="min-h-screen md:flex">
          <aside className="bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-5">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg focus-visible:outline-sidebar-ring"
              >
                <BrandMark />
                <span className="leading-tight">
                  <span className="block text-base font-semibold tracking-tight text-white">
                    CRM
                  </span>
                  <span className="block text-xs text-sidebar-muted">
                    для фрилансера
                  </span>
                </span>
              </Link>
              <ThemeToggle />
            </div>

            <div className="px-3 pb-3 md:pb-0">
              <Suspense fallback={<SidebarNavFallback />}>
                <SidebarNav />
              </Suspense>
            </div>
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
