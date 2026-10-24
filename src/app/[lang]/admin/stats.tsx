import { formatBytes, formatDecimal } from "@/lib/format";
import { interpolate, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  COMPUTE_LIMIT_HOURS,
  DB_STORAGE_LIMIT_BYTES,
  NEON_CONSOLE_URL,
} from "@/lib/plans";
import { getDbStats } from "@/lib/stats";

const card = "rounded-xl border bg-surface p-5";

// Блок "Статистика" в адмінці: місце в базі, години обчислень і дані по кожному користувачу.
// Серверний компонент, який викликається лише зі сторінки адмінки після перевірки доступу.
export async function AdminStats({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["admin"]["stats"];
}) {
  const stats = await getDbStats();
  const limit = DB_STORAGE_LIMIT_BYTES;
  const usedPercent = Math.min(100, (stats.totalBytes / limit) * 100);
  const freeBytes = Math.max(0, limit - stats.totalBytes);
  const otherBytes = Math.max(0, stats.totalBytes - stats.userDataBytes);
  const critical = usedPercent >= 90;
  const bytes = (value: number) => formatBytes(value, locale, dict.units);

  return (
    <section className="mt-8 space-y-4" aria-labelledby="admin-stats-title">
      <h2 id="admin-stats-title" className="text-xl font-semibold tracking-tight">
        {dict.title}
      </h2>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${card} lg:col-span-2`}>
          <h3 className="text-sm font-medium text-muted">{dict.dbTitle}</h3>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {interpolate(dict.usedOf, { used: bytes(stats.totalBytes), limit: bytes(limit) })}
          </p>
          <div
            role="progressbar"
            aria-label={dict.dbTitle}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(usedPercent)}
            className="mt-3 h-3 overflow-hidden rounded-full bg-surface-muted"
          >
            <div
              className={`h-full rounded-full ${critical ? "bg-red-600" : "bg-primary"}`}
              style={{ width: `${Math.max(usedPercent, 1)}%` }}
            />
          </div>
          <p className="mt-2 text-sm">
            {interpolate(dict.filled, { percent: formatDecimal(usedPercent, locale) })}
            {" · "}
            <span className="font-medium">
              {interpolate(dict.free, { free: bytes(freeBytes) })}
            </span>
          </p>
          {usedPercent >= 80 ? (
            <p role="alert" className="mt-3 text-sm font-medium text-red-700 dark:text-red-400">
              {dict.warn}
            </p>
          ) : null}

          <dl className="mt-4 grid gap-2 border-t pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">{dict.userData}</dt>
              <dd className="font-medium">{bytes(stats.userDataBytes)}</dd>
            </div>
            <div>
              <dt className="text-muted">{dict.otherData}</dt>
              <dd className="font-medium">{bytes(otherBytes)}</dd>
            </div>
          </dl>
        </div>

        <div className={card}>
          <h3 className="text-sm font-medium text-muted">{dict.computeTitle}</h3>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {interpolate(dict.computeLimit, { hours: COMPUTE_LIMIT_HOURS })}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{dict.computeNote}</p>
          <a
            href={NEON_CONSOLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {dict.computeLink}
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-surface">
        <h3 className="px-4 pt-4 text-sm font-medium text-muted">{dict.perUserTitle}</h3>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-left text-sm">
            <thead className="bg-surface-muted text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{dict.colUser}</th>
                <th className="px-4 py-3 font-medium">{dict.colClients}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">{dict.colNotes}</th>
                <th className="px-4 py-3 font-medium">{dict.colData}</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">{dict.colShare}</th>
              </tr>
            </thead>
            <tbody>
              {stats.users.map((user) => (
                <tr key={user.userId} className="border-t align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.name || user.email}</div>
                    <div className="break-all text-xs text-muted">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {user.clients}
                    {user.archived > 0 ? (
                      <div className="text-xs text-muted">
                        {interpolate(dict.archivedShort, { count: user.archived })}
                      </div>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">{user.notes}</td>
                  <td className="px-4 py-3">{bytes(user.bytes)}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {formatDecimal((user.bytes / limit) * 100, locale)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-xs text-muted">{dict.perUserNote}</p>
      </div>
    </section>
  );
}
