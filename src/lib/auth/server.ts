import { createNeonAuth } from "@neondatabase/auth/next/server";

// Серверна частина входу й реєстрації (Neon Auth).
// Адреса сервісу й секрет для cookie беруться з файлу .env.local.
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
