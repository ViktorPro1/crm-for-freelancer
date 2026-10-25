import Image from "next/image";
import { Suspense } from "react";
import { GlobeIcon, ShieldIcon, TagIcon, UsersIcon } from "@/components/icons";
import { HomeCta, HomeCtaFallback } from "@/components/home-cta";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

const featureIcons = [UsersIcon, TagIcon, ShieldIcon, GlobeIcon];

// Головна сторінка. Відкрита для всіх: розповідає, що це за платформа і як почати.
export default async function Home() {
  const locale = await getLocale();
  const { home } = await getDictionary();

  const cta = (
    <Suspense fallback={<HomeCtaFallback />}>
      <HomeCta locale={locale} labels={home} />
    </Suspense>
  );

  return (
    <main className="mx-auto max-w-6xl space-y-16 p-4 sm:space-y-24 sm:p-8 lg:py-12">
      {/* Вітання: текст зліва, фото справа (на телефоні фото під текстом). */}
      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
            {home.eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {home.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {home.lead}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">{cta}</div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-3 -z-10 rounded-[2rem] bg-linear-to-br from-primary/20 via-primary/5 to-transparent blur-xl"
          />
          <Image
            src="/images/welcome-day.webp"
            alt={home.heroAlt}
            width={1408}
            height={768}
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-auto w-full rounded-3xl border shadow-xl"
          />
        </div>
      </section>

      {/* Що це за платформа. */}
      <section>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {home.aboutTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {home.aboutText}
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {home.features.map((feature, index) => {
            const Icon = featureIcons[index];

            return (
              <li
                key={feature.title}
                className="rounded-2xl border bg-surface p-6 transition-shadow hover:shadow-md"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.text}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Як це працює: три кроки. */}
      <section>
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {home.stepsTitle}
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {home.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Завершення: заклик і друге фото. */}
      <section className="grid items-center gap-8 overflow-hidden rounded-3xl border bg-linear-to-br from-primary/10 via-surface to-surface p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {home.closingTitle}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            {home.closingText}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">{cta}</div>
        </div>
        <Image
          src="/images/welcome-crm.webp"
          alt={home.eveningAlt}
          width={1600}
          height={1067}
          sizes="(min-width: 1024px) 520px, 100vw"
          // Явне співвідношення сторін: місце під фото резервується ще до завантаження.
          style={{ aspectRatio: "1600 / 1067" }}
          className="h-auto w-full rounded-2xl shadow-lg"
        />
      </section>
    </main>
  );
}
