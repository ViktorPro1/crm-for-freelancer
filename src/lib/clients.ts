import { createHash } from "node:crypto";
import { getSql } from "./db";
import type { Locale } from "./i18n/config";
import { TIME_ZONES } from "./timezone";
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
  followUpOn: string | null;
  followUpDays: number | string | null;
  ownerLabel: string | null;
};

function toClient(row: ClientRow): Client {
  return {
    ...row,
    id: String(row.id),
    followUpOn: row.followUpOn ?? null,
    followUpDays: row.followUpDays === null ? null : Number(row.followUpDays),
  };
}

export async function getClients(
  viewer: Viewer,
  locale: Locale,
): Promise<Client[]> {
  const sql = getSql();
  const tz = TIME_ZONES[locale];

  // to_char перетворює дату на текст "2026-09-21", щоб не було плутанини з часовими поясами.
  // Спершу показуємо найновіших клієнтів.
  const rows = (
    viewer.isAdmin
      ? await sql`
          SELECT c.id, c.name, c.company, c.email, c.status,
                 to_char(c.created_at, 'YYYY-MM-DD') AS "createdAt", c.notes,
                 to_char(c.follow_up_on, 'YYYY-MM-DD') AS "followUpOn",
                 (c.follow_up_on - (now() AT TIME ZONE ${tz})::date) AS "followUpDays",
                 COALESCE(NULLIF(p.name, ''), p.email) AS "ownerLabel"
          FROM clients c
          LEFT JOIN profiles p ON p.user_id = c.owner_id
          ORDER BY c.id DESC
        `
      : await sql`
          SELECT id, name, company, email, status,
                 to_char(created_at, 'YYYY-MM-DD') AS "createdAt", notes,
                 to_char(follow_up_on, 'YYYY-MM-DD') AS "followUpOn",
                 (follow_up_on - (now() AT TIME ZONE ${tz})::date) AS "followUpDays",
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
  locale: Locale,
): Promise<Client | undefined> {
  // id береться з адреси в браузері, тому спершу перевіряємо, що це звичайне число.
  // Для адреси на кшталт /clients/abc одразу повертаємо "не знайдено", не звертаючись до бази.
  if (!/^\d{1,9}$/.test(id)) {
    return undefined;
  }

  const sql = getSql();
  const tz = TIME_ZONES[locale];

  // ${...} драйвер передає в базу окремо від тексту запиту.
  // Так у запит не можна підставити чужий код (це захист від SQL-ін'єкцій).
  const rows = (
    viewer.isAdmin
      ? await sql`
          SELECT c.id, c.name, c.company, c.email, c.status,
                 to_char(c.created_at, 'YYYY-MM-DD') AS "createdAt", c.notes,
                 to_char(c.follow_up_on, 'YYYY-MM-DD') AS "followUpOn",
                 (c.follow_up_on - (now() AT TIME ZONE ${tz})::date) AS "followUpDays",
                 COALESCE(NULLIF(p.name, ''), p.email) AS "ownerLabel"
          FROM clients c
          LEFT JOIN profiles p ON p.user_id = c.owner_id
          WHERE c.id = ${Number(id)}
        `
      : await sql`
          SELECT id, name, company, email, status,
                 to_char(created_at, 'YYYY-MM-DD') AS "createdAt", notes,
                 to_char(follow_up_on, 'YYYY-MM-DD') AS "followUpOn",
                 (follow_up_on - (now() AT TIME ZONE ${tz})::date) AS "followUpDays",
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
  // Дата нагадування "2026-10-28" або null.
  followUpOn: string | null;
};

// Додає клієнта і повертає його id. Власник береться з сесії, а не з форми.
export async function createClient(
  ownerId: string,
  client: NewClient,
): Promise<string> {
  const sql = getSql();

  const rows = await sql`
    INSERT INTO clients (owner_id, name, company, email, status, notes, follow_up_on)
    VALUES (${ownerId}, ${client.name}, ${client.company}, ${client.email},
            ${client.status}, ${client.notes}, ${client.followUpOn}::date)
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
        follow_up_on = ${client.followUpOn}::date,
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

// Нагадування: клієнт, з яким треба зв'язатися, у блоці "Сьогодні" на головній.
// Лише власні клієнти користувача (навіть для адміністратора): нагадування особисті.
export type FollowUpItem = {
  id: string;
  name: string;
  company: string;
  followUpOn: string;
  followUpDays: number;
};

// Усі нагадування користувача, від найстаріших до найдальших. Архівних немає.
export async function getFollowUps(
  userId: string,
  locale: Locale,
): Promise<FollowUpItem[]> {
  const sql = getSql();
  const tz = TIME_ZONES[locale];

  const rows = await sql`
    SELECT id, name, company,
           to_char(follow_up_on, 'YYYY-MM-DD') AS "followUpOn",
           (follow_up_on - (now() AT TIME ZONE ${tz})::date) AS "followUpDays"
    FROM clients
    WHERE owner_id = ${userId}
      AND status <> 'archived'
      AND follow_up_on IS NOT NULL
    ORDER BY follow_up_on, id
    LIMIT 200
  `;

  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    company: row.company,
    followUpOn: row.followUpOn,
    followUpDays: Number(row.followUpDays),
  }));
}

// Скільки клієнтів потребують уваги (прострочені й на сьогодні) і "відбиток" цього набору.
// Відбиток змінюється, коли минає день або змінюється список. Браузер запам'ятовує, який
// відбиток людина вже бачила в календарі, і за ним ховає червоний кружечок біля пункту меню.
export type DueSummary = { count: number; signature: string };

export async function getDueSummary(
  userId: string,
  locale: Locale,
): Promise<DueSummary> {
  const sql = getSql();
  const tz = TIME_ZONES[locale];

  const rows = await sql`
    SELECT id, to_char((now() AT TIME ZONE ${tz})::date, 'YYYY-MM-DD') AS today
    FROM clients
    WHERE owner_id = ${userId}
      AND status <> 'archived'
      AND follow_up_on IS NOT NULL
      AND follow_up_on <= (now() AT TIME ZONE ${tz})::date
    ORDER BY id
    LIMIT 100
  `;

  if (rows.length === 0) {
    return { count: 0, signature: "" };
  }

  const text = `${rows[0].today}:${rows.map((row) => row.id).join(",")}`;

  return {
    count: rows.length,
    signature: createHash("sha1").update(text).digest("hex").slice(0, 12),
  };
}

// Прибирає нагадування: "зв'язався". Права ті самі: власник клієнта або адміністратор.
export async function completeFollowUp(
  id: string,
  viewer: Viewer,
): Promise<boolean> {
  if (!/^\d{1,9}$/.test(id)) {
    return false;
  }

  const sql = getSql();

  const rows = await sql`
    UPDATE clients
    SET follow_up_on = NULL
    WHERE id = ${Number(id)}
      AND (owner_id = ${viewer.userId} OR ${viewer.isAdmin}::boolean)
    RETURNING id
  `;

  return rows.length > 0;
}

// Переносить нагадування на кілька днів від сьогодні (за часом користувача).
export async function snoozeFollowUp(
  id: string,
  viewer: Viewer,
  days: number,
  locale: Locale,
): Promise<boolean> {
  if (!/^\d{1,9}$/.test(id)) {
    return false;
  }

  const sql = getSql();
  const tz = TIME_ZONES[locale];

  const rows = await sql`
    UPDATE clients
    SET follow_up_on = (now() AT TIME ZONE ${tz})::date + ${days}::int
    WHERE id = ${Number(id)}
      AND status <> 'archived'
      AND (owner_id = ${viewer.userId} OR ${viewer.isAdmin}::boolean)
    RETURNING id
  `;

  return rows.length > 0;
}
