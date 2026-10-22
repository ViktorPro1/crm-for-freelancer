import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "../globals.css";
import { BrandMark } from "@/components/icons";
import {
  LanguageSwitcher,
  LanguageSwitcherFallback,
} from "@/components/language-switcher";
import { AuthButton, AuthButtonFallback } from "@/components/auth/auth-button";
import { SidebarNavGate } from "@/components/auth/nav-gate";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SidebarNavFallback } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { locales } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

// Кажемо Next.js, які мови існують, щоб підготувати сторінки для кожної заздалегідь.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Колір рядка адреси й верхньої панелі на телефоні (світла й темна тема).
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a3640" },
    { media: "(prefers-color-scheme: dark)", color: "#041217" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: { default: dict.app.title, template: `%s | ${dict.app.name}` },
    description: dict.app.description,
    // Значок для екрана "Додому" на iPhone.
    icons: { apple: "/icons/apple-touch-icon.png" },
    appleWebApp: { capable: true, title: dict.app.name, statusBarStyle: "default" },
  };
}

// Цей короткий скрипт виконується ще до показу сторінки: бере збережену тему
// (або тему системи, якщо вибору ще не було) і ставить клас "dark".
// Завдяки цьому сторінка не блимає світлим кольором перед темною темою.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

// Це головна рамка сайту. Вона лежить у папці [lang], тому знає мову сторінки.
export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    // lang={locale} підказує браузеру й пошуковикам, якою мовою сторінка.
    // suppressHydrationWarning потрібен, бо скрипт нижче змінює клас до того, як React прокинеться.
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ServiceWorkerRegister />
        <div className="min-h-screen md:flex">
          {/* На телефоні це верхня панель (сітка з двох колонок), на великому екрані бічне меню. */}
          <aside className="grid grid-cols-[1fr_auto] items-center bg-sidebar px-4 py-3 text-sidebar-foreground md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:items-stretch md:px-3 md:py-0">
            <Link
              href={`/${locale}`}
              className="col-start-1 row-start-1 flex items-center gap-3 rounded-lg md:order-1 md:px-2 md:py-5 focus-visible:outline-sidebar-ring"
            >
              <BrandMark />
              <span className="leading-tight">
                <span className="block text-base font-semibold tracking-tight text-white">
                  {dict.app.name}
                </span>
                <span className="block text-xs text-sidebar-muted">
                  {dict.app.tagline}
                </span>
              </span>
            </Link>

            <div className="col-span-2 row-start-2 mt-3 md:order-2 md:mt-0">
              <Suspense
                fallback={
                  <SidebarNavFallback
                    locale={locale}
                    labels={dict.nav}
                    showClients={false}
                  />
                }
              >
                <SidebarNavGate locale={locale} labels={dict.nav} />
              </Suspense>
            </div>

            <div className="col-start-2 row-start-1 flex items-center gap-1 md:order-3 md:mt-auto md:py-4">
              <Suspense
                fallback={
                  <LanguageSwitcherFallback
                    currentLocale={locale}
                    label={dict.controls.language}
                  />
                }
              >
                <LanguageSwitcher
                  currentLocale={locale}
                  label={dict.controls.language}
                />
              </Suspense>
              <ThemeToggle label={dict.controls.toggleTheme} />
              <Suspense fallback={<AuthButtonFallback />}>
                <AuthButton
                  locale={locale}
                  signInLabel={dict.auth.signInTitle}
                  signOutLabel={dict.auth.signOut}
                />
              </Suspense>
            </div>
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
