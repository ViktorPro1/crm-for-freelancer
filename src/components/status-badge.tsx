import type { ProfileStatus } from "@/lib/profiles";
import type { ClientStatus } from "@/lib/types";

const styles: Record<ClientStatus | ProfileStatus, string> = {
  lead: "bg-info-bg text-info-fg",
  active: "bg-success-bg text-success-fg",
  archived: "bg-neutral-bg text-neutral-fg",
  // Статуси заявок в адмінці.
  pending: "bg-info-bg text-info-fg",
  approved: "bg-success-bg text-success-fg",
  rejected: "bg-neutral-bg text-neutral-fg",
};

// Підпис статусу (label) приходить уже перекладеним зі сторінки.
export function StatusBadge({
  status,
  label,
}: {
  status: ClientStatus | ProfileStatus;
  label: string;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {label}
    </span>
  );
}
