"use server";

import { redirect } from "next/navigation";
import { deleteUserData } from "@/lib/account-data";
import { auth } from "@/lib/auth/server";
import { getUser, requireApproved } from "@/lib/auth/session";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { isAdminEmail } from "@/lib/profiles";

export type AccountState = {
  result: "saved" | "wrong" | "error";
  // Повертаємо збережене ім'я, бо React очищає форму після відправки.
  name?: string;
} | null;

async function checkAccess(formData: FormData) {
  const raw = String(formData.get("locale") ?? "");
  const locale = hasLocale(raw) ? raw : defaultLocale;

  // Лише схвалені користувачі мають кабінет. Перевірка на сервері, бо форму можна підробити.
  await requireApproved(locale);
}

export async function updateNameAction(
  _previous: AccountState,
  formData: FormData,
): Promise<AccountState> {
  await checkAccess(formData);

  const name = String(formData.get("name") ?? "").trim();

  if (name.length === 0 || name.length > 100) {
    return { result: "error", name };
  }

  const { error } = await auth.updateUser({ name });

  return error ? { result: "error", name } : { result: "saved", name };
}

export async function changePasswordAction(
  _previous: AccountState,
  formData: FormData,
): Promise<AccountState> {
  await checkAccess(formData);

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8 || newPassword.length > 128) {
    return { result: "error" };
  }

  const { error } = await auth.changePassword({
    currentPassword,
    newPassword,
    revokeOtherSessions: false,
  });

  if (!error) {
    return { result: "saved" };
  }

  // Коли поточний пароль не підійшов, SDK повертає код invalid_credentials
  // (або сервер відповідає "Invalid password"). Дивимось на обидва варіанти.
  const code = String(error.code ?? "");
  const wrong =
    code === "invalid_credentials" ||
    code.includes("INVALID_PASSWORD") ||
    /invalid password/i.test(String(error.message ?? ""));

  return { result: wrong ? "wrong" : "error" };
}

export type DeleteState = { result: "wrong" | "admin" | "error" } | null;

// Видалення акаунта самим користувачем. Доступне й тоді, коли підписка закінчилась,
// тому перевіряємо лише вхід, а не схвалення. Спершу видаляємо запис у Neon Auth:
// якщо це не вдалося (наприклад, невірний пароль), у базі нічого не чіпаємо.
export async function deleteAccountAction(
  _previous: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const raw = String(formData.get("locale") ?? "");
  const locale = hasLocale(raw) ? raw : defaultLocale;
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Акаунт адміністратора видаляти не можна: інакше сервіс лишився б без керування.
  if (isAdminEmail(user.email)) {
    return { result: "admin" };
  }

  const password = String(formData.get("password") ?? "");

  if (password.length === 0 || password.length > 128) {
    return { result: "wrong" };
  }

  const { error } = await auth.deleteUser({ password });

  if (error) {
    const code = String(error.code ?? "");
    // У журнал (Vercel Logs) пишемо лише код і статус, без паролів і даних людини.
    console.error("deleteUser: Neon Auth повернув помилку", error.status, code);
    const wrong =
      code === "invalid_credentials" ||
      code.includes("INVALID_PASSWORD") ||
      /invalid password/i.test(String(error.message ?? ""));

    return { result: wrong ? "wrong" : "error" };
  }

  // Користувача в Neon Auth видалено. Тепер прибираємо його дані в нашій базі.
  // Якщо база раптом не відповість, людину це не зупиняє: її вхід уже закрито.
  try {
    await deleteUserData(user.id);
  } catch (e) {
    console.error("Не вдалося видалити дані користувача після видалення акаунта", e);
  }

  // Прибираємо cookie сесії. Помилка тут не важлива: сесії вже не існує.
  try {
    await auth.signOut();
  } catch {}

  redirect(`/${locale}/sign-in?deleted=1`);
}
