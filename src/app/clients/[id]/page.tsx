import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { getClient } from "@/lib/clients";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Клієнт",
};

// Папка [id] означає, що частина адреси змінна: /clients/1, /clients/2 і так далі.
// Посилання "Усі клієнти" показується одразу, а дані клієнта дозавантажуються.
export default function ClientPage({ params }: PageProps<"/clients/[id]">) {
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <Link
        href="/clients"
        className="-ml-1 inline-flex items-center gap-1 rounded-md text-sm text-muted transition-colors hover:text-primary"
      >
        <ChevronLeftIcon className="size-4" />
        Усі клієнти
      </Link>

      <Suspense fallback={<p className="mt-6 text-sm text-muted">Завантаження...</p>}>
        <ClientDetails params={params} />
      </Suspense>
    </main>
  );
}

async function ClientDetails({
  params,
}: Pick<PageProps<"/clients/[id]">, "params">) {
  // params містить змінну частину адреси. У Next.js 16 його треба чекати через await.
  const { id } = await params;
  const client = await getClient(id);

  // Якщо клієнта з таким id немає, показуємо стандартну сторінку 404.
  if (!client) {
    notFound();
  }

  const rows = [
    { label: "Пошта", value: client.email },
    { label: "Додано", value: formatDate(client.createdAt) },
    { label: "Нотатки", value: client.notes },
  ];

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {client.name}
        </h1>
        <StatusBadge status={client.status} />
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
