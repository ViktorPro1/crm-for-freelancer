import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { ClientForm } from "@/components/clients/client-form";
import { requireApproved } from "@/lib/auth/session";
import { getClient } from "@/lib/clients";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { updateClientAction } from "../../actions";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.clients.edit.title };
}

export default async function EditClientPage({
  params,
}: PageProps<"/[lang]/clients/[id]/edit">) {
  const dict = await getDictionary();

  return (
    <main className="mx-auto max-w-xl p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {dict.clients.edit.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{dict.clients.edit.subtitle}</p>

      <Suspense
        fallback={<p className="mt-6 text-sm text-muted">{dict.clients.loading}</p>}
      >
        <EditForm params={params} />
      </Suspense>
    </main>
  );
}

// Чужого клієнта відкрити не можна: getClient повертає лише дозволених, інакше "не знайдено".
async function EditForm({
  params,
}: Pick<PageProps<"/[lang]/clients/[id]/edit">, "params">) {
  const { id } = await params;
  const locale = await getLocale();
  const access = await requireApproved(locale);
  const { clients, status } = await getDictionary();

  const client = await getClient(id, {
    userId: access.user.id,
    isAdmin: access.isAdmin,
  });

  if (!client) {
    notFound();
  }

  const e = clients.edit;
  const cancelHref = `/${locale}/clients/${client.id}`;

  return (
    <>
      <Link
        href={cancelHref}
        className="-ml-1 mt-4 inline-flex items-center gap-1 rounded-md text-sm text-muted transition-colors hover:text-primary"
      >
        <ChevronLeftIcon className="size-4" />
        {e.backToClient}
      </Link>
      <ClientForm
        action={updateClientAction}
        locale={locale}
        cancelHref={cancelHref}
        clientId={client.id}
        showStatus={client.status !== "archived"}
        initial={{
          name: client.name,
          company: client.company,
          email: client.email,
          status: client.status,
          notes: client.notes,
        }}
        labels={{
          name: clients.new.name,
          company: clients.new.company,
          email: clients.new.email,
          status: clients.new.status,
          notes: clients.new.notes,
          submit: e.submit,
          saving: clients.new.saving,
          cancel: clients.new.cancel,
          statusLead: status.lead,
          statusActive: status.active,
          errors: clients.new.errors,
        }}
      />
    </>
  );
}
