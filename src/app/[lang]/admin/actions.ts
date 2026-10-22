"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { EXTEND_MONTHS, type ExtendMonths } from "@/lib/plans";
import { extendAccess, setProfileStatus } from "@/lib/profiles";

// Дія "Схвалити" / "Відхилити". Дані з форми можна підробити, тому перевіряємо все на сервері:
// чи це адміністратор, чи допустимий статус і чи не змінює він сам себе.
export async function decideAction(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;

  const access = await requireAdmin(locale);

  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!userId || userId === access.user.id) {
    return;
  }

  if (status !== "approved" && status !== "rejected") {
    return;
  }

  await setProfileStatus(userId, status);

  revalidatePath(`/${locale}/admin`);
}

// Дія "Продовжити доступ": адміністратор підтверджує, що оплату отримано.
// Кількість місяців беремо лише зі списку дозволених, бо дані форми можна підробити.
export async function extendAction(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;

  await requireAdmin(locale);

  const userId = String(formData.get("userId") ?? "");
  const months = Number(formData.get("months"));

  if (!userId || !EXTEND_MONTHS.includes(months as ExtendMonths)) {
    return;
  }

  await extendAccess(userId, months as ExtendMonths);

  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/subscription`);
}
