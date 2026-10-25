import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "../globals.css";
import { BrandMark } from "@/components/icons";
import {
  LanguageSwitcher,
  LanguageSwitcherFallback,
} from "@/components/language-switcher";
import { Analytics } from "@/components/analytics";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { SiteFooter } from "@/components/legal/site-footer";
import { AuthButton, AuthButtonFallback } from "@/components/auth/auth-button";
import { SidebarNavGate } from "@/components/auth/nav-gate";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SidebarNavFallback } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { locales } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { SITE_URL } from "@/lib/site";

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

// Мова для Open Graph у форматі "мова_КРАЇНА", як вимагають Facebook і Telegram.
const OG_LOCALES = {
  uk: "uk_UA",
  en: "en_US",
  pl: "pl_PL",
  cs: "cs_CZ",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const locale = await getLocale();
  // Картинка для превʼю посилання: public/og/og-<мова>.png, 1200x630.
  const image = {
    url: `/og/og-${locale}.png`,
    width: 1200,
    height: 630,
    alt: dict.app.title,
  };

  return {
    // З metadataBase відносні адреси картинок стають повними (https://домен/og/...).
    metadataBase: new URL(SITE_URL),
    title: { default: dict.app.title, template: `%s | ${dict.app.name}` },
    description: dict.app.description,
    // Картка при вставці посилання в Telegram, Facebook, LinkedIn, Viber тощо.
    // Адресу сторінки (url) тут не задаємо: інакше всі сторінки вказували б на одну адресу.
    openGraph: {
      type: "website",
      siteName: "FreelanceCRM",
      title: dict.app.title,
      description: dict.app.description,
      locale: OG_LOCALES[locale],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.app.title,
      description: dict.app.description,
      images: [image.url],
    },
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
        <Analytics />
        <div className="min-h-screen md:flex">
          {/* На телефоні це верхня панель (логотип і кнопки мови, теми, входу), а розділи йдуть
              у нижню панель. На великому екрані це бічне меню. */}
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
                <span className="hidden text-xs text-sidebar-muted min-[360px]:block">
                  {dict.app.tagline}
                </span>
              </span>
            </Link>

            <div className="contents md:block md:order-2">
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

          {/* Знизу на телефоні лишаємо місце під нижню панель (висота 4rem). */}
          <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
            <div className="flex-1">{children}</div>
            <SiteFooter locale={locale} labels={dict.legal.footer} />
          </div>
        </div>
        <CookieBanner privacyHref={`/${locale}/privacy`} labels={dict.legal.consent} />
      </body>
    </html>
  );
}
