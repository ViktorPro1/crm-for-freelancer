import { SidebarNav } from "@/components/sidebar-nav";
import { canUseCrm, getAccess } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";

// Показує меню з пунктом "Клієнти" лише тим, чию заявку схвалено.
export async function SidebarNavGate({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    dashboard: string;
    clients: string;
    account: string;
    admin: string;
  };
}) {
  const access = await getAccess();

  return (
    <SidebarNav
      locale={locale}
      labels={labels}
      showClients={canUseCrm(access)}
      showAdmin={access.kind === "member" && access.isAdmin}
    />
  );
}
