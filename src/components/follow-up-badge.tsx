import { formatDate } from "@/lib/format";
import { interpolate, type Locale } from "@/lib/i18n/config";

export type FollowUpLabels = {
  overdue: string;
  today: string;
  tomorrow: string;
  inDays: string;
};

// Мітка нагадування "зв'язатися до": колір залежить від того, скільки залишилось днів.
// Прострочено червоним, сьогодні жовтим, найближчі 7 днів синім, далі нейтрально з датою.
export function FollowUpBadge({
  date,
  days,
  locale,
  labels,
}: {
  date: string;
  days: number;
  locale: Locale;
  labels: FollowUpLabels;
}) {
  let text: string;
  let style: string;

  if (days < 0) {
    text = interpolate(labels.overdue, { days: -days });
    style = "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300";
  } else if (days === 0) {
    text = labels.today;
    style = "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300";
  } else if (days === 1) {
    text = labels.tomorrow;
    style = "bg-info-bg text-info-fg";
  } else if (days <= 7) {
    text = interpolate(labels.inDays, { days });
    style = "bg-info-bg text-info-fg";
  } else {
    text = formatDate(date, locale);
    style = "bg-neutral-bg text-neutral-fg";
  }

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {text}
    </span>
  );
}
