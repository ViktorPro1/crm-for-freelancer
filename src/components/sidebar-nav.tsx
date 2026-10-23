"use client";

// Клієнтський компонент, бо йому потрібно знати, на якій сторінці
// зараз користувач (usePathname), щоб підсвітити активний пункт меню.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CardIcon,
  DashboardIcon,
  PhoneIcon,
  ShieldIcon,
  ToolsIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  locale: Locale;
  labels: {
    dashboard: string;
    tools: string;
    subscription: string;
    mobileApp: string;
    clients: string;
    account: string;
    admin: string;
  };
  // Пункт "Клієнти" бачить лише той, кому дозволено працювати з CRM.
  showClients: boolean;
  // Пункт "Адмінка" бачить лише адміністратор.
  showAdmin?: boolean;
};

function NavLinks({
  locale,
  labels,
  showClients,
  showAdmin = false,
  pathname,
}: Props & { pathname: string | null }) {
  // Адреса в браузері виглядає як /uk/clients/3. Відрізаємо мову, щоб порівнювати "/clients/3".
  const path = pathname === null ? null : pathname.slice(locale.length + 1) || "/";

  const links = [
    { href: "/", label: labels.dashboard, Icon: DashboardIcon },
    // Інструменти відкриті для всіх, навіть для гостей.
    { href: "/tools", label: labels.tools, Icon: ToolsIcon },
    // Сторінка підписки теж відкрита для всіх: там ціна і порядок оплати.
    { href: "/subscription", label: labels.subscription, Icon: CardIcon },
    // Сторінка із застосунком для телефона теж відкрита для всіх.
    { href: "/mobile-app", label: labels.mobileApp, Icon: PhoneIcon },
    ...(showClients
      ? [{ href: "/clients", label: labels.clients, Icon: UsersIcon }]
      : []),
    ...(showClients
      ? [{ href: "/account", label: labels.account, Icon: UserIcon }]
      : []),
    ...(showAdmin
      ? [{ href: "/admin", label: labels.admin, Icon: ShieldIcon }]
      : []),
  ];

  return (
    // На телефоні пункти йдуть у рядок, на великому екрані стовпчиком.
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {links.map(({ href, label, Icon }) => {
        const isActive =
          path !== null && (href === "/" ? path === "/" : path.startsWith(href));

        return (
          <Link
            key={href}
            href={href === "/" ? `/${locale}` : `/${locale}${href}`}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-sidebar-ring ${
              isActive
                ? "bg-sidebar-active font-medium text-white"
                : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-white"
            }`}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Меню з підсвіткою активного пункту.
export function SidebarNav(props: Props) {
  const pathname = usePathname();

  return <NavLinks {...props} pathname={pathname} />;
}

// Запасний варіант, який показується на мить, поки Next.js визначає адресу
// сторінки (наприклад, /uk/clients/7). Це те саме меню, тільки без підсвітки.
export function SidebarNavFallback(props: Props) {
  return <NavLinks {...props} pathname={null} />;
}
