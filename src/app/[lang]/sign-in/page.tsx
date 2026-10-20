import type { Metadata } from "next";
import { signInAction } from "@/components/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.auth.signInTitle };
}

export default async function SignInPage() {
  const locale = await getLocale();
  const { auth } = await getDictionary();

  return (
    <main className="mx-auto max-w-md p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {auth.signInTitle}
      </h1>
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
