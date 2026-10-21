"use server";

import { redirect } from "next/navigation";
import { requireApproved } from "@/lib/auth/session";
import { createClient } from "@/lib/clients";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";

export type ClientFormState = {
  error: "name" | "email" | "generic";
  // Повертаємо введене, бо React очищає форму після відправки.
  values: {
    name: string;
    company: string;
    email: string;
    status: string;
    notes: string;
  };
} | null;

// Проста перевірка пошти: щось@щось.щось без пробілів.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createClientAction(
  _previous: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;

  // Лише схвалений користувач може додавати. Перевіряємо на сервері, бо форму можна підробити.
  const access = await requireApproved(locale);

  const values = {
    name: String(formData.get("name") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    status: String(formData.get("status") ?? ""),
    notes: String(formData.get("notes") ?? "").trim(),
  };

  if (values.name.length === 0 || values.name.length > 100) {
    return { error: "name", values };
  }

  if (
    values.email.length > 0 &&
    (values.email.length > 200 || !EMAIL_PATTERN.test(values.email))
  ) {
    return { error: "email", values };
  }

  if (
    values.company.length > 100 ||
    values.notes.length > 2000 ||
    (values.status !== "lead" && values.status !== "active")
  ) {
    return { error: "generic", values };
  }

  let id: string;

  try {
    id = await createClient(access.user.id, {
      name: values.name,
      company: values.company,
      email: values.email,
      status: values.status,
      notes: values.notes,
    });
  } catch {
    return { error: "generic", values };
  }

  // redirect поза try/catch, бо він працює через спеціальну помилку.
  redirect(`/${locale}/clients/${id}`);
}
