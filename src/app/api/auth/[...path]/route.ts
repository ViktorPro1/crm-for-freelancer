import { auth } from "@/lib/auth/server";

// Усі запити браузера про вхід і реєстрацію (/api/auth/...) проходять через цей маршрут.
export const { GET, POST } = auth.handler();
