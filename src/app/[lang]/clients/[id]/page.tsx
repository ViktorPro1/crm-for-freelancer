import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { ConfirmButton } from "@/components/clients/confirm-button";
import { LocalTime } from "@/components/clients/local-time";
import { StatusBadge } from "@/components/status-badge";
import { requireApproved } from "@/lib/auth/session";
import { getClient } from "@/lib/clients";
import { formatDate } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { getNotes, NOTE_MAX_LENGTH } from "@/lib/notes";
import {
  addNoteAction,
  archiveClientAction,
  deleteNoteAction,
  deleteClientAction,
  restoreClientAction,
} from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.clients.detailMetaTitle };
}

const primaryButton =
  "inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover";
const secondaryButton =
  "inline-flex h-11 items-center justify-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-surface-muted";
const dangerButton =
  "inline-flex h-11 items-center justify-center rounded-lg border border-red-300 px-5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10";

// Папка [id] означає, що частина адреси змінна: /uk/clients/1, /uk/clients/2 і так далі.
// Посилання "Усі клієнти" показується одразу, а дані клієнта дозавантажуються.
export default async function ClientPage({
  params,
}: PageProps<"/[lang]/clients/[id]">) {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <Link
        href={`/${locale}/clients`}
        className="-ml-1 inline-flex items-center gap-1 rounded-md text-sm text-muted transition-colors hover:text-primary"
      >
        <ChevronLeftIcon className="size-4" />
        {dict.clients.back}
      </Link>

      <Suspense
        fallback={<p className="mt-6 text-sm text-muted">{dict.clients.loading}</p>}
      >
        <ClientDetails params={params} />
      </Suspense>
    </main>
  );
}

async function ClientDetails({
  params,
}: Pick<PageProps<"/[lang]/clients/[id]">, "params">) {
  // params містить змінну частину адреси. У Next.js 16 його треба чекати через await.
  const { id } = await params;
  const locale = await getLocale();
  const access = await requireApproved(locale);
  const dict = await getDictionary();
  const viewer = { userId: access.user.id, isAdmin: access.isAdmin };
  const client = await getClient(id, viewer);

  // Якщо клієнта з таким id немає, показуємо сторінку "не знайдено" (not-found.tsx).
  if (!client) {
    notFound();
  }

  const notes = await getNotes(client.id, viewer);
  const journal = dict.clients.journal;

  const rows = [
    { label: dict.clients.fieldEmail, value: client.email },
    { label: dict.clients.fieldAdded, value: formatDate(client.createdAt, locale) },
    { label: dict.clients.fieldNotes, value: client.notes },
    // Власника бачить лише адміністратор.
    ...(client.ownerLabel
      ? [{ label: dict.clients.colOwner, value: client.ownerLabel }]
      : []),
  ];

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {client.name}
        </h1>
        <StatusBadge
          status={client.status}
          label={dict.status[client.status]}
        />
      </div>
      <p className="mt-1 text-muted">{client.company}</p>

      {client.status === "archived" ? (
        <p className="mt-4 rounded-lg bg-neutral-bg px-4 py-3 text-sm text-neutral-fg">
          {dict.clients.archivedNote}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/${locale}/clients/${client.id}/edit`} className={primaryButton}>
          {dict.clients.edit.button}
        </Link>

        {client.status === "archived" ? (
          <>
            <form action={restoreClientAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="id" value={client.id} />
              <button type="submit" className={secondaryButton}>
                {dict.clients.restore}
              </button>
            </form>
            <form action={deleteClientAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="id" value={client.id} />
              <ConfirmButton
                message={dict.clients.confirmDelete}
                className={dangerButton}
              >
                {dict.clients.deleteForever}
              </ConfirmButton>
            </form>
          </>
        ) : (
          <form action={archiveClientAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={client.id} />
            <button type="submit" className={secondaryButton}>
              {dict.clients.archive}
            </button>
          </form>
        )}
      </div>

      <dl className="mt-6 divide-y rounded-xl border bg-surface text-sm">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
          >
            <dt className="text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {/* Щоденник: записи з датою, найновіші зверху. */}
      <section className="mt-8" aria-labelledby="journal-title">
        <h2 id="journal-title" className="text-xl font-semibold tracking-tight">
          {journal.title}
        </h2>
        <p className="mt-1 text-sm text-muted">{journal.hint}</p>

        {client.status === "archived" ? (
          <p className="mt-4 text-sm text-muted">{journal.archivedHint}</p>
        ) : (
          <form action={addNoteAction} className="mt-4 space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="clientId" value={client.id} />
            <textarea
              name="body"
              rows={3}
              required
              maxLength={NOTE_MAX_LENGTH}
              placeholder={journal.placeholder}
              aria-label={journal.label}
              className="w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
            />
            <button type="submit" className={primaryButton}>
              {journal.add}
            </button>
          </form>
        )}

        {notes.length === 0 ? (
          <p className="mt-6 text-sm text-muted">{journal.empty}</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl border bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    <LocalTime iso={note.createdAt} locale={locale} />
                  </span>
                  <form action={deleteNoteAction}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="noteId" value={note.id} />
                    <ConfirmButton
                      message={journal.confirmDelete}
                      className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:text-red-700 dark:hover:text-red-400"
                    >
                      {journal.delete}
                    </ConfirmButton>
                  </form>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                  {note.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
