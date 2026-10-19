import { neon } from "@neondatabase/serverless";
import type { Client, ClientStatus } from "./types";

// Дані клієнтів тепер беруться з бази Neon.
// Адреса бази лежить у файлі .env.local у змінній DATABASE_URL.
// Вона потрібна тільки на сервері: браузер її ніколи не бачить.

function getSql() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "Не задано DATABASE_URL. Перевір, що файл .env.local лежить у корені проєкту.",
    );
  }

  return neon(url);
}

// Так рядок виглядає в базі. Поле id там число, а в нашому коді рядок.
type ClientRow = {
  id: number;
  name: string;
  company: string;
  email: string;
  status: ClientStatus;
  createdAt: string;
  notes: string;
};

function toClient(row: ClientRow): Client {
  return { ...row, id: String(row.id) };
}

export async function getClients(): Promise<Client[]> {
  const sql = getSql();

  // to_char перетворює дату на текст "2026-09-21", щоб не було плутанини з часовими поясами.
  const rows = (await sql`
    SELECT id, name, company, email, status,
           to_char(created_at, 'YYYY-MM-DD') AS "createdAt", notes
    FROM clients
    ORDER BY id
  `) as ClientRow[];

  return rows.map(toClient);
}

export async function getClient(id: string): Promise<Client | undefined> {
  // id береться з адреси в браузері, тому спершу перевіряємо, що це звичайне число.
  // Для адреси на кшталт /clients/abc одразу повертаємо "не знайдено", не звертаючись до бази.
  if (!/^\d{1,9}$/.test(id)) {
    return undefined;
  }

  const sql = getSql();

  // ${Number(id)} драйвер передає в базу окремо від тексту запиту.
  // Так у запит не можна підставити чужий код (це захист від SQL-ін'єкцій).
  const rows = (await sql`
    SELECT id, name, company, email, status,
           to_char(created_at, 'YYYY-MM-DD') AS "createdAt", notes
    FROM clients
    WHERE id = ${Number(id)}
  `) as ClientRow[];

  return rows[0] ? toClient(rows[0]) : undefined;
}
