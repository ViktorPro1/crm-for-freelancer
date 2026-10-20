// Перевіряє змінні Neon Auth у .env.local і НЕ показує секрет.
// Запуск: node --env-file=.env.local scripts/check-auth-env.mjs

const url = process.env.NEON_AUTH_BASE_URL;
const secret = process.env.NEON_AUTH_COOKIE_SECRET;

console.log("NEON_AUTH_BASE_URL задано:", Boolean(url));

if (url) {
  console.log("  довжина:", url.length);
  console.log("  починається з https://:", url.startsWith("https://"));
  console.log("  містить лапки, пробіли або < >:", /["'\s<>]/.test(url));

  try {
    const parsed = new URL(url);
    console.log("  адреса коректна. Хост:", parsed.host);
    console.log("  шлях:", parsed.pathname);
  } catch {
    console.log("  адреса НЕКОРЕКТНА (саме через це Next.js видає Invalid URL)");
    console.log("  початок значення:", JSON.stringify(url.slice(0, 12)));
  }
}

console.log("NEON_AUTH_COOKIE_SECRET задано:", Boolean(secret));

if (secret) {
  console.log("  довжина:", secret.length, secret.length >= 32 ? "(достатньо)" : "(замало, треба від 32)");
}
