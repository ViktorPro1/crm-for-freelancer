import { getSql } from "./db";
import type { ClientStatus } from "./types";

// Дані одного користувача для експорту й видалення акаунта.
// Тут завжди лише ВЛАСНІ дані (owner_id = користувач), навіть для адміністратора:
// експорт і видалення стосуються людини, яка їх запросила.

export type ExportClient = {
  id: number;
  name: string;
  company: string;
  email: string;
  status: ClientStatus;
  createdAt: string;
  notes: string;
};

export type ExportNote = {
  clientId: number;
  clientName: string;
  createdAt: string;
  body: string;
};

export async function getExportClients(userId: string): Promise<ExportClient[]> {
  const sql = getSql();

  const rows = await sql`
    SELECT id, name, company, email, status,
           to_char(created_at, 'YYYY-MM-DD') AS "createdAt", notes
    FROM clients
    WHERE owner_id = ${userId}
    ORDER BY id
  `;

  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    company: row.company,
    email: row.email,
    status: row.status as ClientStatus,
    createdAt: row.createdAt,
    notes: row.notes,
  }));
}

export async function getExportNotes(userId: string): Promise<ExportNote[]> {
  const sql = getSql();

  const rows = await sql`
    SELECT c.id AS "clientId", c.name AS "clientName",
           to_char(n.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt",
           n.body
    FROM client_notes n
    JOIN clients c ON c.id = n.client_id
    WHERE c.owner_id = ${userId}
    ORDER BY c.id, n.created_at, n.id
  `;

  return rows.map((row) => ({
    clientId: Number(row.clientId),
    clientName: row.clientName,
    createdAt: row.createdAt,
    body: row.body,
  }));
}

// Видаляє всі дані користувача в базі: клієнтів (їхні нотатки видаляються разом з ними
// завдяки ON DELETE CASCADE) і профіль. Обидва запити виконуються як одна транзакція:
// або видалено все, або нічого.
export async function deleteUserData(userId: string): Promise<void> {
  const sql = getSql();

  await sql.transaction([
    sql`DELETE FROM clients WHERE owner_id = ${userId}`,
    sql`DELETE FROM profiles WHERE user_id = ${userId}`,
  ]);
}
