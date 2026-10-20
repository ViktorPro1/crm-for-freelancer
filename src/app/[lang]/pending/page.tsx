import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOutAction } from "@/components/auth/actions";
import { getAccess } from "@/lib/auth/session";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.pending.title };
}

export default function PendingPage() {
  return (
    <Suspense fallback={null}>
      <PendingModal />
    </Suspense>
  );
}

// Вікно зі статусом заявки. Гостя відправляє на вхід, схваленого на головну.
async function PendingModal() {
  const locale = await getLocale();
  const { pending } = await getDictionary();
  const access = await getAccess();

  if (access.kind === "guest") {
    redirect(`/${locale}/sign-in`);
  }

  if (access.status === "approved") {
    redirect(`/${locale}`);
  }

  const rejected = access.status === "rejected";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-title"
        className="w-full max-w-md rounded-2xl border bg-surface p-6 shadow-xl sm:p-8"
      >
        <h1 id="pending-title" className="text-xl font-semibold tracking-tight">
          {rejected ? pending.rejectedTitle : pending.title}
        </h1>
        <p className="mt-3 text-muted">
          {rejected ? pending.rejectedText : pending.text}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/${locale}`}
            className="inline-flex h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {pending.home}
          </Link>
          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-surface-muted"
            >
              {pending.signOut}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
