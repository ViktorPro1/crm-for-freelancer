import type { Currency } from "./calculator";

// Налаштування підписки. Змінюй значення тут, більше нічого чіпати не треба.

// Скільки днів триває безкоштовний пробний період після схвалення заявки.
export const TRIAL_DAYS = 14;

// Ціна підписки за місяць у кожній валюті. Показується валюта, що відповідає мові сторінки.
// Це приклади: постав свої суми.
export const PRICE_PER_MONTH: Record<Currency, number> = {
  UAH: 299,
  USD: 7,
  EUR: 7,
  PLN: 29,
  CZK: 169,
};

// На скільки місяців адміністратор може продовжити доступ однією кнопкою.
export const EXTEND_MONTHS = [1, 3, 12] as const;
export type ExtendMonths = (typeof EXTEND_MONTHS)[number];
