import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { VerifyForm } from "@/components/auth/verify-form";
import { interpolate } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.auth.verifyTitle };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Сторінка введення коду з листа. Пошта береться з адреси (?email=...), бо після реєстрації
// сесії ще немає. Звернення до searchParams залежить від запиту, тому лежить у Suspense.
export default function VerifyPage({ searchParams }: PageProps<"/[lang]/verify">) {
  return (
    <main className="mx-auto max-w-md p-4 sm:p-8">
      <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
        <VerifyContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function VerifyContent({
  searchParams,
}: Pick<PageProps<"/[lang]/verify">, "searchParams">) {
  const locale = await getLocale();
  const { auth } = await getDictionary();
  const params = await searchParams;
  const raw = params.email;
  const email = typeof raw === "string" ? raw.trim() : "";

  // Без коректної пошти на цій сторінці робити нічого: відправляємо на вхід.
  if (!EMAIL_PATTERN.test(email)) {
    redirect(`/${locale}/sign-in`);
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {auth.verifyTitle}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {interpolate(auth.verifyText, { email })}
      </p>

      <VerifyForm
        locale={locale}
        email={email}
        backHref={`/${locale}/sign-in`}
        labels={{
          codeLabel: auth.codeLabel,
          submit: auth.verifySubmit,
          pending: auth.verifyPending,
          resend: auth.resend,
          resendIn: auth.resendIn,
          resent: auth.resent,
          back: auth.backToSignIn,
          errors: auth.verifyErrors,
        }}
      />
    </>
  );
}
