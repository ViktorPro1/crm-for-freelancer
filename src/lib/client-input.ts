// Спільна перевірка даних форми клієнта (додавання й редагування).
// Лежить окремо від "use server" файлу, бо там дозволені лише асинхронні дії.

export type ClientInput = {
  name: string;
  company: string;
  email: string;
  status: "lead" | "active";
  notes: string;
};

export type ClientFormValues = {
  name: string;
  company: string;
  email: string;
  status: string;
  notes: string;
};

export type ClientFormState = {
  error: "name" | "email" | "generic";
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
  };
}

// Повертає або перевірені дані, або ключ помилки для показу на сторінці.
export function validateClient(
  values: ClientFormValues,
): { ok: true; input: ClientInput } | { ok: false; error: "name" | "email" | "generic" } {
  if (values.name.length === 0 || values.name.length > 100) {
    return { ok: false, error: "name" };
  }

  if (
    values.email.length > 0 &&
    (values.email.length > 200 || !EMAIL_PATTERN.test(values.email))
  ) {
    return { ok: false, error: "email" };
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
    },
  };
}
