import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.mobileApp.metaTitle, description: dict.mobileApp.lead };
}

const primaryButton =
  "inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover";

// Сторінка відкрита для всіх: тут можна завантажити Android-застосунок і прочитати, як його встановити.
// Файл лежить у public/downloads, тому це звичайне посилання на файл, а не перехід між сторінками.
export default async function MobileAppPage() {
  const { mobileApp: t } = await getDictionary();

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-4 sm:p-8 lg:py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          {t.lead}
        </p>
      </header>

      <section className="rounded-2xl border bg-surface p-6">
        <h2 className="text-lg font-semibold">{t.androidTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.fileInfo}</p>
        <a
          href="/downloads/FreelanceCRM.apk"
          download="FreelanceCRM.apk"
          className={`${primaryButton} mt-4`}
        >
          {t.download}
        </a>

        <h3 className="mt-8 text-base font-semibold">{t.stepsTitle}</h3>
        <ol className="mt-3 space-y-3">
          {t.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border bg-surface p-6">
          <h2 className="text-base font-semibold">{t.whatTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t.whatText}</p>
        </section>
        <section className="rounded-2xl border bg-surface p-6">
          <h2 className="text-base font-semibold">{t.warnTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t.warnText}</p>
        </section>
      </div>

      <section className="rounded-2xl border bg-surface p-6">
        <h2 className="text-base font-semibold">{t.otherTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t.otherText}</p>
      </section>
    </main>
  );
}
