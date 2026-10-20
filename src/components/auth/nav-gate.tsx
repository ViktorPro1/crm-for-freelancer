import { SidebarNav } from "@/components/sidebar-nav";
import { getUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";

// Показує меню з пунктом "Клієнти" лише тим, хто увійшов.
export async function SidebarNavGate({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { dashboard: string; clients: string };
}) {
  const user = await getUser();

  return <SidebarNav locale={locale} labels={labels} showClients={user !== null} />;
}
