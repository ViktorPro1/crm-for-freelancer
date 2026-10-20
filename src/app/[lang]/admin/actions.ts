"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { setProfileStatus } from "@/lib/profiles";

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
