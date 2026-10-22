import type { Metadata } from "next";
import { Suspense } from "react";
import { StatusBadge } from "@/components/status-badge";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { interpolate, type Locale } from "@/lib/i18n/config";
import {
  getDictionary,
  getLocale,
  type Dictionary,
} from "@/lib/i18n/dictionaries";
import { listProfiles, type ProfileRow } from "@/lib/profiles";
import { EXTEND_MONTHS } from "@/lib/plans";
import { decideAction, extendAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.admin.title };
}

export default async function AdminPage() {
  const dict = await getDictionary();

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <Suspense
        fallback={
          <>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {dict.admin.title}
            </h1>
            <p className="mt-6 text-sm text-muted">{dict.clients.loading}</p>
          </>
        }
      >
        <AdminContent />
      </Suspense>
    </main>
  );
}

// Серверний компонент: перевіряє, що це адміністратор, і показує заявки.
async function AdminContent() {
  const locale = await getLocale();
  const access = await requireAdmin(locale);
  const dict = await getDictionary();
  const profiles = await listProfiles();
  const pendingCount = profiles.filter((p) => p.status === "pending").length;

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {dict.admin.title}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {interpolate(dict.admin.summary, {
          total: profiles.length,
          pending: pendingCount,
        })}
      </p>

      {profiles.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{dict.admin.empty}</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{dict.admin.colUser}</th>
                <th className="hidden px-4 py-3 font-medium xl:table-cell">
                  {dict.admin.colDate}
                </th>
                <th className="px-4 py-3 font-medium">{dict.admin.colStatus}</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  {dict.admin.colSub}
                </th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  {dict.admin.colActions}
                </th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => {
                const decisionProps = {
                  profile,
                  isSelf: profile.userId === access.user.id,
                  locale,
                  dict: dict.admin,
                };

                return (
                  <tr key={profile.userId} className="border-t align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{profile.name || profile.email}</div>
                      <div className="break-all text-xs text-muted">{profile.email}</div>
                      {/* На телефоні кнопки стоять під іменем, бо колонка "Дії" там не вміщається. */}
                      <div className="mt-2 space-y-2 sm:hidden">
                        <Subscription {...decisionProps} />
                        <Decision {...decisionProps} />
                        <Extend {...decisionProps} />
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      {formatDate(profile.createdAt, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={profile.status}
                        label={dict.admin.status[profile.status]}
                      />
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <Subscription {...decisionProps} />
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="space-y-2">
                        <Decision {...decisionProps} />
                        <Extend {...decisionProps} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

type DecisionProps = {
  profile: ProfileRow;
  isSelf: boolean;
  locale: Locale;
  dict: Dictionary["admin"];
};

// Кнопки "Схвалити" / "Відхилити". Для самого адміністратора кнопок немає.
function Decision({ profile, isSelf, locale, dict }: DecisionProps) {
  if (isSelf) {
    return <span className="text-xs text-muted">{dict.you}</span>;
  }

  return (
    <form action={decideAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="userId" value={profile.userId} />
      {profile.status !== "approved" ? (
        <button
          type="submit"
          name="status"
          value="approved"
          className="h-9 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {dict.approve}
        </button>
      ) : null}
      {profile.status !== "rejected" ? (
        <button
          type="submit"
          name="status"
          value="rejected"
          className="h-9 rounded-lg border px-3 text-xs font-medium transition-colors hover:bg-surface-muted"
        >
          {dict.reject}
        </button>
      ) : null}
    </form>
  );
}

// До якої дати відкритий доступ і чи просив користувач рахунок.
function Subscription({ profile, isSelf, locale, dict }: DecisionProps) {
  if (isSelf) {
    return <span className="text-xs text-muted">{dict.unlimited}</span>;
  }

  if (profile.status !== "approved" || profile.until === null) {
    return <span className="text-xs text-muted">{dict.noTerm}</span>;
  }

  const expired = profile.daysLeft !== null && profile.daysLeft < 0;

  return (
    <div className="space-y-1 text-xs">
      <div className={expired ? "font-medium text-red-700 dark:text-red-400" : ""}>
        {formatDate(profile.until, locale)}
        {" · "}
        {expired ? dict.expired : interpolate(dict.daysLeft, { days: profile.daysLeft ?? 0 })}
      </div>
      {profile.invoiceRequested ? (
        <span className="inline-block rounded-full bg-info-bg px-2.5 py-0.5 font-medium text-info-fg">
          {dict.invoiceRequested}
        </span>
      ) : null}
    </div>
  );
}

// Кнопки "+1 міс.", "+3 міс.", "+12 міс.": продовжують доступ після отримання оплати.
function Extend({ profile, isSelf, locale, dict }: DecisionProps) {
  if (isSelf || profile.status !== "approved") {
    return null;
  }

  return (
    <form action={extendAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="userId" value={profile.userId} />
      <span className="text-xs text-muted">{dict.extend}</span>
      {EXTEND_MONTHS.map((months) => (
        <button
          key={months}
          type="submit"
          name="months"
          value={months}
          className="h-9 rounded-lg border px-3 text-xs font-medium transition-colors hover:bg-surface-muted"
        >
          {interpolate(dict.extendMonths, { months })}
        </button>
      ))}
    </form>
  );
}
