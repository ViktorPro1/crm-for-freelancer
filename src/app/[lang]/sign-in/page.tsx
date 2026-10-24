import type { Metadata } from "next";
import { Suspense } from "react";
import { signInAction } from "@/components/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.auth.signInTitle };
}

export default async function SignInPage({
  searchParams,
}: PageProps<"/[lang]/sign-in">) {
  const locale = await getLocale();
  const { auth } = await getDictionary();

  return (
    <main className="mx-auto max-w-md p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {auth.signInTitle}
      </h1>
      <Suspense fallback={null}>
        <VerifiedNotice
          searchParams={searchParams}
          verifiedText={auth.verifiedNotice}
          deletedText={auth.deletedNotice}
        />
      </Suspense>
      <AuthForm
        mode="signIn"
        locale={locale}
        action={signInAction}
        switchHref={`/${locale}/sign-up`}
        labels={{
          name: auth.name,
          email: auth.email,
          password: auth.password,
          submit: auth.signInButton,
          pending: auth.signInPending,
          switchText: auth.noAccount,
          switchLink: auth.signUpLink,
          errors: auth.errors,
        }}
      />
    </main>
  );
}

// Після підтвердження пошти (?verified=1) або видалення акаунта (?deleted=1) людину переносить сюди.
async function VerifiedNotice({
  searchParams,
  verifiedText,
  deletedText,
}: Pick<PageProps<"/[lang]/sign-in">, "searchParams"> & {
  verifiedText: string;
  deletedText: string;
}) {
  const params = await searchParams;
  const text =
    params.verified === "1"
      ? verifiedText
      : params.deleted === "1"
        ? deletedText
        : null;

  if (!text) {
    return null;
  }

  return (
    <p
      role="status"
      className="mt-4 rounded-lg bg-success-bg px-4 py-3 text-sm text-success-fg"
    >
      {text}
    </p>
  );
}
