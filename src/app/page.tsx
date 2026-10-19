import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Дашборд
      </h1>
      <p className="mt-1 text-sm text-muted">Огляд клієнтів і справ.</p>

      <section className="mt-6 rounded-xl border bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Почніть із клієнтів</h2>
        <p className="mt-2 max-w-prose text-muted">
          Тут з&apos;являться нагадування, проєкти та рахунки. Поки що
          доступний список клієнтів.
        </p>
        <Link
          href="/clients"
          className="mt-5 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Відкрити клієнтів
        </Link>
      </section>
    </main>
  );
}
