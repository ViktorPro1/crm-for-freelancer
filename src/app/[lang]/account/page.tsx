import type { Metadata } from "next";
import { Suspense } from "react";
import { NameForm, PasswordForm } from "@/components/account/account-forms";
import { requireApproved } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.account.title };
}

export default async function AccountPage() {
  const { account } = await getDictionary();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {account.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{account.subtitle}</p>

      <Suspense fallback={<p className="mt-6 text-sm text-muted">…</p>}>
        <AccountContent />
      </Suspense>
    </main>
  );
}

// Кабінет бачить лише схвалений користувач. Дані беруться з його власної сесії,
// тому кожен бачить тільки себе.
async function AccountContent() {
  const locale = await getLocale();
  const access = await requireApproved(locale);
  const { account } = await getDictionary();
  const { user, isAdmin } = access;

  const initial = (user.name || user.email).trim().charAt(0).toUpperCase();

  // Дата реєстрації може прийти і як Date, і як рядок (залежить від того, звідки взята сесія).
  // new Date(...) приймає обидва варіанти. Якщо дата некоректна, просто не показуємо її.
  const created = new Date(user.createdAt);
  const createdText = Number.isNaN(created.getTime())
    ? null
    : formatDate(created.toISOString().slice(0, 10), locale);

  return (
    <div className="mt-6 space-y-6">
      <section className="flex items-center gap-4 rounded-2xl border bg-surface p-5 sm:p-6">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{user.name || user.email}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <p className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-success-bg px-2.5 py-0.5 font-medium text-success-fg">
              {isAdmin ? account.roleAdmin : account.statusApproved}
            </span>
            {createdText ? (
              <span className="rounded-full bg-neutral-bg px-2.5 py-0.5 font-medium text-neutral-fg">
                {account.memberSince}: {createdText}
              </span>
            ) : null}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold">{account.nameTitle}</h2>
        <div className="mt-4 max-w-md">
          <NameForm locale={locale} currentName={user.name} labels={account} />
        </div>
      </section>

      <section className="rounded-2xl border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold">{account.passwordTitle}</h2>
        <div className="mt-4 max-w-md">
          <PasswordForm locale={locale} labels={account} />
        </div>
      </section>
    </div>
  );
}
