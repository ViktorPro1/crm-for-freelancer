import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getDictionary();

  return { title: legal.privacy.metaTitle, description: legal.privacy.lead };
}

export default async function PrivacyPage() {
  const { legal } = await getDictionary();
  const { privacy } = legal;

  return (
    <LegalDocument
      title={privacy.title}
      lead={privacy.lead}
      updated={`${legal.updatedLabel}: ${legal.updatedDate}`}
      sections={privacy.sections}
      contact={legal.contact}
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">{privacy.cookieHeading}</h2>
        <p className="text-sm leading-relaxed sm:text-base">{privacy.cookieIntro}</p>

        {/* Таблиця може бути ширшою за екран телефона, тому має власну горизонтальну прокрутку. */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead className="bg-surface">
              <tr>
                {privacy.cookieColumns.map((column) => (
                  <th key={column} scope="col" className="border-b px-3 py-2 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {privacy.cookieRows.map((row) => (
                <tr key={row[0]} className="align-top">
                  {row.map((cell, index) => (
                    <td
                      key={index}
                      className={`border-b px-3 py-2 ${index === 0 ? "font-medium" : ""}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LegalDocument>
  );
}
