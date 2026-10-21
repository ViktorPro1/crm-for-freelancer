// Розрахунки для безкоштовних калькуляторів. Це звичайні функції без інтерфейсу,
// тому їх легко перевірити окремо від сторінки.

import type { Locale } from "@/lib/i18n/config";

export const CURRENCIES = ["UAH", "USD", "EUR", "PLN", "CZK"] as const;
export type Currency = (typeof CURRENCIES)[number];

// Кожен раунд правок додає цю частку до запланованих годин.
export const REVISION_SHARE = 0.1;

// Початкові значення залежать від мови сторінки, щоб суми виглядали правдоподібно.
export const DEFAULT_CURRENCY: Record<Locale, Currency> = {
  uk: "UAH",
  en: "USD",
  pl: "PLN",
  cs: "CZK",
};

export const DEFAULT_AMOUNTS: Record<
  Currency,
  { rate: number; income: number; expenses: number }
> = {
  UAH: { rate: 600, income: 40000, expenses: 8000 },
  USD: { rate: 20, income: 1500, expenses: 300 },
  EUR: { rate: 20, income: 1500, expenses: 300 },
  PLN: { rate: 80, income: 6000, expenses: 1200 },
  CZK: { rate: 450, income: 35000, expenses: 7000 },
};

// Перетворює текст з поля вводу на число. Кома теж дозволена ("12,5").
// Усе некоректне або від'ємне вважаємо нулем, а надто великі числа обмежуємо.
export function parseAmount(text: string, max = 10_000_000): number {
  const value = Number(text.trim().replace(",", "."));

  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.min(value, max);
}

// Податок обмежуємо до 90%, щоб ділення не давало безглуздих чисел.
export function clampTax(percent: number): number {
  return Math.min(Math.max(percent, 0), 90);
}

export type ProjectInput = {
  hours: number;
  rate: number;
  revisionRounds: number;
  bufferPercent: number;
  taxPercent: number;
};

export type ProjectResult = {
  totalHours: number;
  net: number;
  price: number;
  realRate: number;
};

// Ціна проєкту:
// години з правками й запасом помножені на ставку дають суму "на руки" (net),
// а ціна для клієнта більша, щоб після податків лишилась саме ця сума.
export function calculateProject(input: ProjectInput): ProjectResult | null {
  if (input.hours <= 0) {
    return null;
  }

  const tax = clampTax(input.taxPercent);
  const withRevisions =
    input.hours * (1 + REVISION_SHARE * input.revisionRounds);
  const totalHours = withRevisions * (1 + input.bufferPercent / 100);
  const net = totalHours * input.rate;
  const price = net / (1 - tax / 100);

  return { totalHours, net, price, realRate: net / input.hours };
}

export type RateInput = {
  income: number;
  expenses: number;
  billableHours: number;
  taxPercent: number;
};

export type RateResult = {
  hourlyRate: number;
  revenue: number;
};

// Ставка: дохід, який треба заробити до податків, ділимо на оплачувані години.
// Витрати вважаємо такими, що платяться з виручки до податку.
export function calculateRate(input: RateInput): RateResult | null {
  if (input.billableHours <= 0) {
    return null;
  }

  const tax = clampTax(input.taxPercent);
  const revenue = (input.income + input.expenses) / (1 - tax / 100);

  return { hourlyRate: revenue / input.billableHours, revenue };
}

// Форматування чисел написане вручну, а не через Intl.NumberFormat.
// Сервер (Node) і браузер мають різні дані про валюти й пробіли, тому Intl міг дати
// різний текст ("₴" на сервері й "грн" у браузері) і викликати помилку гідратації.
// Тут результат однаковий усюди.
const SYMBOLS: Record<Currency, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
  PLN: "zł",
  CZK: "Kč",
};

const NBSP = "\u00a0";

function groupDigits(digits: string, locale: Locale): string {
  const separator = locale === "en" ? "," : NBSP;

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

// Ціле число з розділенням тисяч: 34863 -> "34 863" (en: "34,863").
export function formatMoney(
  value: number,
  currency: Currency,
  locale: Locale,
): string {
  const text = groupDigits(String(Math.round(value)), locale);
  const symbol = SYMBOLS[currency];

  // В англійській символ стоїть перед сумою ($1,162), в інших мовах після (1 162 ₴).
  return locale === "en" ? `${symbol}${text}` : `${text}${NBSP}${symbol}`;
}

// Число з однією цифрою після коми: 55.2 -> "55,2" (en: "55.2"), 40 -> "40".
export function formatHours(value: number, locale: Locale): string {
  const [whole, fraction] = (Math.round(value * 10) / 10).toFixed(1).split(".");
  const grouped = groupDigits(whole, locale);

  if (fraction === "0") {
    return grouped;
  }

  return `${grouped}${locale === "en" ? "." : ","}${fraction}`;
}
