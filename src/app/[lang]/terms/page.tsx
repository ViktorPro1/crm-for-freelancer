import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getDictionary();

  return { title: legal.terms.metaTitle, description: legal.terms.lead };
}

export default async function TermsPage() {
  const { legal } = await getDictionary();

  return (
    <LegalDocument
      title={legal.terms.title}
      lead={legal.terms.lead}
      updated={`${legal.updatedLabel}: ${legal.updatedDate}`}
      sections={legal.terms.sections}
      contact={legal.contact}
    />
  );
}
