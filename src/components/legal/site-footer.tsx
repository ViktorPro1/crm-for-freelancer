import Link from "next/link";
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  locale: Locale;
  labels: {
    navLabel: string;
    about: string;
    terms: string;
    privacy: string;
    cookieSettings: string;
    copyright: string;
  };
};

// Підвал сайту: інформаційні сторінки й налаштування cookie.
export function SiteFooter({ locale, labels }: Props) {
  return (
    <footer className="border-t px-4 py-6 text-sm text-muted sm:px-8">
      <nav aria-label={labels.navLabel} className="flex flex-wrap gap-x-5 gap-y-2">
        <Link href={`/${locale}/about`} className="underline-offset-4 hover:text-foreground hover:underline">
          {labels.about}
        </Link>
        <Link href={`/${locale}/terms`} className="underline-offset-4 hover:text-foreground hover:underline">
          {labels.terms}
        </Link>
        <Link href={`/${locale}/privacy`} className="underline-offset-4 hover:text-foreground hover:underline">
          {labels.privacy}
        </Link>
        <CookieSettingsButton label={labels.cookieSettings} />
      </nav>
      <p className="mt-3">{labels.copyright}</p>
    </footer>
  );
}
