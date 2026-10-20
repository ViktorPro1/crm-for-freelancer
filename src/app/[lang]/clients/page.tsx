import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth/session";
import { getClients } from "@/lib/clients";
import { interpolate } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.clients.metaTitle };
}

// Сторінка доступна лише після входу. Перевірка й дані лежать усередині Suspense,
// поки вони завантажуються, показується заголовок і запасний текст.
export default async function ClientsPage() {
  const dict = await getDictionary();

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <Suspense
        fallback={
          <>
            <Title />
            <p className="mt-6 text-sm text-muted">{dict.clients.loading}</p>
          </>
        }
      >
        <ClientsContent />
      </Suspense>
    </main>
  );
}

async function Title() {
  const dict = await getDictionary();

  return (
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
      {dict.clients.title}
    </h1>
  );
}

// Серверний компонент: перевіряє вхід і сам іде в базу за даними.
async function ClientsContent() {
  const locale = await getLocale();
  await requireUser(locale);
  const dict = await getDictionary();
  const clients = await getClients();

  return (
    <>
      <Title />
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
