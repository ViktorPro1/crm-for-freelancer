// Спільна перевірка даних форми клієнта (додавання й редагування).
// Лежить окремо від "use server" файлу, бо там дозволені лише асинхронні дії.

export type ClientInput = {
  name: string;
  company: string;
  email: string;
  status: "lead" | "active";
  notes: string;
  // Дата нагадування або null, якщо поле порожнє.
  followUpOn: string | null;
};

export type ClientFormValues = {
  name: string;
  company: string;
  email: string;
  status: string;
  notes: string;
  // Те, що в полі дати: "2026-10-28" або порожній рядок.
  followUp: string;
};

export type ClientFormError = "name" | "email" | "followUp" | "generic";

export type ClientFormState = {
  error: ClientFormError;
  // Повертаємо введене, бо React очищає форму після відправки.
  values: ClientFormValues;
} | null;

// Проста перевірка пошти: щось@щось.щось без пробілів.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readClientForm(formData: FormData): ClientFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    status: String(formData.get("status") ?? "lead"),
    notes: String(formData.get("notes") ?? "").trim(),
    followUp: String(formData.get("followUp") ?? "").trim(),
  };
}

// Чи це справжня дата у форматі РРРР-ММ-ДД (а не "2026-02-31") у розумних межах.
export function isValidDate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }

  const date = new Date(`${text}T00:00:00Z`);
  const year = date.getUTCFullYear();

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === text &&
    year >= 2000 &&
    year <= 2100
  );
}

// Повертає або перевірені дані, або ключ помилки для показу на сторінці.
export function validateClient(
  values: ClientFormValues,
): { ok: true; input: ClientInput } | { ok: false; error: ClientFormError } {
  if (values.name.length === 0 || values.name.length > 100) {
    return { ok: false, error: "name" };
  }

  if (
    values.email.length > 0 &&
    (values.email.length > 200 || !EMAIL_PATTERN.test(values.email))
  ) {
    return { ok: false, error: "email" };
  }

  if (values.followUp !== "" && !isValidDate(values.followUp)) {
    return { ok: false, error: "followUp" };
  }

  if (
    values.company.length > 100 ||
    values.notes.length > 2000 ||
    (values.status !== "lead" && values.status !== "active")
  ) {
    return { ok: false, error: "generic" };
  }

  return {
    ok: true,
    input: {
      name: values.name,
      company: values.company,
      email: values.email,
      status: values.status,
      notes: values.notes,
      followUpOn: values.followUp === "" ? null : values.followUp,
    },
  };
}
