import { getSql } from "./db";
import type { Client, ClientStatus } from "./types";

// Дані клієнтів беруться з бази Neon (підключення описане в db.ts).
// Кожен клієнт має власника (owner_id). Звичайний користувач бачить лише своїх клієнтів,
// адміністратор бачить усіх. Це правило діє тут, на сервері, а не в інтерфейсі.

// Хто зараз дивиться: id користувача й чи він адміністратор.
export type Viewer = { userId: string; isAdmin: boolean };

// Так рядок виглядає в базі. Поле id там число, а в нашому коді рядок.
type ClientRow = {
  id: number;
  name: string;
  company: string;
  email: string;
  status: ClientStatus;
  createdAt: string;
  notes: string;
  ownerLabel: string | null;
};

function toClient(row: ClientRow): Client {
  return { ...row, id: String(row.id) };
}

export async function getClients(viewer: Viewer): Promise<Client[]> {
  const sql = getSql();

  // to_char перетворює дату на текст "2026-09-21", щоб не було плутанини з часовими поясами.
  // Спершу показуємо найновіших клієнтів.
  const rows = (
    viewer.isAdmin
      ? await sql`
          SELECT c.id, c.name, c.company, c.email, c.status,
                 to_char(c.created_at, 'YYYY-MM-DD') AS "createdAt", c.notes,
                 COALESCE(NULLIF(p.name, ''), p.email) AS "ownerLabel"
          FROM clients c
          LEFT JOIN profiles p ON p.user_id = c.owner_id
          ORDER BY c.id DESC
        `
      : await sql`
          SELECT id, name, company, email, status,
                 to_char(created_at, 'YYYY-MM-DD') AS "createdAt", notes,
                 NULL AS "ownerLabel"
          FROM clients
          WHERE owner_id = ${viewer.userId}
          ORDER BY id DESC
        `
  ) as ClientRow[];

  return rows.map(toClient);
}

export async function getClient(
  id: string,
  viewer: Viewer,
): Promise<Client | undefined> {
  // id береться з адреси в браузері, тому спершу перевіряємо, що це звичайне число.
  // Для адреси на кшталт /clients/abc одразу повертаємо "не знайдено", не звертаючись до бази.
  if (!/^\d{1,9}$/.test(id)) {
    return undefined;
  }

  const sql = getSql();

  // ${...} драйвер передає в базу окремо від тексту запиту.
  // Так у запит не можна підставити чужий код (це захист від SQL-ін'єкцій).
  const rows = (
    viewer.isAdmin
      ? await sql`
          SELECT c.id, c.name, c.company, c.email, c.status,
                 to_char(c.created_at, 'YYYY-MM-DD') AS "createdAt", c.notes,
                 COALESCE(NULLIF(p.name, ''), p.email) AS "ownerLabel"
          FROM clients c
          LEFT JOIN profiles p ON p.user_id = c.owner_id
          WHERE c.id = ${Number(id)}
        `
      : await sql`
          SELECT id, name, company, email, status,
                 to_char(created_at, 'YYYY-MM-DD') AS "createdAt", notes,
                 NULL AS "ownerLabel"
          FROM clients
          WHERE id = ${Number(id)} AND owner_id = ${viewer.userId}
        `
  ) as ClientRow[];

  return rows[0] ? toClient(rows[0]) : undefined;
}

export type NewClient = {
  name: string;
  company: string;
  email: string;
  status: "lead" | "active";
  notes: string;
};

// Додає клієнта і повертає його id. Власник береться з сесії, а не з форми.
export async function createClient(
  ownerId: string,
  client: NewClient,
): Promise<string> {
  const sql = getSql();

  const rows = await sql`
    INSERT INTO clients (owner_id, name, company, email, status, notes)
    VALUES (${ownerId}, ${client.name}, ${client.company}, ${client.email},
            ${client.status}, ${client.notes})
    RETURNING id
  `;

  return String(rows[0].id);
}

// Нижче правило доступу таке саме: змінювати може власник клієнта або адміністратор.
// Умова (owner_id = ... OR ...) стоїть прямо в запиті, тому чужого клієнта не змінити навіть підробкою форми.

// Змінює дані клієнта. Статус архівованого клієнта не чіпаємо (його змінюють кнопки "Відновити").
export async function updateClient(
  id: string,
  viewer: Viewer,
  client: NewClient,
): Promise<boolean> {
  if (!/^\d{1,9}$/.test(id)) {
    return false;
  }

  const sql = getSql();

  const rows = await sql`
    UPDATE clients
    SET name = ${client.name},
        company = ${client.company},
        email = ${client.email},
        notes = ${client.notes},
        status = CASE WHEN status = 'archived' THEN status ELSE ${client.status} END
    WHERE id = ${Number(id)}
      AND (owner_id = ${viewer.userId} OR ${viewer.isAdmin}::boolean)
    RETURNING id
  `;

  return rows.length > 0;
}

// Переносить клієнта в архів або повертає з архіву (повернений стає "активним").
export async function setArchived(
  id: string,
  viewer: Viewer,
  archived: boolean,
): Promise<boolean> {
  if (!/^\d{1,9}$/.test(id)) {
    return false;
  }

  const sql = getSql();
  const status: ClientStatus = archived ? "archived" : "active";

  const rows = await sql`
    UPDATE clients
    SET status = ${status}
    WHERE id = ${Number(id)}
      AND (owner_id = ${viewer.userId} OR ${viewer.isAdmin}::boolean)
    RETURNING id
  `;

  return rows.length > 0;
}

// Видаляє клієнта остаточно. Дозволено лише для тих, хто вже в архіві.
export async function deleteArchivedClient(
  id: string,
  viewer: Viewer,
): Promise<boolean> {
  if (!/^\d{1,9}$/.test(id)) {
    return false;
  }

  const sql = getSql();

  const rows = await sql`
    DELETE FROM clients
    WHERE id = ${Number(id)}
      AND status = 'archived'
      AND (owner_id = ${viewer.userId} OR ${viewer.isAdmin}::boolean)
    RETURNING id
  `;

  return rows.length > 0;
}
