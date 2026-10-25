import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarSeen } from "@/components/calendar/calendar-seen";
import { FollowUpBadge } from "@/components/follow-up-badge";
import { requireApproved } from "@/lib/auth/session";
import { getDueSummary, getFollowUps, type FollowUpItem } from "@/lib/clients";
import { interpolate, type Locale } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { completeFollowUpAction } from "../clients/actions";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.calendar.title };
}

// Календар: усі нагадування "Зв'язатися до". Сторінка лише для тих, хто працює з CRM.
export default async function CalendarPage() {
  const dict = await getDictionary();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {dict.calendar.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{dict.calendar.subtitle}</p>

      <Suspense
        fallback={<p className="mt-6 text-sm text-muted">{dict.clients.loading}</p>}
      >
        <CalendarContent />
      </Suspense>
    </main>
  );
}

async function CalendarContent() {
  const locale = await getLocale();
  const access = await requireApproved(locale);
  const dict = await getDictionary();
  const t = dict.calendar;

  const items = await getFollowUps(access.user.id, locale);
  const summary = await getDueSummary(access.user.id, locale);

  const groups = [
    { key: "overdue", title: t.overdue, list: items.filter((i) => i.followUpDays < 0) },
    { key: "today", title: t.today, list: items.filter((i) => i.followUpDays === 0) },
    {
      key: "soon",
      title: t.soon,
      list: items.filter((i) => i.followUpDays >= 1 && i.followUpDays <= 7),
    },
    { key: "later", title: t.later, list: items.filter((i) => i.followUpDays > 7) },
  ].filter((group) => group.list.length > 0);

  return (
    <>
      {/* Запам'ятовує, що цей набір нагадувань переглянуто: кружечок у меню зникає. */}
      <CalendarSeen signature={summary.signature} />

      {summary.count > 0 ? (
        <p
          role="status"
          className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-500/15 dark:text-red-300"
        >
          {interpolate(t.summary, { count: summary.count })}
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">{t.empty}</p>
          <p className="mt-2 text-sm text-muted">{t.emptyHint}</p>
          <Link
            href={`/${locale}/clients`}
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {t.toClients}
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((group) => (
            <section key={group.key} aria-label={group.title}>
              <h2 className="text-sm font-semibold text-muted">
                {group.title} ({group.list.length})
              </h2>
              <ul className="mt-2 divide-y rounded-xl border bg-surface">
                {group.list.map((item) => (
                  <Row
                    key={item.id}
                    item={item}
                    locale={locale}
                    badge={dict.clients.followUp}
                    doneLabel={dict.clients.followUp.done}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function Row({
  item,
  locale,
  badge,
  doneLabel,
}: {
  item: FollowUpItem;
  locale: Locale;
  badge: Parameters<typeof FollowUpBadge>[0]["labels"];
  doneLabel: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
      <Link
        href={`/${locale}/clients/${item.id}`}
        className="min-w-0 flex-1 basis-40 rounded-md underline-offset-4 hover:text-primary hover:underline"
      >
        <span className="block truncate font-medium">{item.name}</span>
        {item.company ? (
          <span className="block truncate text-xs text-muted">{item.company}</span>
        ) : null}
      </Link>
      <FollowUpBadge
        date={item.followUpOn}
        days={item.followUpDays}
        locale={locale}
        labels={badge}
      />
      <form action={completeFollowUpAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium transition-colors hover:bg-surface-muted"
        >
          {doneLabel}
        </button>
      </form>
    </li>
  );
}
