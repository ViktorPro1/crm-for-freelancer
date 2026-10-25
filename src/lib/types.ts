// Опис того, як виглядає клієнт у нашій програмі.
// Якщо десь у коді помилимось з полем (наприклад, напишемо client.nam),
// TypeScript одразу підкаже помилку ще до запуску.

export type ClientStatus = "lead" | "active" | "archived";

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  status: ClientStatus;
  createdAt: string; // дата у форматі РРРР-ММ-ДД
  notes: string;
  // Коли треба зв'язатися (дата "2026-10-28") і скільки днів до цієї дати за часом користувача:
  // 0 сьогодні, від'ємне число прострочено. Обидва null, якщо нагадування немає.
  followUpOn: string | null;
  followUpDays: number | null;
  // Чий це клієнт. Заповнюється лише для адміністратора, щоб він бачив власника.
  ownerLabel: string | null;
};
