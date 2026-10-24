import { getExportClients, getExportNotes } from "@/lib/account-data";
import { getUser } from "@/lib/auth/session";
import { buildCsv } from "@/lib/csv";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { getDictionaryFor } from "@/lib/i18n/dictionaries";

// Завантаження власних даних у CSV: /api/export?type=clients або type=notes (&lang=uk).
// Доступно кожному, хто увійшов (також після закінчення підписки): це право на копію даних.
// Віддаємо лише дані самого користувача, id береться з сесії, а не з адреси.
export async function GET(request: Request) {
  const user = await getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const type = params.get("type");
  const rawLang = params.get("lang") ?? "";
  const locale = hasLocale(rawLang) ? rawLang : defaultLocale;
  const { account, status } = await getDictionaryFor(locale);
  const today = new Date().toISOString().slice(0, 10);

  let csv: string;

  if (type === "clients") {
    const clients = await getExportClients(user.id);

    csv = buildCsv(
      account.data.csvClients,
      clients.map((c) => [
        c.id,
        c.name,
        c.company,
        c.email,
        status[c.status],
        c.createdAt,
        c.notes,
      ]),
    );
  } else if (type === "notes") {
    const notes = await getExportNotes(user.id);

    csv = buildCsv(
      account.data.csvNotes,
      notes.map((n) => [n.clientId, n.clientName, n.createdAt, n.body]),
    );
  } else {
    return new Response("Bad request", { status: 400 });
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="freelancecrm-${type}-${today}.csv"`,
      // Особисті дані: не кешувати ні в браузері, ні на проміжних серверах.
      "Cache-Control": "private, no-store",
    },
  });
}
