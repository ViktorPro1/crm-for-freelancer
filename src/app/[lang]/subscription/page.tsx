import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAccess } from "@/lib/auth/session";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/calculator";
import { formatDate } from "@/lib/format";
import { interpolate } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { PRICE_PER_MONTH, TRIAL_DAYS } from "@/lib/plans";
import { requestInvoiceAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.subscription.metaTitle, description: dict.subscription.lead };
}

const primaryButton =
  "inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover";

// Сторінка підписки відкрита для всіх: ціна, що входить і як оплатити.
// Персональна частина (статус і кнопка рахунку) завантажується окремо, бо залежить від входу.
export default async function SubscriptionPage() {
  const locale = await getLocale();
  const { subscription: t } = await getDictionary();
  const price = formatMoney(
    PRICE_PER_MONTH[DEFAULT_CURRENCY[locale]],
    DEFAULT_CURRENCY[locale],
    locale,
  );

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-4 sm:p-8 lg:py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          {t.lead}
        </p>
      </header>

      <Suspense
        fallback={<div className="h-40 rounded-2xl border bg-surface" aria-hidden="true" />}
      >
        <Personal locale={locale} />
      </Suspense>

      <section className="grid gap-6 md:grid-cols-2" aria-label={t.plansLabel}>
        <div className="rounded-2xl border bg-surface p-6">
          <h2 className="text-lg font-semibold">{t.trialTitle}</h2>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {interpolate(t.trialDays, { days: TRIAL_DAYS })}
          </p>
          <p className="mt-2 text-sm text-muted">{t.trialText}</p>
        </div>
        <div className="rounded-2xl border-2 border-primary bg-surface p-6">
          <h2 className="text-lg font-semibold">{t.paidTitle}</h2>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {price}
            <span className="text-base font-normal text-muted"> {t.perMonth}</span>
          </p>
          <p className="mt-2 text-sm text-muted">{t.paidText}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight">{t.includedTitle}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {t.included.map((item) => (
            <li key={item} className="flex gap-3 text-sm">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary"
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight">{t.stepsTitle}</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-2">
          {t.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-2xl text-sm text-muted">{t.paymentNote}</p>
      </section>
    </main>
  );
}

// Блок про конкретну людину: гість, заявка на розгляді, діюча підписка або термін минув.
async function Personal({ locale }: { locale: "uk" | "en" | "pl" | "cs" }) {
  const { subscription: t } = await getDictionary();
  const access = await getAccess();

  const card = "rounded-2xl border bg-surface p-6";

  if (access.kind === "guest") {
    return (
      <div className={card}>
        <h2 className="text-lg font-semibold">{t.guestTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.guestText}</p>
        <div className="mt-4">
          <Link href={`/${locale}/sign-up`} className={primaryButton}>
            {t.register}
          </Link>
        </div>
      </div>
    );
  }

  if (access.isAdmin) {
    return (
      <div className={card}>
        <h2 className="text-lg font-semibold">{t.adminTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.adminText}</p>
      </div>
    );
  }

  if (access.status !== "approved") {
    return (
      <div className={card}>
        <h2 className="text-lg font-semibold">
          {access.status === "rejected" ? t.rejectedTitle : t.pendingTitle}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {access.status === "rejected" ? t.rejectedText : t.pendingText}
        </p>
      </div>
    );
  }

  const { until, daysLeft, invoiceRequested } = access.subscription;

  return (
    <div
      className={`${card} ${access.expired ? "border-red-300 dark:border-red-500/40" : ""}`}
    >
      <h2 className="text-lg font-semibold">
        {access.expired ? t.expiredTitle : t.activeTitle}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {access.expired
          ? interpolate(t.expiredText, {
              date: until ? formatDate(until, locale) : "",
            })
          : interpolate(t.activeText, {
              date: until ? formatDate(until, locale) : "",
              days: daysLeft ?? 0,
            })}
      </p>

      <div className="mt-4">
        {invoiceRequested ? (
          <p role="status" className="text-sm font-medium text-primary">
            {interpolate(t.invoiceSent, { email: access.user.email })}
          </p>
        ) : (
          <form action={requestInvoiceAction}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={primaryButton}>
              {t.requestInvoice}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
