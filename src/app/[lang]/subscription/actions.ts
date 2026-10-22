"use server";

import { revalidatePath } from "next/cache";
import { getAccess } from "@/lib/auth/session";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { requestInvoice } from "@/lib/profiles";

// Користувач просить виставити рахунок. Звертаємось до сесії, а не до даних форми:
// просити можна лише за себе, і лише схваленому (адміністратору рахунок не потрібен).
export async function requestInvoiceAction(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;

  const access = await getAccess();

  if (access.kind !== "member" || access.isAdmin || access.status !== "approved") {
    return;
  }

  await requestInvoice(access.user.id);

  revalidatePath(`/${locale}/subscription`);
  revalidatePath(`/${locale}/admin`);
}
