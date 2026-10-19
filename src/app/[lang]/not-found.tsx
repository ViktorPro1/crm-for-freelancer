import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

// Сторінка, яку бачить людина, коли адреси або запису не існує.
export default async function NotFound() {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {dict.notFound.title}
      </h1>
      <p className="mt-2 max-w-prose text-muted">{dict.notFound.text}</p>
      <Link
        href={`/${locale}`}
        className="mt-5 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        {dict.notFound.backHome}
      </Link>
    </main>
  );
}
