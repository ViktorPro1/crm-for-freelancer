"use client";

import { useEffect } from "react";
import { writeCalendarSeen } from "@/lib/calendar-seen";

// Невидимий компонент на сторінці календаря: щойно людина її відкрила, запам'ятовує,
// який набір нагадувань вона бачила. Якщо список змінився на цій сторінці
// (наприклад, натиснули "Зв'язався"), відмітка оновлюється й кружечок не з'являється знову.
export function CalendarSeen({ signature }: { signature: string }) {
  useEffect(() => {
    writeCalendarSeen(signature);
  }, [signature]);

  return null;
}
