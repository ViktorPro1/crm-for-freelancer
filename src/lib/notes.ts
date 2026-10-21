import { getSql } from "./db";
import type { Viewer } from "./clients";

// Щоденник нотаток: записи з датою до кожного клієнта.
// Доступ до записів визначається власником клієнта: правило стоїть прямо в запитах,
// тому чужі записи не прочитати й не змінити навіть підробкою форми.

export type ClientNote = {
  id: string;
  body: string;
  // Час у форматі ISO (UTC), наприклад "2026-10-21T14:05:00Z". Показуємо його в часовому поясі людини.
  createdAt: string;
};

export const NOTE_MAX_LENGTH = 2000;

type NoteRow = { id: string | number; body: string; createdAt: string };

// Усі записи клієнта, найновіші зверху.
export async function getNotes(
  clientId: string,
  viewer: Viewer,
): Promise<ClientNote[]> {
  if (!/^\d{1,9}$/.test(clientId)) {
    return [];
  }

  const sql = getSql();

  const rows = (await sql`
    SELECT n.id, n.body,
           to_char(n.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
    FROM client_notes n
    JOIN clients c ON c.id = n.client_id
    WHERE n.client_id = ${Number(clientId)}
      AND (c.owner_id = ${viewer.userId} OR ${viewer.isAdmin}::boolean)
    ORDER BY n.created_at DESC, n.id DESC
  `) as NoteRow[];

  return rows.map((row) => ({
    id: String(row.id),
    body: row.body,
    createdAt: row.createdAt,
  }));
}

// Додає запис. До клієнта в архіві нові записи не додаємо.
export async function addNote(
  clientId: string,
  viewer: Viewer,
  body: string,
): Promise<boolean> {
  if (!/^\d{1,9}$/.test(clientId)) {
    return false;
  }

  const sql = getSql();

  const rows = await sql`
    INSERT INTO client_notes (client_id, body)
    SELECT c.id, ${body}
    FROM clients c
    WHERE c.id = ${Number(clientId)}
      AND c.status <> 'archived'
      AND (c.owner_id = ${viewer.userId} OR ${viewer.isAdmin}::boolean)
    RETURNING id
  `;

  return rows.length > 0;
}

// Видаляє один запис, якщо він належить клієнту цього користувача (або це адміністратор).
export async function deleteNote(
  noteId: string,
  viewer: Viewer,
): Promise<boolean> {
  if (!/^\d{1,15}$/.test(noteId)) {
    return false;
  }

  const sql = getSql();

  const rows = await sql`
    DELETE FROM client_notes n
    USING clients c
    WHERE n.id = ${noteId}::bigint
      AND c.id = n.client_id
      AND (c.owner_id = ${viewer.userId} OR ${viewer.isAdmin}::boolean)
    RETURNING n.id
  `;

  return rows.length > 0;
}
