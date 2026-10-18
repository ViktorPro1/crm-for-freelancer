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
};

// Підписи статусів для показу на сторінці.
export const STATUS_LABELS: Record<ClientStatus, string> = {
  lead: "Потенційний",
  active: "Активний",
  archived: "В архіві",
};
