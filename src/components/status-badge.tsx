import { STATUS_LABELS, type ClientStatus } from "@/lib/types";

const styles: Record<ClientStatus, string> = {
  lead: "bg-info-bg text-info-fg",
  active: "bg-success-bg text-success-fg",
  archived: "bg-neutral-bg text-neutral-fg",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
