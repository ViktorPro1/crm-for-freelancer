"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireApproved } from "@/lib/auth/session";
import {
  readClientForm,
  validateClient,
  type ClientFormState,
} from "@/lib/client-input";
import {
  createClient,
  deleteArchivedClient,
  setArchived,
  updateClient,
} from "@/lib/clients";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";

// Кожна дія спершу перевіряє на сервері, хто її викликає: форму в браузері можна підробити.
async function authorize(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;
  const access = await requireApproved(locale);

  return {
    locale,
    viewer: { userId: access.user.id, isAdmin: access.isAdmin },
  };
}

export async function createClientAction(
  _previous: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const { locale, viewer } = await authorize(formData);

  const values = readClientForm(formData);
  const result = validateClient(values);

  if (!result.ok) {
    return { error: result.error, values };
  }

  let id: string;

  try {
    id = await createClient(viewer.userId, result.input);
  } catch {
    return { error: "generic", values };
  }

  // redirect поза try/catch, бо він працює через спеціальну помилку.
  redirect(`/${locale}/clients/${id}`);
}

export async function updateClientAction(
  _previous: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const { locale, viewer } = await authorize(formData);
  const id = String(formData.get("id") ?? "");

  const values = readClientForm(formData);
  const result = validateClient(values);

  if (!result.ok) {
    return { error: result.error, values };
  }

  let saved = false;

  try {
    saved = await updateClient(id, viewer, result.input);
  } catch {
    return { error: "generic", values };
  }

  if (!saved) {
    return { error: "generic", values };
  }

  revalidatePath(`/${locale}/clients`, "layout");
  redirect(`/${locale}/clients/${id}`);
}

export async function archiveClientAction(formData: FormData) {
  const { locale, viewer } = await authorize(formData);
  const id = String(formData.get("id") ?? "");

  await setArchived(id, viewer, true);

  revalidatePath(`/${locale}/clients`, "layout");
  redirect(`/${locale}/clients`);
}

export async function restoreClientAction(formData: FormData) {
  const { locale, viewer } = await authorize(formData);
  const id = String(formData.get("id") ?? "");

  await setArchived(id, viewer, false);

  revalidatePath(`/${locale}/clients`, "layout");
  redirect(`/${locale}/clients/${id}`);
}

export async function deleteClientAction(formData: FormData) {
  const { locale, viewer } = await authorize(formData);
  const id = String(formData.get("id") ?? "");

  await deleteArchivedClient(id, viewer);

  revalidatePath(`/${locale}/clients`, "layout");
  redirect(`/${locale}/clients?view=archive`);
}
