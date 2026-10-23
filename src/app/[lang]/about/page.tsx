import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getDictionary();

  return { title: legal.about.metaTitle, description: legal.about.lead };
}

export default async function AboutPage() {
  const { legal } = await getDictionary();

  return (
    <LegalDocument
      title={legal.about.title}
      lead={legal.about.lead}
      updated={`${legal.updatedLabel}: ${legal.updatedDate}`}
      sections={legal.about.sections}
      contact={legal.contact}
    />
  );
}
