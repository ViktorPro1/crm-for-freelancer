import type { ReactNode } from "react";
import { GITHUB_URL, SUPPORT_EMAIL } from "@/lib/site";

export type LegalSection = { heading: string; paragraphs: string[]; items: string[] };

type Props = {
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
  contact: { title: string; email: string; github: string };
  // Місце для додаткового блоку, наприклад таблиці cookie, між розділами й контактами.
  children?: ReactNode;
};

// Спільний вигляд для сторінок «Про проект», «Умови» й «Конфіденційність».
export function LegalDocument({ title, lead, updated, sections, contact, children }: Props) {
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-4 sm:p-8 lg:py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{lead}</p>
        {updated ? <p className="mt-3 text-sm text-muted">{updated}</p> : null}
      </header>

      {sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed sm:text-base">
              {paragraph}
            </p>
          ))}
          {section.items.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed sm:text-base">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      {children}

      <section className="space-y-2 rounded-2xl border bg-surface p-6">
        <h2 className="text-lg font-semibold">{contact.title}</h2>
        <p className="text-sm leading-relaxed">
          {SUPPORT_EMAIL ? (
            <>
              {contact.email}{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </>
          ) : (
            <>
              {contact.github}{" "}
              <a
                href={GITHUB_URL}
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {GITHUB_URL.replace("https://", "")}
              </a>
            </>
          )}
        </p>
      </section>
    </main>
  );
}
