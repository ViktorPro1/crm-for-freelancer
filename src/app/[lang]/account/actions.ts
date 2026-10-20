"use server";

import { auth } from "@/lib/auth/server";
import { requireApproved } from "@/lib/auth/session";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";

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
