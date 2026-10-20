import Link from "next/link";
import { LoginIcon, LogoutIcon } from "@/components/icons";
import { getUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";
import { signOutAction } from "./actions";

const buttonClass =
  "grid size-10 shrink-0 place-items-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-active focus-visible:outline-sidebar-ring";

type Props = { locale: Locale; signInLabel: string; signOutLabel: string };

// Кнопка поруч із перемикачем теми: "Вхід" для гостя і "Вийти" для користувача.
// Серверний компонент, бо стан входу читається з cookie.
export async function AuthButton({ locale, signInLabel, signOutLabel }: Props) {
  const user = await getUser();

  if (!user) {
    return (
      <Link
        href={`/${locale}/sign-in`}
        aria-label={signInLabel}
        title={signInLabel}
        className={buttonClass}
      >
        <LoginIcon className="size-5" />
      </Link>
    );
  }

  return (
    <form action={signOutAction}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        aria-label={signOutLabel}
        title={signOutLabel}
        className={buttonClass}
      >
        <LogoutIcon className="size-5" />
      </button>
    </form>
  );
}

// Місце під кнопку, поки йде перевірка входу (щоб панель не стрибала).
export function AuthButtonFallback() {
  return <span className="size-10 shrink-0" aria-hidden="true" />;
}
