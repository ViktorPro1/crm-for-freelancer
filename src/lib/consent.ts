// Вибір людини щодо cookie аналітики. Зберігається в localStorage цього браузера.
// Значення: "granted" (дозволила), "denied" (відхилила), null (ще не вибирала).
// Файл підключається лише з клієнтських компонентів.

export type Consent = "granted" | "denied" | null;

const KEY = "crm-consent";
const EVENT = "crm-consent-change";

export function readConsent(): Consent {
  try {
    const value = localStorage.getItem(KEY);

    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

// null скидає вибір: банер з'явиться знову, а аналітика вимкнеться.
export function writeConsent(value: Consent) {
  try {
    if (value === null) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, value);
    }
  } catch {
    // Якщо браузер забороняє зберігання, вибір діє лише до оновлення сторінки.
  }

  window.dispatchEvent(new Event(EVENT));
}

// Підписка для useSyncExternalStore: реагуємо на зміни в цій вкладці й в інших.
export function subscribeConsent(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Видаляє cookie Google Analytics, якщо людина відкликала згоду.
export function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid");
  const host = window.location.hostname;
  const domains = [host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];

  for (const name of names) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
  }
}
