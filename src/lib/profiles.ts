import { getSql } from "./db";

export type ProfileStatus = "pending" | "approved" | "rejected";

// Адміністратор визначається за поштою з .env.local (змінна ADMIN_EMAIL).
export function isAdminEmail(email: string) {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return Boolean(admin) && email.trim().toLowerCase() === admin;
}

// Створює профіль користувача при першому вході (статус "pending", чекає на схвалення)
// або оновлює пошту й ім'я, якщо профіль уже є. Повертає поточний статус.
// Статус при повторному вході не змінюється: його міняє лише адміністратор.
export async function syncProfile(user: {
  id: string;
  email: string;
  name: string;
}): Promise<ProfileStatus> {
  const sql = getSql();
  const firstStatus: ProfileStatus = isAdminEmail(user.email) ? "approved" : "pending";

  const rows = await sql`
    INSERT INTO profiles (user_id, email, name, status)
    VALUES (${user.id}, ${user.email}, ${user.name}, ${firstStatus})
    ON CONFLICT (user_id)
    DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
    RETURNING status
  `;

  return rows[0].status as ProfileStatus;
}

export type ProfileRow = {
  userId: string;
  email: string;
  name: string;
  status: ProfileStatus;
  createdAt: string;
};

// Усі заявки для адмінки: спершу ті, що чекають, потім найновіші.
export async function listProfiles(): Promise<ProfileRow[]> {
  const sql = getSql();

  const rows = await sql`
    SELECT
      user_id AS "userId",
      email,
      name,
      status,
      to_char(created_at, 'YYYY-MM-DD') AS "createdAt"
    FROM profiles
    ORDER BY (status = 'pending') DESC, created_at DESC
  `;

  return rows as ProfileRow[];
}

// Змінює статус заявки. Викликається лише з дій адміністратора.
export async function setProfileStatus(userId: string, status: ProfileStatus) {
  const sql = getSql();

  await sql`
    UPDATE profiles
    SET status = ${status}, decided_at = now()
    WHERE user_id = ${userId}
  `;
}
