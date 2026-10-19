"use client";

// Клієнтський компонент, бо йому потрібно знати, на якій сторінці
// зараз користувач (usePathname), щоб підсвітити активний пункт меню.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardIcon, UsersIcon } from "@/components/icons";

const links = [
  { href: "/", label: "Дашборд", Icon: DashboardIcon },
  { href: "/clients", label: "Клієнти", Icon: UsersIcon },
];

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    // На телефоні пункти йдуть у рядок, на великому екрані стовпчиком.
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {links.map(({ href, label, Icon }) => {
        const isActive =
          pathname !== null &&
          (href === "/" ? pathname === "/" : pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
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
export function SidebarNav() {
  const pathname = usePathname();

  return <NavLinks pathname={pathname} />;
}

// Запасний варіант, який показується на мить, поки Next.js визначає адресу
// сторінки (наприклад, /clients/7). Це те саме меню, тільки без підсвітки.
export function SidebarNavFallback() {
  return <NavLinks pathname={null} />;
}
