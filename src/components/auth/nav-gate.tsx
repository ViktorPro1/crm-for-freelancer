import { SidebarNav } from "@/components/sidebar-nav";
import { canUseCrm, getAccess } from "@/lib/auth/session";
import { getDueSummary } from "@/lib/clients";
import type { Locale } from "@/lib/i18n/config";

// Показує меню з пунктом "Клієнти" лише тим, чию заявку схвалено.
export async function SidebarNavGate({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    dashboard: string;
    tools: string;
    subscription: string;
    mobileApp: string;
    clients: string;
    calendar: string;
    account: string;
    admin: string;
    more: string;
  };
}) {
  const access = await getAccess();
  const crm = canUseCrm(access);
  // Кому дозволено працювати з CRM, тому порахуємо нагадування для кружечка біля "Календар".
  const calendarDue =
    crm && access.kind === "member"
      ? await getDueSummary(access.user.id, locale)
      : undefined;

  return (
    <SidebarNav
      locale={locale}
      labels={labels}
      showClients={crm}
      calendarDue={calendarDue}
      showAdmin={access.kind === "member" && access.isAdmin}
    />
  );
}
