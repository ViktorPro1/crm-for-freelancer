import type { Metadata } from "next";
import { getClients } from "@/lib/clients";
import { STATUS_LABELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Клієнти",
};

// async означає, що ця сторінка вміє чекати на дані (зараз з файлу, потім з бази).
// Вона виконується на сервері, тому в браузер приходить уже готова таблиця.
export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-semibold">Клієнти</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Всього: {clients.length}
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-black/3 text-xs uppercase tracking-wide text-zinc-600 dark:border-white/15 dark:bg-white/4 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Клієнт</th>
              <th className="px-4 py-3 font-medium">Компанія</th>
              <th className="px-4 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-black/5 last:border-0 dark:border-white/10"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{client.name}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {client.email}
                  </div>
                </td>
                <td className="px-4 py-3">{client.company}</td>
                <td className="px-4 py-3">{STATUS_LABELS[client.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
