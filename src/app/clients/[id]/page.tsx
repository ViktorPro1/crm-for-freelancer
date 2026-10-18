import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getClients } from "@/lib/clients";
import { formatDate } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/types";

// Папка [id] означає, що частина адреси змінна: /clients/1, /clients/2 і так далі.
// Ця функція повідомляє Next.js, які саме значення id існують,
// щоб підготувати ці сторінки заздалегідь.
export async function generateStaticParams() {
  const clients = await getClients();
  return clients.map((client) => ({ id: client.id }));
}

// Заголовок вкладки браузера залежить від клієнта.
export async function generateMetadata({
  params,
}: PageProps<"/clients/[id]">): Promise<Metadata> {
  const { id } = await params;
  const client = await getClient(id);

  return { title: client ? client.name : "Клієнта не знайдено" };
}

export default async function ClientPage({
  params,
}: PageProps<"/clients/[id]">) {
  // params містить змінну частину адреси. У Next.js 16 його треба чекати через await.
  const { id } = await params;
  const client = await getClient(id);

  // Якщо клієнта з таким id немає, показуємо стандартну сторінку 404.
  if (!client) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href="/clients"
        className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        ← Усі клієнти
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">{client.name}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">{client.company}</p>

      <dl className="mt-8 divide-y divide-black/10 rounded-lg border border-black/10 text-sm dark:divide-white/15 dark:border-white/15">
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
          <dt className="w-32 shrink-0 text-zinc-600 dark:text-zinc-400">
            Пошта
          </dt>
          <dd>{client.email}</dd>
        </div>
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
          <dt className="w-32 shrink-0 text-zinc-600 dark:text-zinc-400">
            Статус
          </dt>
          <dd>{STATUS_LABELS[client.status]}</dd>
        </div>
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
          <dt className="w-32 shrink-0 text-zinc-600 dark:text-zinc-400">
            Додано
          </dt>
          <dd>{formatDate(client.createdAt)}</dd>
        </div>
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
          <dt className="w-32 shrink-0 text-zinc-600 dark:text-zinc-400">
            Нотатки
          </dt>
          <dd>{client.notes}</dd>
        </div>
      </dl>
    </main>
  );
}
