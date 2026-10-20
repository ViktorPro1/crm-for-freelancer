import { neon } from "@neondatabase/serverless";

// Одне місце, де створюється підключення до бази Neon.
// Адреса бази лежить у файлі .env.local у змінній DATABASE_URL.
// Вона потрібна тільки на сервері: браузер її ніколи не бачить.
export function getSql() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "Не задано DATABASE_URL. Перевір, що файл .env.local лежить у корені проєкту.",
    );
  }

  return neon(url);
}
