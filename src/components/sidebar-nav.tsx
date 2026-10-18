"use client";

// Клієнтський компонент, бо йому потрібно знати, на якій сторінці
// зараз користувач (usePathname), щоб підсвітити активний пункт меню.

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Дашборд" },
  { href: "/clients", label: "Клієнти" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 md:flex-col">
      {links.map(({ href, label }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-black/10 font-medium dark:bg-white/15"
                : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
