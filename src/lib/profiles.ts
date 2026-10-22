import { getSql } from "./db";
import { TRIAL_DAYS, type ExtendMonths } from "./plans";

export type ProfileStatus = "pending" | "approved" | "rejected";

// Адміністратор визначається за поштою з .env.local (змінна ADMIN_EMAIL).
export function isAdminEmail(email: string) {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return Boolean(admin) && email.trim().toLowerCase() === admin;
}

// Підписка користувача: до якої дати відкритий доступ.
export type Subscription = {
  // Дата "2026-11-05" або null, якщо терміну ще немає (заявку не схвалено).
  until: string | null;
  // Скільки днів залишилось (0 означає, що останній день сьогодні). Від'ємне число: термін минув.
  daysLeft: number | null;
  // Користувач просив рахунок і ще чекає на відповідь.
  invoiceRequested: boolean;
};

export type SyncedProfile = { status: ProfileStatus } & Subscription;

// Створює профіль користувача при першому вході (статус "pending", чекає на схвалення)
// або оновлює пошту й ім'я, якщо профіль уже є. Повертає статус і дані підписки.
// Статус при повторному вході не змінюється: його міняє лише адміністратор.
// Дні рахує сама база (CURRENT_DATE), щоб не залежати від годинника браузера.
export async function syncProfile(user: {
  id: string;
  email: string;
  name: string;
}): Promise<SyncedProfile> {
  const sql = getSql();
  const firstStatus: ProfileStatus = isAdminEmail(user.email) ? "approved" : "pending";

  const rows = await sql`
    INSERT INTO profiles (user_id, email, name, status)
    VALUES (${user.id}, ${user.email}, ${user.name}, ${firstStatus})
    ON CONFLICT (user_id)
    DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
    RETURNING status,
              to_char(access_until, 'YYYY-MM-DD') AS "until",
              (access_until - CURRENT_DATE) AS "daysLeft",
              (invoice_requested_at IS NOT NULL) AS "invoiceRequested"
  `;

  const row = rows[0];

  return {
    status: row.status as ProfileStatus,
    until: row.until ?? null,
    daysLeft: row.daysLeft === null ? null : Number(row.daysLeft),
    invoiceRequested: Boolean(row.invoiceRequested),
  };
}

export type ProfileRow = {
  userId: string;
  email: string;
  name: string;
  status: ProfileStatus;
  createdAt: string;
} & Subscription;

// Усі заявки для адмінки: спершу ті, що чекають, потім найновіші.
export async function listProfiles(): Promise<ProfileRow[]> {
  const sql = getSql();

  const rows = await sql`
    SELECT
      user_id AS "userId",
      email,
      name,
      status,
      to_char(created_at, 'YYYY-MM-DD') AS "createdAt",
      to_char(access_until, 'YYYY-MM-DD') AS "until",
      (access_until - CURRENT_DATE) AS "daysLeft",
      (invoice_requested_at IS NOT NULL) AS "invoiceRequested"
    FROM profiles
    ORDER BY (status = 'pending') DESC,
             (invoice_requested_at IS NOT NULL) DESC,
             created_at DESC
  `;

  return rows.map((row) => ({
    userId: row.userId,
    email: row.email,
    name: row.name,
    status: row.status as ProfileStatus,
    createdAt: row.createdAt,
    until: row.until ?? null,
    daysLeft: row.daysLeft === null ? null : Number(row.daysLeft),
    invoiceRequested: Boolean(row.invoiceRequested),
  }));
}

// Змінює статус заявки. Викликається лише з дій адміністратора.
// При першому схваленні відкриваємо пробний період (TRIAL_DAYS днів); повторне схвалення
// не скидає вже наявний термін.
export async function setProfileStatus(userId: string, status: ProfileStatus) {
  const sql = getSql();

  await sql`
    UPDATE profiles
    SET status = ${status},
        decided_at = now(),
        access_until = CASE
          WHEN ${status} = 'approved'
            THEN COALESCE(access_until, CURRENT_DATE + ${TRIAL_DAYS}::int)
          ELSE access_until
        END
    WHERE user_id = ${userId}
  `;
}

// Продовжує доступ на кілька місяців. Рахуємо від кінця поточного терміну,
// а якщо він уже минув, то від сьогодні. Продовжити можна лише схваленого користувача.
// Прапорець "просив рахунок" знімається. Викликається лише з дій адміністратора.
export async function extendAccess(
  userId: string,
  months: ExtendMonths,
): Promise<boolean> {
  const sql = getSql();

  const rows = await sql`
    UPDATE profiles
    SET access_until = (
          GREATEST(COALESCE(access_until, CURRENT_DATE), CURRENT_DATE)
          + make_interval(months => ${months}::int)
        )::date,
        invoice_requested_at = NULL
    WHERE user_id = ${userId} AND status = 'approved'
    RETURNING user_id
  `;

  return rows.length > 0;
}

// Користувач просить виставити рахунок. Дозволено лише схваленому, і лише один активний запит.
export async function requestInvoice(userId: string): Promise<boolean> {
  const sql = getSql();

  const rows = await sql`
    UPDATE profiles
    SET invoice_requested_at = COALESCE(invoice_requested_at, now())
    WHERE user_id = ${userId} AND status = 'approved'
    RETURNING user_id
  `;

  return rows.length > 0;
}
