"use client";

import { useId, useState } from "react";
import {
  calculateProject,
  calculateRate,
  clampTax,
  CURRENCIES,
  DEFAULT_AMOUNTS,
  DEFAULT_CURRENCY,
  formatHours,
  formatMoney,
  parseAmount,
  type Currency,
} from "@/lib/calculator";
import type { Locale } from "@/lib/i18n/config";

// Підписи беруться зі словника сторінки, тому типи описані тут вручну.
export type CalculatorLabels = {
  currency: string;
  project: {
    title: string;
    lead: string;
    hours: string;
    rate: string;
    revisions: string;
    revisionsHint: string;
    buffer: string;
    bufferHint: string;
    tax: string;
    resultPrice: string;
    resultNet: string;
    resultHours: string;
    resultReal: string;
    empty: string;
  };
  rate: {
    title: string;
    lead: string;
    income: string;
    expenses: string;
    hours: string;
    hoursHint: string;
    tax: string;
    resultRate: string;
    resultRevenue: string;
    empty: string;
  };
};

const inputClass =
  "mt-1 h-11 w-full rounded-lg border bg-surface px-3 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary";

function Field({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={inputClass}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Result({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd
        className={
          strong
            ? "text-2xl font-semibold tracking-tight text-primary"
            : "text-sm font-medium"
        }
      >
        {value}
      </dd>
    </div>
  );
}

const cardClass = "rounded-2xl border bg-surface p-5 sm:p-6";

export function Calculators({
  locale,
  labels,
}: {
  locale: Locale;
  labels: CalculatorLabels;
}) {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY[locale]);
  const defaults = DEFAULT_AMOUNTS[DEFAULT_CURRENCY[locale]];

  // Калькулятор проєкту.
  const [hours, setHours] = useState("40");
  const [rate, setRate] = useState(String(defaults.rate));
  const [rounds, setRounds] = useState("2");
  const [buffer, setBuffer] = useState("15");
  const [projectTax, setProjectTax] = useState("5");

  // Калькулятор ставки.
  const [income, setIncome] = useState(String(defaults.income));
  const [expenses, setExpenses] = useState(String(defaults.expenses));
  const [billable, setBillable] = useState("80");
  const [rateTax, setRateTax] = useState("5");

  const money = (value: number) => formatMoney(value, currency, locale);

  const project = calculateProject({
    hours: parseAmount(hours, 10_000),
    rate: parseAmount(rate),
    revisionRounds: Number(rounds),
    bufferPercent: Math.min(parseAmount(buffer), 200),
    taxPercent: clampTax(parseAmount(projectTax)),
  });

  const hourly = calculateRate({
    income: parseAmount(income),
    expenses: parseAmount(expenses),
    billableHours: parseAmount(billable, 744),
    taxPercent: clampTax(parseAmount(rateTax)),
  });

  const currencyId = useId();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label htmlFor={currencyId} className="text-sm font-medium">
          {labels.currency}
        </label>
        <select
          id={currencyId}
          value={currency}
          onChange={(event) => setCurrency(event.target.value as Currency)}
          className="h-10 rounded-lg border bg-surface px-3 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cardClass} aria-labelledby="calc-project">
          <h2 id="calc-project" className="text-xl font-semibold tracking-tight">
            {labels.project.title}
          </h2>
          <p className="mt-1 text-sm text-muted">{labels.project.lead}</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label={labels.project.hours}
              value={hours}
              onChange={setHours}
            />
            <Field
              label={labels.project.rate}
              value={rate}
              onChange={setRate}
            />
            <div>
              <label
                htmlFor="rounds"
                className="block text-sm font-medium"
              >
                {labels.project.revisions}
              </label>
              <select
                id="rounds"
                value={rounds}
                onChange={(event) => setRounds(event.target.value)}
                aria-describedby="rounds-hint"
                className={inputClass}
              >
                {[0, 1, 2, 3, 4, 5].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
              <p id="rounds-hint" className="mt-1 text-xs text-muted">
                {labels.project.revisionsHint}
              </p>
            </div>
            <Field
              label={labels.project.buffer}
              hint={labels.project.bufferHint}
              value={buffer}
              onChange={setBuffer}
            />
            <Field
              label={labels.project.tax}
              value={projectTax}
              onChange={setProjectTax}
            />
          </div>

          <div
            className="mt-6 rounded-xl bg-primary/5 p-4"
            aria-live="polite"
            data-testid="project-result"
          >
            {project ? (
              <dl className="divide-y">
                <Result
                  label={labels.project.resultPrice}
                  value={money(project.price)}
                  strong
                />
                <Result
                  label={labels.project.resultNet}
                  value={money(project.net)}
                />
                <Result
                  label={labels.project.resultHours}
                  value={formatHours(project.totalHours, locale)}
                />
                <Result
                  label={labels.project.resultReal}
                  value={money(project.realRate)}
                />
              </dl>
            ) : (
              <p className="text-sm text-muted">{labels.project.empty}</p>
            )}
          </div>
        </section>

        <section className={cardClass} aria-labelledby="calc-rate">
          <h2 id="calc-rate" className="text-xl font-semibold tracking-tight">
            {labels.rate.title}
          </h2>
          <p className="mt-1 text-sm text-muted">{labels.rate.lead}</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label={labels.rate.income}
              value={income}
              onChange={setIncome}
            />
            <Field
              label={labels.rate.expenses}
              value={expenses}
              onChange={setExpenses}
            />
            <Field
              label={labels.rate.hours}
              hint={labels.rate.hoursHint}
              value={billable}
              onChange={setBillable}
            />
            <Field
              label={labels.rate.tax}
              value={rateTax}
              onChange={setRateTax}
            />
          </div>

          <div
            className="mt-6 rounded-xl bg-primary/5 p-4"
            aria-live="polite"
            data-testid="rate-result"
          >
            {hourly ? (
              <dl className="divide-y">
                <Result
                  label={labels.rate.resultRate}
                  value={money(hourly.hourlyRate)}
                  strong
                />
                <Result
                  label={labels.rate.resultRevenue}
                  value={money(hourly.revenue)}
                />
              </dl>
            ) : (
              <p className="text-sm text-muted">{labels.rate.empty}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
