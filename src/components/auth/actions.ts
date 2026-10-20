"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { hasLocale, defaultLocale } from "@/lib/i18n/config";

// Результат дії: ключ помилки (текст береться зі словника на сторінці) або нічого.
export type AuthState = {
  error: "generic" | "invalid" | "emailTaken";
  // Повертаємо введені ім'я й пошту, бо React очищає форму після відправки.
  values: { name: string; email: string };
} | null;

function readLocale(formData: FormData) {
  const value = String(formData.get("locale") ?? "");
  return hasLocale(value) ? value : defaultLocale;
}

// Сервер повідомляє про зайняту пошту повідомленням "User already exists...".
// Дивимось і на код, і на текст, бо SDK може підміняти код на загальний.
function isEmailTaken(error: { code?: string; message?: string }) {
  return (
    String(error.code ?? "").startsWith("USER_ALREADY_EXISTS") ||
    /already exists/i.test(String(error.message ?? ""))
  );
}

export async function signUpAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = readLocale(formData);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  const { error } = await auth.signUp.email({
    name,
    email,
    password: String(formData.get("password") ?? ""),
  });

  if (error) {
    return {
      error: isEmailTaken(error) ? "emailTaken" : "generic",
      values: { name, email },
    };
  }

  redirect(`/${locale}`);
}

export async function signInAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = readLocale(formData);

  const email = String(formData.get("email") ?? "").trim();

  const { error } = await auth.signIn.email({
    email,
    password: String(formData.get("password") ?? ""),
  });

  if (error) {
    return {
      error: error.status === 401 || error.status === 400 ? "invalid" : "generic",
      values: { name: "", email },
    };
  }

  redirect(`/${locale}`);
}

export async function signOutAction(formData: FormData) {
  const locale = readLocale(formData);

  await auth.signOut();

  redirect(`/${locale}`);
}
