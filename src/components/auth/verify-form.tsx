"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { resendCodeAction, verifyEmailAction } from "./actions";

type Props = {
  locale: string;
  email: string;
  labels: {
    codeLabel: string;
    submit: string;
    pending: string;
    resend: string;
    resendIn: string; // містить {seconds}
    resent: string;
    back: string;
    errors: { invalid: string; tooMany: string; generic: string; resendFailed: string };
  };
  backHref: string;
};

const COOLDOWN_SECONDS = 60;

// Форма введення коду з листа й кнопка "Надіслати ще раз" із паузою,
// щоб не можна було засипати пошту листами.
export function VerifyForm({ locale, email, labels, backHref }: Props) {
  const [state, formAction, isPending] = useActionState(verifyEmailAction, null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendResult, setResendResult] = useState<"sent" | "error" | null>(null);
  const [isResending, startResend] = useTransition();

  // Відлік паузи: щосекунди зменшуємо лічильник, поки він не дійде до нуля.
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  function handleResend() {
    startResend(async () => {
      const result = await resendCodeAction(email);
      setResendResult(result);

      if (result === "sent") {
        setSecondsLeft(COOLDOWN_SECONDS);
      }
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="email" value={email} />

        <label className="block text-sm font-medium">
          {labels.codeLabel}
          <input
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9 ]*"
            autoComplete="one-time-code"
            required
            minLength={4}
            maxLength={12}
            className="mt-1 h-12 w-full rounded-lg border bg-surface px-3 text-center text-xl font-semibold tracking-[0.4em] outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
          />
        </label>

        {state?.error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {labels.errors[state.error]}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? labels.pending : labels.submit}
        </button>
      </form>

      <div className="space-y-2 text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0 || isResending}
          className="rounded-md px-2 py-1 font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          {secondsLeft > 0
            ? labels.resendIn.replace("{seconds}", String(secondsLeft))
            : labels.resend}
        </button>

        <p role="status" className="min-h-5 text-muted">
          {resendResult === "sent" ? labels.resent : ""}
          {resendResult === "error" ? (
            <span className="text-red-600 dark:text-red-400">
              {labels.errors.resendFailed}
            </span>
          ) : null}
        </p>

        <p>
          <Link href={backHref} className="text-muted underline-offset-4 hover:underline">
            {labels.back}
          </Link>
        </p>
      </div>
    </div>
  );
}
