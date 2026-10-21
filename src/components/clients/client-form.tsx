"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createClientAction,
  type ClientFormState,
} from "@/app/[lang]/clients/actions";

type Props = {
  locale: string;
  cancelHref: string;
  labels: {
    name: string;
    company: string;
    email: string;
    status: string;
    notes: string;
    submit: string;
    saving: string;
    cancel: string;
    statusLead: string;
    statusActive: string;
    errors: { name: string; email: string; generic: string };
  };
};

const inputClass =
  "mt-1 w-full rounded-lg border bg-surface px-3 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary";

export function ClientForm({ locale, cancelHref, labels }: Props) {
  const [state, action, pending] = useActionState<ClientFormState, FormData>(
    createClientAction,
    null,
  );
  const values = state?.values;

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="locale" value={locale} />

      <label className="block text-sm font-medium">
        {labels.name}
        <input
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={values?.name}
          className={`${inputClass} h-11`}
        />
      </label>

      <label className="block text-sm font-medium">
        {labels.company}
        <input
          name="company"
          type="text"
          maxLength={100}
          defaultValue={values?.company}
          className={`${inputClass} h-11`}
        />
      </label>

      <label className="block text-sm font-medium">
        {labels.email}
        <input
          name="email"
          type="email"
          maxLength={200}
          defaultValue={values?.email}
          className={`${inputClass} h-11`}
        />
      </label>

      <label className="block text-sm font-medium">
        {labels.status}
        <select
          name="status"
          defaultValue={values?.status ?? "lead"}
          className={`${inputClass} h-11`}
        >
          <option value="lead">{labels.statusLead}</option>
          <option value="active">{labels.statusActive}</option>
        </select>
      </label>

      <label className="block text-sm font-medium">
        {labels.notes}
        <textarea
          name="notes"
          rows={4}
          maxLength={2000}
          defaultValue={values?.notes}
          className={`${inputClass} py-2`}
        />
      </label>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {labels.errors[state.error]}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? labels.saving : labels.submit}
        </button>
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center justify-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-surface-muted"
        >
          {labels.cancel}
        </Link>
      </div>
    </form>
  );
}
