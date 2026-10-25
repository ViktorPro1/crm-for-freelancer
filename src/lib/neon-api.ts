// Видалення користувача Neon Auth через офіційний API Neon.
// Сервер Neon Auth не дозволяє застосунку видаляти користувача самому (відповідає 404),
// тому використовуємо API Neon: DELETE /projects/{project}/branches/{branch}/auth/users/{id}.
// Потрібні три змінні в .env.local (і на Vercel): NEON_API_KEY, NEON_PROJECT_ID, NEON_BRANCH_ID.
// Ключ дає доступ до облікового запису Neon, тому він живе лише на сервері й ніколи не потрапляє
// в браузер, у git чи в журнали.

const API_BASE = process.env.NEON_API_BASE_URL ?? "https://console.neon.tech/api/v2";

export type DeleteAuthUserResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "failed"; status?: number };

export async function deleteNeonAuthUser(
  userId: string,
): Promise<DeleteAuthUserResult> {
  const apiKey = process.env.NEON_API_KEY?.trim();
  const projectId = process.env.NEON_PROJECT_ID?.trim();
  const branchId = process.env.NEON_BRANCH_ID?.trim();

  if (!apiKey || !projectId || !branchId) {
    return { ok: false, reason: "not-configured" };
  }

  const url =
    `${API_BASE}/projects/${encodeURIComponent(projectId)}` +
    `/branches/${encodeURIComponent(branchId)}` +
    `/auth/users/${encodeURIComponent(userId)}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      cache: "no-store",
    });

    return response.ok
      ? { ok: true }
      : { ok: false, reason: "failed", status: response.status };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
