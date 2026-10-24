"use client";

import { useActionState } from "react";
import {
  deleteAccountAction,
  type DeleteState,
} from "@/app/[lang]/account/actions";
import { ConfirmButton } from "@/components/clients/confirm-button";

export type DataLabels = {
  title: string;
  exportTitle: string;
  exportText: string;
  exportClients: string;
  exportNotes: string;
  deleteTitle: string;
  deleteText: string;
  deletePassword: string;
  deleteButton: string;
  deleteConfirm: string;
  deleting: string;
  deleteWrong: string;
  deleteAdmin: string;
  deleteError: string;
};

const inputClass =
  "mt-1 h-11 w-full rounded-lg border bg-surface px-3 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary";
const linkButton =
  "inline-flex h-11 items-center justify-center rounded-lg border bg-surface px-5 text-sm font-medium transition-colors hover:bg-surface-muted";

// Розділ "Мої дані": завантаження копії даних і видалення акаунта.
export function DataSection({
  locale,
  isAdmin,
  labels,
}: {
  locale: string;
  isAdmin: boolean;
  labels: DataLabels;
}) {
  const [state, action, pending] = useActionState(deleteAccountAction, null);

  return (
    <section className="rounded-2xl border bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{labels.title}</h2>

      <h3 className="mt-4 text-sm font-semibold">{labels.exportTitle}</h3>
      <p className="mt-1 text-sm text-muted">{labels.exportText}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <a
          href={`/api/export?type=clients&lang=${locale}`}
          download
          className={linkButton}
        >
          {labels.exportClients}
        </a>
        <a
          href={`/api/export?type=notes&lang=${locale}`}
          download
          className={linkButton}
        >
          {labels.exportNotes}
        </a>
      </div>

      <h3 className="mt-8 text-sm font-semibold text-red-600 dark:text-red-400">
        {labels.deleteTitle}
      </h3>
      <p className="mt-1 text-sm text-muted">{labels.deleteText}</p>

      {isAdmin ? (
        <p className="mt-3 text-sm text-muted">{labels.deleteAdmin}</p>
      ) : (
        <form action={action} className="mt-4 max-w-md space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block text-sm font-medium">
            {labels.deletePassword}
            <input
              name="password"
              type="password"
              required
              maxLength={128}
              autoComplete="current-password"
              className={inputClass}
            />
          </label>
          <DeleteMessage state={state} labels={labels} />
          <ConfirmButton
            message={labels.deleteConfirm}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-red-300 px-5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            {pending ? labels.deleting : labels.deleteButton}
          </ConfirmButton>
        </form>
      )}
    </section>
  );
}

function DeleteMessage({
  state,
  labels,
}: {
  state: DeleteState;
  labels: DataLabels;
}) {
  if (!state) {
    return null;
  }

  const text =
    state.result === "wrong"
      ? labels.deleteWrong
      : state.result === "admin"
        ? labels.deleteAdmin
        : labels.deleteError;

  return (
    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
      {text}
    </p>
  );
}
