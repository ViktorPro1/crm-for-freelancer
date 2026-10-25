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
  completeFollowUp,
  createClient,
  deleteArchivedClient,
  setArchived,
  snoozeFollowUp,
  updateClient,
} from "@/lib/clients";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { addNote, deleteNote, NOTE_MAX_LENGTH } from "@/lib/notes";

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

  // Новий клієнт міг отримати дату нагадування: оновлюємо меню (кружечок біля "Календар").
  revalidatePath(`/${locale}`, "layout");

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

// "Зв'язався": прибирає нагадування. Головну сторінку (блок "Сьогодні") теж оновлюємо.
export async function completeFollowUpAction(formData: FormData) {
  const { locale, viewer } = await authorize(formData);
  const id = String(formData.get("id") ?? "");

  await completeFollowUp(id, viewer);

  revalidatePath(`/${locale}`, "layout");
}

// Переносить нагадування на 3 або 7 днів від сьогодні. Інші значення ігноруємо.
export async function snoozeFollowUpAction(formData: FormData) {
  const { locale, viewer } = await authorize(formData);
  const id = String(formData.get("id") ?? "");
  const days = Number(formData.get("days"));

  if (days !== 3 && days !== 7) {
    return;
  }

  await snoozeFollowUp(id, viewer, days, locale);

  revalidatePath(`/${locale}`, "layout");
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

// Записи щоденника. Порожній або задовгий запис просто ігноруємо (форма в браузері
// теж цього не дозволяє, але перевірка на сервері обов'язкова).
export async function addNoteAction(formData: FormData) {
  const { locale, viewer } = await authorize(formData);
  const clientId = String(formData.get("clientId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (body.length === 0 || body.length > NOTE_MAX_LENGTH) {
    return;
  }

  await addNote(clientId, viewer, body);

  revalidatePath(`/${locale}/clients`, "layout");
}

export async function deleteNoteAction(formData: FormData) {
  const { locale, viewer } = await authorize(formData);
  const noteId = String(formData.get("noteId") ?? "");

  await deleteNote(noteId, viewer);

  revalidatePath(`/${locale}/clients`, "layout");
}
