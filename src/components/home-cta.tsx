import Link from "next/link";
import { getAccess } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  locale: Locale;
  labels: {
    ctaRegister: string;
    ctaSignIn: string;
    ctaClients: string;
    ctaStatus: string;
    ctaSubscription: string;
  };
};

const primary =
  "inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover";
const secondary =
  "inline-flex h-12 items-center justify-center rounded-xl border bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-muted";

// Кнопки під заголовком залежать від того, хто дивиться:
// гість бачить "Створити акаунт" і "Увійти", схвалений користувач "Відкрити клієнтів",
// той, чия заявка ще на розгляді, "Статус заявки".
export async function HomeCta({ locale, labels }: Props) {
  const access = await getAccess();

  if (access.kind === "guest") {
    return (
      <>
        <Link href={`/${locale}/sign-up`} className={primary}>
          {labels.ctaRegister}
        </Link>
        <Link href={`/${locale}/sign-in`} className={secondary}>
          {labels.ctaSignIn}
        </Link>
      </>
    );
  }

  // Схвалений, але термін підписки минув: ведемо на сторінку підписки.
  if (access.status === "approved" && access.expired) {
    return (
      <Link href={`/${locale}/subscription`} className={primary}>
        {labels.ctaSubscription}
      </Link>
    );
  }

  if (access.status === "approved") {
    return (
      <Link href={`/${locale}/clients`} className={primary}>
        {labels.ctaClients}
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/pending`} className={primary}>
      {labels.ctaStatus}
    </Link>
  );
}

// Місце під кнопки, поки перевіряється вхід, щоб сторінка не стрибала.
export function HomeCtaFallback() {
  return <span className="block h-12 w-48" aria-hidden="true" />;
}
