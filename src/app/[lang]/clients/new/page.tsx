import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { ClientForm } from "@/components/clients/client-form";
import { requireApproved } from "@/lib/auth/session";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.clients.new.title };
}

export default async function NewClientPage() {
  const locale = await getLocale();
  const { clients } = await getDictionary();

  return (
    <main className="mx-auto max-w-xl p-4 sm:p-8">
      <Link
        href={`/${locale}/clients`}
        className="-ml-1 inline-flex items-center gap-1 rounded-md text-sm text-muted transition-colors hover:text-primary"
      >
        <ChevronLeftIcon className="size-4" />
        {clients.back}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        {clients.new.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{clients.new.subtitle}</p>

      <Suspense fallback={<p className="mt-6 text-sm text-muted">{clients.loading}</p>}>
        <NewClientForm />
      </Suspense>
    </main>
  );
}

// Форма доступна лише схваленим користувачам. Інших перевірка відправить на вхід або в очікування.
async function NewClientForm() {
  const locale = await getLocale();
  await requireApproved(locale);
  const { clients, status } = await getDictionary();
  const n = clients.new;

  return (
    <ClientForm
      locale={locale}
      cancelHref={`/${locale}/clients`}
      labels={{
        name: n.name,
        company: n.company,
        email: n.email,
        status: n.status,
        notes: n.notes,
        submit: n.submit,
        saving: n.saving,
        cancel: n.cancel,
        statusLead: status.lead,
        statusActive: status.active,
        errors: n.errors,
      }}
    />
  );
}
