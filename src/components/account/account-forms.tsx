"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateNameAction,
  type AccountState,
} from "@/app/[lang]/account/actions";

type Labels = {
  nameTitle: string;
  nameLabel: string;
  nameSave: string;
  nameSaved: string;
  passwordTitle: string;
  currentPassword: string;
  newPassword: string;
  passwordSave: string;
  passwordSaved: string;
  passwordWrong: string;
  error: string;
  saving: string;
};

const inputClass =
  "mt-1 h-11 w-full rounded-lg border bg-surface px-3 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary";
const buttonClass =
  "inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60";

function Message({
  state,
  labels,
  savedText,
}: {
  state: AccountState;
  labels: Labels;
  savedText: string;
}) {
  if (!state) {
    return null;
  }

  const text =
    state.result === "saved"
      ? savedText
      : state.result === "wrong"
        ? labels.passwordWrong
        : labels.error;

  return (
    <p
      role="status"
      className={`text-sm ${
        state.result === "saved"
          ? "text-success-fg"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {text}
    </p>
  );
}

export function NameForm({
  locale,
  currentName,
  labels,
}: {
  locale: string;
  currentName: string;
  labels: Labels;
}) {
  const [state, action, pending] = useActionState(updateNameAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <label className="block text-sm font-medium">
        {labels.nameLabel}
        <input
          name="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          defaultValue={state?.name ?? currentName}
          className={inputClass}
        />
      </label>
      <Message state={state} labels={labels} savedText={labels.nameSaved} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? labels.saving : labels.nameSave}
      </button>
    </form>
  );
}

export function PasswordForm({
  locale,
  labels,
}: {
  locale: string;
  labels: Labels;
}) {
  const [state, action, pending] = useActionState(changePasswordAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <label className="block text-sm font-medium">
        {labels.currentPassword}
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium">
        {labels.newPassword}
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <Message state={state} labels={labels} savedText={labels.passwordSaved} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? labels.saving : labels.passwordSave}
      </button>
    </form>
  );
}
