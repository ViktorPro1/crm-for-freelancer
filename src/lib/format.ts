// Перетворює дату "2026-09-21" на "21 вересня 2026 р."
// timeZone: "UTC" потрібен, щоб дата скрізь показувалась однаково.
const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "long",
  timeZone: "UTC",
});

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
