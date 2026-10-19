import { notFound } from "next/navigation";

// Ця сторінка ловить будь-яку адресу, якої немає на сайті (наприклад, /pl/foo/bar),
// і показує нашу сторінку "не знайдено" потрібною мовою (файл [lang]/not-found.tsx).
export default function CatchAll() {
  notFound();
}
