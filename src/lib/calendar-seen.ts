// Пам'ять браузера про те, що людина вже переглянула календар: щоб червоний кружечок біля
// пункту "Календар" зникав після перегляду. Це файл без серверного коду (як consent.ts),
// тому його можна підключати в клієнтських компонентах.

const KEY = "crm-calendar-seen";
const EVENT = "crm-calendar-seen-change";

export function readCalendarSeen(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeCalendarSeen(signature: string) {
  try {
    localStorage.setItem(KEY, signature);
  } catch {
    // Сховище недоступне (наприклад, приватне вікно): кружечок просто не зникатиме.
  }

  window.dispatchEvent(new Event(EVENT));
}

// Підписка для useSyncExternalStore: меню оновлюється, коли відмітку змінили тут
// або в іншій вкладці.
export function subscribeCalendarSeen(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
