import type { Currency } from "./calculator";

// Налаштування підписки. Змінюй значення тут, більше нічого чіпати не треба.

// Скільки днів триває безкоштовний пробний період після схвалення заявки.
export const TRIAL_DAYS = 14;

// Ціна підписки за місяць у кожній валюті. Показується валюта, що відповідає мові сторінки.
// Змінюй суми тут. Нові ціни діють одразу для всіх, хто ще не оплатив.
export const PRICE_PER_MONTH: Record<Currency, number> = {
  UAH: 149,
  USD: 4,
  EUR: 4,
  PLN: 17,
  CZK: 95,
};

// На скільки місяців адміністратор може продовжити доступ однією кнопкою.
export const EXTEND_MONTHS = [1, 3, 12] as const;
export type ExtendMonths = (typeof EXTEND_MONTHS)[number];

// Ліміти безкоштовного плану Neon (на один проєкт). Показуються в адмінці як "скільки ще вільно".
// Перевір актуальні числа в Neon Console (Billing) і за потреби зміни тут.
// Сховище Neon рахує в десяткових одиницях: 1 ГБ = 1 000 000 000 байтів.
export const DB_STORAGE_LIMIT_BYTES = 1_000_000_000;
// Години обчислень (CU-hours) на місяць. Скільки вже використано, знає лише Neon Console.
export const COMPUTE_LIMIT_HOURS = 100;
export const NEON_CONSOLE_URL = "https://console.neon.tech";
