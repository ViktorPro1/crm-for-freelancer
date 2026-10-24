// Невеликий конструктор CSV-файлів для експорту даних користувача.
// Роздільник ";" і BOM на початку потрібні, щоб Excel із українськими, польськими й чеськими
// налаштуваннями відкривав файл правильно: у стовпцях і з кирилицею без "кракозябрів".

const BOM = "﻿";
const SEPARATOR = ";";

// Захист від "CSV-ін'єкції": клітинка, що починається з = + - @ чи табуляції,
// у Excel може виконатися як формула. Додаємо апостроф, і вона стає звичайним текстом.
function safe(value: string) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function cell(value: string | number) {
  const text = safe(String(value));

  return `"${text.replaceAll('"', '""')}"`;
}

export function buildCsv(header: string[], rows: (string | number)[][]): string {
  const lines = [header, ...rows].map((row) => row.map(cell).join(SEPARATOR));

  // Рядки розділяємо \r\n, як того вимагає стандарт CSV.
  return BOM + lines.join("\r\n") + "\r\n";
}
