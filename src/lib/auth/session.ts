import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import type { Locale } from "@/lib/i18n/config";

// Поточний користувач із сесії (cookie) або null, якщо людина не увійшла.
export async function getUser() {
  // Явно читаємо cookie першими: так Next.js знає, що цей блок залежить від запиту
  // і готує його не заздалегідь, а під час відвідування.
  await cookies();
  // Не даємо Next.js «репетирувати» цей запит заздалегідь: сесію читаємо лише на справжньому запиті.
  await connection();

  const { data } = await auth.getSession();
  return data?.user ?? null;
}

// Для сторінок, які бачать лише ті, хто увійшов. Без входу переносить на сторінку входу.
// Пізніше тут же додамо перевірку, що заявку схвалив адміністратор.
export async function requireUser(locale: Locale) {
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  return user;
}
