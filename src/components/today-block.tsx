import Link from "next/link";
import { FollowUpBadge, type FollowUpLabels } from "@/components/follow-up-badge";
import { canUseCrm, getAccess } from "@/lib/auth/session";
import { getFollowUps, type FollowUpItem } from "@/lib/clients";
import { interpolate, type Locale } from "@/lib/i18n/config";

type Props = {
  locale: Locale;
  labels: {
    title: string;
    subtitle: string;
    overdue: string;
    today: string;
    soon: string;
    empty: string;
    emptyHint: string;
    allClients: string;
    summary: string;
  };
  badge: FollowUpLabels;
};

// Блок "Сьогодні" на головній: кому час нагадати про себе. Показується лише тому, хто
// працює з CRM. Нагадування лише тут, у застосунку, без листів і сповіщень.
export async function TodayBlock({ locale, labels, badge }: Props) {
  const access = await getAccess();

  if (access.kind !== "member" || !canUseCrm(access)) {
    return null;
  }

  const items = await getFollowUps(access.user.id, locale);
  const overdue = items.filter((item) => item.followUpDays < 0);
  const today = items.filter((item) => item.followUpDays === 0);
  const soon = items.filter((item) => item.followUpDays > 0);
  const due = overdue.length + today.length;

  const groups = [
    { key: "overdue", title: labels.overdue, list: overdue },
    { key: "today", title: labels.today, list: today },
    { key: "soon", title: labels.soon, list: soon },
  ].filter((group) => group.list.length > 0);

  return (
    <section
      aria-labelledby="today-title"
      className="rounded-3xl border bg-surface p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="today-title" className="text-2xl font-semibold tracking-tight">
          {labels.title}
        </h2>
        <Link
          href={`/${locale}/clients`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {labels.allClients}
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        {items.length === 0
          ? labels.subtitle
          : interpolate(labels.summary, { count: due })}
      </p>

      {items.length === 0 ? (
        <div className="mt-5 rounded-xl bg-surface-muted p-5">
          <p className="font-medium">{labels.empty}</p>
          <p className="mt-1 text-sm text-muted">{labels.emptyHint}</p>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {groups.map((group) => (
            <div key={group.key}>
              <h3 className="text-sm font-semibold text-muted">
                {group.title} ({group.list.length})
              </h3>
              <ul className="mt-2 divide-y rounded-xl border">
                {group.list.map((item) => (
                  <Row key={item.id} item={item} locale={locale} badge={badge} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Row({
  item,
  locale,
  badge,
}: {
  item: FollowUpItem;
  locale: Locale;
  badge: FollowUpLabels;
}) {
  return (
    <li>
      <Link
        href={`/${locale}/clients/${item.id}`}
        className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/60"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium">{item.name}</span>
          {item.company ? (
            <span className="block truncate text-xs text-muted">{item.company}</span>
          ) : null}
        </span>
        <FollowUpBadge
          date={item.followUpOn}
          days={item.followUpDays}
          locale={locale}
          labels={badge}
        />
      </Link>
    </li>
  );
}
