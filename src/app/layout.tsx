import type { Metadata } from "next";
import "./globals.css";
import { SidebarNav } from "@/components/sidebar-nav";

export const metadata: Metadata = {
  title: { default: "CRM для фрилансера", template: "%s | CRM" },
  description: "Облік клієнтів, проєктів і рахунків",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk">
      <body>
        <div className="flex min-h-screen flex-col md:flex-row">
          <aside className="border-b border-black/10 p-4 dark:border-white/15 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
            <p className="mb-4 text-lg font-semibold">CRM</p>
            <SidebarNav />
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
