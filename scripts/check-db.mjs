// Перевірка підключення до бази Neon. Сайт цей файл не використовує.
// Запуск: node --env-file=.env.local scripts/check-db.mjs

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error(
    "Не знайдено DATABASE_URL. Перевір, що файл .env.local лежить у корені проєкту " +
      "(поруч із package.json) і що команду запущено саме так, як написано вище.",
  );
  process.exit(1);
}

try {
  const sql = neon(url);
  const rows = await sql`SELECT count(*)::int AS total FROM clients`;
  console.log("Підключення працює. Клієнтів у базі:", rows[0].total);
} catch (error) {
  console.error("Не вдалося підключитися або виконати запит:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
