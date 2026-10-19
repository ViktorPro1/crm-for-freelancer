import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/status-badge";
import { getClients } from "@/lib/clients";

export const metadata: Metadata = {
  title: "Клієнти",
};

// Заголовок показується одразу, а таблиця з'являється, коли база відповість.
// Suspense показує запасний текст (fallback), поки дані завантажуються.
export default function ClientsPage() {
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Клієнти
      </h1>

      <Suspense fallback={<p className="mt-6 text-sm text-muted">Завантаження...</p>}>
        <ClientsTable />
      </Suspense>
    </main>
  );
}

// Серверний компонент, який сам іде в базу за даними.
async function ClientsTable() {
  const clients = await getClients();

  return (
    <>
      <p className="mt-1 text-sm text-muted">Усього: {clients.length}</p>

      <div className="mt-6 overflow-hidden rounded-xl border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Клієнт</th>
              {/* Колонка "Компанія" ховається на вузьких екранах: там компанія стоїть під іменем. */}
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Компанія
              </th>
              <th className="px-4 py-3 font-medium">Статус</th>
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
                    href={`/clients/${client.id}`}
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
                  <StatusBadge status={client.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
