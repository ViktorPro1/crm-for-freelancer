// Застосовує файли з папки migrations до бази Neon.
// Запуск: npm run db:migrate (застосувати) або npm run db:status (лише показати).
// Підключення береться з .env.local. Адреса бази й пароль на екран не виводяться.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error(
    "Не знайдено DATABASE_URL. Перевір, що файл .env.local лежить у корені проєкту " +
      "(поруч із package.json) і що команда запущена через npm run db:migrate.",
  );
  process.exit(1);
}

const statusOnly = process.argv.includes("--status");
const dir =
  process.env.MIGRATIONS_DIR ??
  fileURLToPath(new URL("../migrations/", import.meta.url));

const files = readdirSync(dir)
  .filter((name) => /^\d{3}_.+\.sql$/.test(name))
  .sort();

// Ділить файл на окремі команди. Рядки-коментарі прибираємо, команди розділяє крапка з комою.
function splitStatements(text) {
  const withoutComments = text
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return withoutComments
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

const sql = neon(url);

try {
  await sql.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name       text PRIMARY KEY,
       applied_at timestamptz NOT NULL DEFAULT now()
     )`,
  );

  const done = new Set(
    (await sql.query("SELECT name FROM schema_migrations")).map((row) => row.name),
  );

  const pending = files.filter((name) => !done.has(name));

  for (const name of files) {
    console.log(done.has(name) ? "  застосовано " : "  очікує      ", name);
  }

  if (statusOnly) {
    console.log(pending.length === 0 ? "Усе актуально." : `Не застосовано: ${pending.length}.`);
    process.exit(0);
  }

  if (pending.length === 0) {
    console.log("Нових міграцій немає, база актуальна.");
    process.exit(0);
  }

  for (const name of pending) {
    const statements = splitStatements(readFileSync(join(dir, name), "utf8"));

    // Захист від помилки розбору: у команді має бути парна кількість одинарних лапок.
    for (const statement of statements) {
      if ((statement.match(/'/g) ?? []).length % 2 !== 0) {
        throw new Error(`У файлі ${name} непарна кількість лапок. Перевір команду: ${statement.slice(0, 60)}`);
      }
    }

    // Усі команди файлу й запис про його застосування виконуються одним пакетом:
    // або все, або нічого.
    await sql.transaction([
      ...statements.map((statement) => sql.query(statement)),
      sql.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]),
    ]);

    console.log("Застосовано:", name);
  }

  console.log("Готово.");
} catch (error) {
  console.error("Міграція не виконана:", error instanceof Error ? error.message : error);
  console.error("Файл, на якому сталась помилка, не застосований і нічого не змінив.");
  process.exit(1);
}
