"use client";

// Клієнтський компонент, бо йому потрібно знати, на якій сторінці
// зараз користувач (usePathname), щоб підсвітити активний пункт меню,
// і пам'ятати, відкрито меню "Ще" чи ні.
//
// На великому екрані це бічне меню (стовпчик). На телефоні це нижня панель:
// чотири головні розділи й кнопка "Ще" з рештою. Якщо розділів п'ять чи менше,
// усі вони стоять у панелі й кнопка "Ще" не потрібна.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  CalendarIcon,
  CardIcon,
  DashboardIcon,
  MenuIcon,
  PhoneIcon,
  ShieldIcon,
  ToolsIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { readCalendarSeen, subscribeCalendarSeen } from "@/lib/calendar-seen";
import type { Locale } from "@/lib/i18n/config";

type Props = {
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
  // Пункт "Клієнти" бачить лише той, кому дозволено працювати з CRM.
  showClients: boolean;
  // Пункт "Адмінка" бачить лише адміністратор.
  showAdmin?: boolean;
  // Скільки клієнтів потребують уваги (прострочені й на сьогодні) і відбиток цього набору.
  // Червоний кружечок біля "Календар" показується, поки людина не відкрила календар.
  calendarDue?: { count: number; signature: string };
};

// У нижній панелі стоять не більше чотирьох пунктів плюс "Ще".
const MAX_IN_BAR = 4;

type NavItem = {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactNode;
};

// Скільки показувати в кружечку біля "Календар": 0, якщо нічого не потребує уваги
// або людина вже бачила цей набір. До завантаження сторінки в браузері кружечка немає,
// щоб він не блимав у тих, хто вже все переглянув.
function useCalendarBadge(due: Props["calendarDue"]): number {
  const seen = useSyncExternalStore(
    subscribeCalendarSeen,
    readCalendarSeen,
    () => undefined,
  );

  if (!due || due.count === 0 || seen === undefined || seen === due.signature) {
    return 0;
  }

  return due.count;
}

// Червоний кружечок із числом.
function Badge({
  count,
  className,
  small = false,
}: {
  count: number | undefined;
  className?: string;
  small?: boolean;
}) {
  if (!count) {
    return null;
  }

  return (
    <span
      className={`grid place-items-center rounded-full bg-red-500 font-semibold leading-none text-white ${
        small ? "h-4 min-w-4 px-1 text-[10px]" : "h-5 min-w-5 px-1.5 text-xs"
      } ${className ?? ""}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavLinks({
  locale,
  labels,
  showClients,
  showAdmin = false,
  calendarDue,
  pathname,
}: Props & { pathname: string | null }) {
  const calendarBadge = useCalendarBadge(calendarDue);
  const badges: Record<string, number> = { "/calendar": calendarBadge };

  // Адреса в браузері виглядає як /uk/clients/3. Відрізаємо мову, щоб порівнювати "/clients/3".
  const path = pathname === null ? null : pathname.slice(locale.length + 1) || "/";

  const links: NavItem[] = [
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
      ? [{ href: "/calendar", label: labels.calendar, Icon: CalendarIcon }]
      : []),
    ...(showClients
      ? [{ href: "/account", label: labels.account, Icon: UserIcon }]
      : []),
    ...(showAdmin
      ? [{ href: "/admin", label: labels.admin, Icon: ShieldIcon }]
      : []),
  ];

  const isActive = (href: string) =>
    path !== null && (href === "/" ? path === "/" : path.startsWith(href));
  const hrefOf = (href: string) =>
    href === "/" ? `/${locale}` : `/${locale}${href}`;

  return (
    <>
      {/* Великий екран: бічне меню стовпчиком. */}
      <nav className="hidden gap-1 md:flex md:flex-col">
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={hrefOf(href)}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-sidebar-ring ${
              isActive(href)
                ? "bg-sidebar-active font-medium text-white"
                : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-white"
            }`}
          >
            <Icon className="size-5 shrink-0" />
            {label}
            <Badge count={badges[href]} className="ml-auto" />
          </Link>
        ))}
      </nav>

      {/* Телефон: нижня панель. */}
      <MobileBar
        links={links}
        showClients={showClients}
        moreLabel={labels.more}
        badges={badges}
        pathname={pathname}
        isActive={isActive}
        hrefOf={hrefOf}
      />
    </>
  );
}

// Порядок на телефоні: для того, хто працює з CRM, спершу найпотрібніше
// (клієнти, календар, інструменти, кабінет), решта йде в "Ще". Для гостя порядок звичайний.
const CRM_PRIORITY = ["/clients", "/calendar", "/tools", "/account"];

function MobileBar({
  links,
  showClients,
  moreLabel,
  badges,
  pathname,
  isActive,
  hrefOf,
}: {
  links: NavItem[];
  showClients: boolean;
  moreLabel: string;
  badges: Record<string, number>;
  pathname: string | null;
  isActive: (href: string) => boolean;
  hrefOf: (href: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const moreButton = useRef<HTMLButtonElement>(null);

  // Після переходу на іншу сторінку меню "Ще" закривається.
  if (pathname !== openedAt) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  // Escape закриває меню й повертає фокус на кнопку "Ще".
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        moreButton.current?.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const ordered = showClients
    ? [...links].sort((a, b) => {
        const rank = (href: string) => {
          const index = CRM_PRIORITY.indexOf(href);

          return index === -1 ? CRM_PRIORITY.length : index;
        };

        return rank(a.href) - rank(b.href);
      })
    : links;

  const needsMore = ordered.length > MAX_IN_BAR + 1;
  const inBar = needsMore ? ordered.slice(0, MAX_IN_BAR) : ordered;
  const inMore = needsMore ? ordered.slice(MAX_IN_BAR) : [];
  const moreActive = inMore.some((item) => isActive(item.href));
  const moreBadge = inMore.reduce((sum, item) => sum + (badges[item.href] ?? 0), 0);

  const itemBase =
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-tight transition-colors focus-visible:outline-sidebar-ring";

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      ) : null}

      {open ? (
        <ul
          id="mobile-more-menu"
          className="fixed inset-x-3 bottom-[4.5rem] z-50 rounded-2xl bg-sidebar p-2 text-sidebar-foreground shadow-lg md:hidden"
        >
          {inMore.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={hrefOf(href)}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors focus-visible:outline-sidebar-ring ${
                  isActive(href)
                    ? "bg-sidebar-active font-medium text-white"
                    : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-white"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                {label}
                <Badge count={badges[href]} className="ml-auto" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t border-white/10 bg-sidebar text-sidebar-foreground md:hidden">
        {inBar.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={hrefOf(href)}
            aria-current={isActive(href) ? "page" : undefined}
            className={`${itemBase} ${
              isActive(href) ? "font-medium text-white" : "text-sidebar-muted"
            }`}
          >
            <span className="relative">
              <Icon className="size-6 shrink-0" />
              <Badge count={badges[href]} className="absolute -right-2.5 -top-1.5" small />
            </span>
            <span className="max-w-full truncate">{label}</span>
          </Link>
        ))}
        {needsMore ? (
          <button
            ref={moreButton}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-more-menu"
            onClick={() => setOpen((value) => !value)}
            className={`${itemBase} ${
              open || moreActive ? "font-medium text-white" : "text-sidebar-muted"
            }`}
          >
            <span className="relative">
              <MenuIcon className="size-6 shrink-0" />
              <Badge count={moreBadge} className="absolute -right-2.5 -top-1.5" small />
            </span>
            <span className="max-w-full truncate">{moreLabel}</span>
          </button>
        ) : null}
      </nav>
    </>
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
