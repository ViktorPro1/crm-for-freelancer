import { getSql } from "./db";

// Статистика бази для адмінки. Викликай лише після requireAdmin: перевірки доступу тут немає.

export type DbStats = {
  // Повний розмір бази в байтах (разом з індексами й даними автентифікації).
  totalBytes: number;
  // Скільки з цього займають самі записи клієнтів і нотаток (без індексів).
  userDataBytes: number;
};

export type UserStats = {
  userId: string;
  email: string;
  name: string;
  clients: number;
  archived: number;
  notes: number;
  // Приблизний розмір записів користувача (клієнти й нотатки), у байтах.
  bytes: number;
};

export async function getDbStats(): Promise<DbStats & { users: UserStats[] }> {
  const sql = getSql();

  const [size] = await sql`SELECT pg_database_size(current_database()) AS bytes`;

  // pg_column_size рахує розмір усього рядка. Це наближення: індекси й службові дані не входять.
  const rows = await sql`
    SELECT
      p.user_id AS "userId",
      p.email,
      p.name,
      COALESCE(c.total, 0) AS clients,
      COALESCE(c.archived, 0) AS archived,
      COALESCE(n.total, 0) AS notes,
      COALESCE(c.bytes, 0) + COALESCE(n.bytes, 0) AS bytes
    FROM profiles p
    LEFT JOIN (
      SELECT owner_id,
             count(*) AS total,
             count(*) FILTER (WHERE status = 'archived') AS archived,
             sum(pg_column_size(cl.*)) AS bytes
      FROM clients cl
      GROUP BY owner_id
    ) c ON c.owner_id = p.user_id
    LEFT JOIN (
      SELECT cl.owner_id,
             count(*) AS total,
             sum(pg_column_size(cn.*)) AS bytes
      FROM client_notes cn
      JOIN clients cl ON cl.id = cn.client_id
      GROUP BY cl.owner_id
    ) n ON n.owner_id = p.user_id
    ORDER BY bytes DESC, p.created_at
  `;

  const users = rows.map((row) => ({
    userId: row.userId as string,
    email: row.email as string,
    name: row.name as string,
    clients: Number(row.clients),
    archived: Number(row.archived),
    notes: Number(row.notes),
    bytes: Number(row.bytes),
  }));

  return {
    totalBytes: Number(size.bytes),
    userDataBytes: users.reduce((sum, user) => sum + user.bytes, 0),
    users,
  };
}
