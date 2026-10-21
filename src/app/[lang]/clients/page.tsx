import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/status-badge";
import { requireApproved } from "@/lib/auth/session";
import { getClients } from "@/lib/clients";
import { interpolate } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.clients.metaTitle };
}

// Сторінка доступна лише схваленим користувачам. Перевірка й дані лежать усередині Suspense,
// поки вони завантажуються, показується заголовок і запасний текст.
export default async function ClientsPage({
  searchParams,
}: PageProps<"/[lang]/clients">) {
  const dict = await getDictionary();

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <Header />
      <Suspense
        fallback={<p className="mt-6 text-sm text-muted">{dict.clients.loading}</p>}
      >
        <ClientsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// Заголовок із кнопкою "Додати клієнта". Кнопка просто посилання, тому показується одразу.
async function Header() {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {dict.clients.title}
      </h1>
      <Link
        href={`/${locale}/clients/new`}
        className="inline-flex h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        {dict.clients.add}
      </Link>
    </div>
  );
}

// Серверний компонент: перевіряє вхід і сам іде в базу за даними.
async function ClientsContent({
  searchParams,
}: Pick<PageProps<"/[lang]/clients">, "searchParams">) {
  const { view } = await searchParams;
  const showArchive = view === "archive";
  const locale = await getLocale();
  const access = await requireApproved(locale);
  const dict = await getDictionary();
  const all = await getClients({
    userId: access.user.id,
    isAdmin: access.isAdmin,
  });
  const archivedCount = all.filter((c) => c.status === "archived").length;
  const clients = all.filter((c) =>
    showArchive ? c.status === "archived" : c.status !== "archived",
  );

  const tabs = (
    <nav className="mt-5 flex gap-2">
      {[
        { href: `/${locale}/clients`, label: dict.clients.tabCurrent, active: !showArchive },
        {
          href: `/${locale}/clients?view=archive`,
          label: `${dict.clients.tabArchive} (${archivedCount})`,
          active: showArchive,
        },
      ].map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab.active
              ? "bg-primary text-primary-foreground"
              : "border bg-surface text-muted hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );

  if (clients.length === 0 && showArchive) {
    return (
      <>
        {tabs}
        <div className="mt-6 rounded-2xl border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">{dict.clients.emptyArchive}</p>
        </div>
      </>
    );
  }

  if (clients.length === 0) {
    return (
      <>
        {tabs}
        <div className="mt-6 rounded-2xl border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">{dict.clients.empty}</p>
          <p className="mt-2 text-sm text-muted">{dict.clients.emptyHint}</p>
          <Link
            href={`/${locale}/clients/new`}
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {dict.clients.add}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {tabs}
      <p className="mt-1 text-sm text-muted">
        {interpolate(dict.clients.total, { count: clients.length })}
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{dict.clients.colClient}</th>
              {/* Колонка "Компанія" ховається на вузьких екранах: там компанія стоїть під іменем. */}
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                {dict.clients.colCompany}
              </th>
              {access.isAdmin ? (
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  {dict.clients.colOwner}
                </th>
              ) : null}
              <th className="px-4 py-3 font-medium">{dict.clients.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-t transition-colors hover:bg-surface-muted/60"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/${locale}/clients/${client.id}`}
                    className="font-medium underline-offset-4 hover:text-primary hover:underline"
                  >
                    {client.name}
                  </Link>
                  <div className="text-xs text-muted">{client.email}</div>
                  <div className="mt-0.5 text-xs text-muted sm:hidden">
                    {client.company}
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  {client.company}
                </td>
                {access.isAdmin ? (
                  <td className="hidden px-4 py-3 text-muted md:table-cell">
                    {client.ownerLabel}
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <StatusBadge
                    status={client.status}
                    label={dict.status[client.status]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
