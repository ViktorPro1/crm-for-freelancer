"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

type Props = {
  mode: "signIn" | "signUp";
  locale: string;
  action: (previous: AuthState, formData: FormData) => Promise<AuthState>;
  labels: {
    name: string;
    email: string;
    password: string;
    submit: string;
    pending: string;
    switchText: string;
    switchLink: string;
    errors: { generic: string; invalid: string; emailTaken: string };
  };
  switchHref: string;
};

const inputClass =
  "mt-1 h-11 w-full rounded-lg border bg-surface px-3 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary";

// Спільна форма для входу й реєстрації. Різниця лише в полі "Ім'я" та в дії.
export function AuthForm({ mode, locale, action, labels, switchHref }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="locale" value={locale} />

      {mode === "signUp" ? (
        <label className="block text-sm font-medium">
          {labels.name}
          <input
            name="name"
            defaultValue={state?.values.name}
            type="text"
            required
            autoComplete="name"
            className={inputClass}
          />
        </label>
      ) : null}

      <label className="block text-sm font-medium">
        {labels.email}
        <input
          name="email"
          defaultValue={state?.values.email}
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium">
        {labels.password}
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signUp" ? "new-password" : "current-password"}
          className={inputClass}
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

      <p className="text-center text-sm text-muted">
        {labels.switchText}{" "}
        <Link href={switchHref} className="text-primary underline-offset-4 hover:underline">
          {labels.switchLink}
        </Link>
      </p>
    </form>
  );
}
