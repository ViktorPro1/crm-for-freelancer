import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { requireApproved } from "@/lib/auth/session";
import { getClient } from "@/lib/clients";
import { formatDate } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.clients.detailMetaTitle };
}

// Папка [id] означає, що частина адреси змінна: /uk/clients/1, /uk/clients/2 і так далі.
// Посилання "Усі клієнти" показується одразу, а дані клієнта дозавантажуються.
export default async function ClientPage({
  params,
}: PageProps<"/[lang]/clients/[id]">) {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <Link
        href={`/${locale}/clients`}
        className="-ml-1 inline-flex items-center gap-1 rounded-md text-sm text-muted transition-colors hover:text-primary"
      >
        <ChevronLeftIcon className="size-4" />
        {dict.clients.back}
      </Link>

      <Suspense
        fallback={<p className="mt-6 text-sm text-muted">{dict.clients.loading}</p>}
      >
        <ClientDetails params={params} />
      </Suspense>
    </main>
  );
}

async function ClientDetails({
  params,
}: Pick<PageProps<"/[lang]/clients/[id]">, "params">) {
  // params містить змінну частину адреси. У Next.js 16 його треба чекати через await.
  const { id } = await params;
  const locale = await getLocale();
  const access = await requireApproved(locale);
  const dict = await getDictionary();
  const client = await getClient(id, {
    userId: access.user.id,
    isAdmin: access.isAdmin,
  });

  // Якщо клієнта з таким id немає, показуємо сторінку "не знайдено" (not-found.tsx).
  if (!client) {
    notFound();
  }

  const rows = [
    { label: dict.clients.fieldEmail, value: client.email },
    { label: dict.clients.fieldAdded, value: formatDate(client.createdAt, locale) },
    { label: dict.clients.fieldNotes, value: client.notes },
    // Власника бачить лише адміністратор.
    ...(client.ownerLabel
      ? [{ label: dict.clients.colOwner, value: client.ownerLabel }]
      : []),
  ];

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {client.name}
        </h1>
        <StatusBadge
          status={client.status}
          label={dict.status[client.status]}
        />
      </div>
      <p className="mt-1 text-muted">{client.company}</p>

      <dl className="mt-6 divide-y rounded-xl border bg-surface text-sm">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
          >
            <dt className="text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
