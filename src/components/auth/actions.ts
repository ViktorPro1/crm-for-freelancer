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

// Адреса сторінки введення коду. Пошту беремо в адресу, щоб показати, куди надіслано лист.
function verifyUrl(locale: string, email: string) {
  return `/${locale}/verify?email=${encodeURIComponent(email)}`;
}

function readLocale(formData: FormData) {
  const value = String(formData.get("locale") ?? "");
  return hasLocale(value) ? value : defaultLocale;
}

// Сервер повідомляє про зайняту пошту повідомленням "User already exists...".
// Дивимось і на код, і на текст, бо SDK може підміняти код на загальний.
// SDK повертає різні коди залежно від версії: email_not_confirmed, EMAIL_NOT_VERIFIED або статус 403.
function isEmailNotVerified(error: { code?: string; message?: string; status?: number }) {
  return (
    error.status === 403 ||
    /email_not_confirmed|email_not_verified/i.test(String(error.code ?? "")) ||
    /verif|confirm/i.test(String(error.message ?? ""))
  );
}

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

  const { data, error } = await auth.signUp.email({
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

  // Якщо в Neon ввімкнено підтвердження пошти, сесії після реєстрації ще немає:
  // спершу людина вводить код з листа.
  if (data && !data.token) {
    redirect(verifyUrl(locale, email));
  }

  // Новий користувач чекає на схвалення: сторінка /pending покаже статус заявки.
  redirect(`/${locale}/pending`);
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
    // Пошту ще не підтверджено. Надсилаємо код ще раз і ведемо на сторінку введення коду.
    if (isEmailNotVerified(error)) {
      await auth.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
      redirect(verifyUrl(locale, email));
    }

    return {
      error: error.status === 401 || error.status === 400 ? "invalid" : "generic",
      values: { name: "", email },
    };
  }

  // Сторінка /pending сама відправить схваленого користувача на головну.
  redirect(`/${locale}/pending`);
}

export async function signOutAction(formData: FormData) {
  const locale = readLocale(formData);

  await auth.signOut();

  redirect(`/${locale}`);
}

// Підтвердження пошти кодом з листа.
export type VerifyState = {
  error: "invalid" | "tooMany" | "generic";
} | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function verifyEmailAction(
  _previous: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const locale = readLocale(formData);
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").replace(/\s/g, "");

  // Код складається з цифр. Усе інше відсіюємо, не звертаючись до сервера.
  if (!EMAIL_PATTERN.test(email) || !/^\d{4,10}$/.test(otp)) {
    return { error: "invalid" };
  }

  const { error } = await auth.emailOtp.verifyEmail({ email, otp });

  if (error) {
    // SDK може підміняти поле code, тому розпізнаємо за статусом (403/429) і текстом помилки.
    if (
      error.status === 403 ||
      error.status === 429 ||
      /too many/i.test(String(error.message ?? "")) ||
      String(error.code ?? "").includes("TOO_MANY_ATTEMPTS")
    ) {
      return { error: "tooMany" };
    }

    return { error: error.status === 400 ? "invalid" : "generic" };
  }

  // Залежно від налаштувань Neon, після підтвердження людина вже може бути увійшовшою.
  // Якщо так, ведемо на статус заявки, якщо ні, на вхід із повідомленням.
  const { data: session } = await auth.getSession();

  if (session?.user) {
    redirect(`/${locale}/pending`);
  }

  redirect(`/${locale}/sign-in?verified=1`);
}

// Надіслати код ще раз. Повертає "sent" або "error".
export async function resendCodeAction(email: string): Promise<"sent" | "error"> {
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "error";
  }

  const { error } = await auth.emailOtp.sendVerificationOtp({
    email: email.trim(),
    type: "email-verification",
  });

  return error ? "error" : "sent";
}
