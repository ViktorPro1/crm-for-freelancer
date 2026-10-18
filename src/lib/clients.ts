import type { Client } from "./types";

// Тимчасові дані. Пізніше замінимо їх на таблицю в базі Neon.
// Функції нижче навмисно асинхронні (async): коли дані переїдуть у базу,
// решта коду не зміниться, бо там уже стоїть `await`.
// Усі імена, пошти та компанії вигадані.

const clients: Client[] = [
  {
    id: "1",
    name: "Олена Коваль",
    company: "Кав'ярня «Лате»",
    email: "olena@example.com",
    status: "active",
    createdAt: "2026-03-12",
    notes: "Замовила лендінг із меню та формою бронювання. Оплата частинами.",
  },
  {
    id: "2",
    name: "Андрій Мельник",
    company: "Автосервіс «Мотор»",
    email: "andriy@example.com",
    status: "active",
    createdAt: "2026-05-04",
    notes: "Потрібен сайт з прайсом і онлайн-записом на ремонт.",
  },
  {
    id: "3",
    name: "Ірина Шевчук",
    company: "Ветклініка «Лапа»",
    email: "iryna@example.com",
    status: "lead",
    createdAt: "2026-09-21",
    notes: "Попросила орієнтовну вартість сайту. Чекаємо відповіді.",
  },
  {
    id: "4",
    name: "Тарас Бондаренко",
    company: "Фермерське господарство «Зерно»",
    email: "taras@example.com",
    status: "lead",
    createdAt: "2026-10-02",
    notes: "Цікавить каталог продукції без інтернет-магазину.",
  },
  {
    id: "5",
    name: "Марія Литвин",
    company: "Студія «Ритм»",
    email: "maria@example.com",
    status: "archived",
    createdAt: "2025-11-18",
    notes: "Проєкт завершено, сайт здано. Можливі правки за домовленістю.",
  },
  {
    id: "6",
    name: "Богдан Ткачук",
    company: "Барбершоп «Борода»",
    email: "bohdan@example.com",
    status: "archived",
    createdAt: "2026-01-09",
    notes: "Відмовився від розробки після першого етапу.",
  },
];

export async function getClients(): Promise<Client[]> {
  return clients;
}

export async function getClient(id: string): Promise<Client | undefined> {
  return clients.find((client) => client.id === id);
}
