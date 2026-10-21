import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeCta, HomeCtaFallback } from "@/components/home-cta";
import { Calculators } from "@/components/tools/calculators";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.tools.metaTitle, description: dict.tools.lead };
}

// Розділ "Інструменти" відкритий для всіх, навіть без реєстрації.
// Це безкоштовна користь, яка знайомить людину з платформою.
export default async function ToolsPage() {
  const locale = await getLocale();
  const { tools, home } = await getDictionary();

  return (
    <main className="mx-auto max-w-6xl space-y-10 p-4 sm:p-8 lg:py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {tools.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          {tools.lead}
        </p>
      </header>

      <Calculators
        locale={locale}
        labels={{
          currency: tools.currency,
          project: tools.project,
          rate: tools.rate,
        }}
      />

      <section className="rounded-3xl border bg-linear-to-br from-primary/10 via-surface to-surface p-6 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          {tools.ctaTitle}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          {tools.ctaText}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Suspense fallback={<HomeCtaFallback />}>
            <HomeCta locale={locale} labels={home} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
