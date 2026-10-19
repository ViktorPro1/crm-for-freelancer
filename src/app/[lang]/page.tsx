import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export default async function Home() {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {dict.home.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{dict.home.subtitle}</p>

      <section className="mt-6 rounded-xl border bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-semibold">{dict.home.startTitle}</h2>
        <p className="mt-2 max-w-prose text-muted">{dict.home.startText}</p>
        <Link
          href={`/${locale}/clients`}
          className="mt-5 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {dict.home.openClients}
        </Link>
      </section>
    </main>
  );
}
