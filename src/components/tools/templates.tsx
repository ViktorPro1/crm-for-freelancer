"use client";

import { useState } from "react";

export type TemplateLabels = {
  title: string;
  lead: string;
  open: string;
  copy: string;
  copied: string;
  copyFailed: string;
  disclaimer: string;
  items: { id: string; title: string; description: string; text: string }[];
};

// Копіює текст у буфер обміну. Якщо браузер не дає доступу до буфера
// (наприклад, сторінка відкрита не через https), пробуємо старий спосіб через приховане поле.
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function Templates({ labels }: { labels: TemplateLabels }) {
  // Який шаблон щойно скопіювали і з яким результатом: для підказки біля кнопки.
  const [status, setStatus] = useState<{
    id: string;
    ok: boolean;
  } | null>(null);

  async function handleCopy(id: string, text: string) {
    const ok = await copyText(text);
    setStatus({ id, ok });
    window.setTimeout(() => setStatus(null), 2500);
  }

  return (
    <section aria-labelledby="templates-title">
      <h2
        id="templates-title"
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {labels.title}
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
        {labels.lead}
      </p>

      <ul className="mt-6 grid gap-4 lg:grid-cols-2">
        {labels.items.map((item) => {
          const mine = status?.id === item.id ? status : null;

          return (
            <li
              key={item.id}
              className="rounded-2xl border bg-surface p-5 sm:p-6"
            >
              <h3 className="text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{item.description}</p>

              <details className="group mt-4">
                <summary className="cursor-pointer text-sm font-medium text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary">
                  {labels.open}
                </summary>
                <pre
                  tabIndex={0}
                  className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-surface-muted p-4 font-sans text-sm leading-relaxed outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {item.text}
                </pre>
              </details>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.text)}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  {labels.copy}
                </button>
                <span
                  role="status"
                  className={`text-sm ${mine && !mine.ok ? "text-red-600 dark:text-red-400" : "text-muted"}`}
                >
                  {mine ? (mine.ok ? labels.copied : labels.copyFailed) : ""}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 max-w-2xl text-sm text-muted">{labels.disclaimer}</p>
    </section>
  );
}
