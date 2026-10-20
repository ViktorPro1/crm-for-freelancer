import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { auth } from "@/lib/auth/server";
import type { Locale } from "@/lib/i18n/config";
import { isAdminEmail, syncProfile, type ProfileStatus } from "@/lib/profiles";

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

export type Access =
  | { kind: "guest" }
  | { kind: "member"; status: ProfileStatus; isAdmin: boolean; user: NonNullable<Awaited<ReturnType<typeof getUser>>> };

// Хто зараз на сайті і що йому дозволено. cache() робить запит один раз за візит,
// навіть якщо його викликають меню, сторінка й інші частини.
export const getAccess = cache(async (): Promise<Access> => {
  const user = await getUser();

  if (!user) {
    return { kind: "guest" };
  }

  // Профіль створюється (або оновлюється) при кожному візиті. Адміністратор має доступ завжди.
  const isAdmin = isAdminEmail(user.email);
  const savedStatus = await syncProfile(user);
  const status = isAdmin ? "approved" : savedStatus;

  return { kind: "member", status, isAdmin, user };
});

// Чи можна показувати користувачу робочі розділи CRM (клієнти тощо).
export function canUseCrm(access: Access) {
  return access.kind === "member" && access.status === "approved";
}

// Для сторінок із даними. Без входу: на сторінку входу.
// Увійшов, але заявку не схвалено: на сторінку зі статусом заявки.
export async function requireApproved(locale: Locale) {
  const access = await getAccess();

  if (access.kind === "guest") {
    redirect(`/${locale}/sign-in`);
  }

  if (access.status !== "approved") {
    redirect(`/${locale}/pending`);
  }

  return access;
}

// Для сторінок і дій адміністратора. Гостя відправляє на вхід,
// а всім іншим показується "не знайдено", щоб навіть не підказувати, що адмінка існує.
export async function requireAdmin(locale: Locale) {
  const access = await getAccess();

  if (access.kind === "guest") {
    redirect(`/${locale}/sign-in`);
  }

  if (!access.isAdmin) {
    notFound();
  }

  return access;
}
