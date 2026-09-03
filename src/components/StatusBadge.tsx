import type { BookingStatus } from "@prisma/client";

const STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-sky-100 text-sky-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-200 text-slate-600",
  COMPLETED: "bg-sky-100 text-sky-800",
  EXPIRED: "bg-slate-100 text-slate-400",
};

const DOT: Record<BookingStatus, string> = {
  PENDING: "bg-sky-500",
  CONFIRMED: "bg-emerald-500",
  REJECTED: "bg-red-500",
  CANCELLED: "bg-slate-500",
  COMPLETED: "bg-sky-500",
  EXPIRED: "bg-slate-400",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`chip ${STYLES[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]} ${status === "PENDING" ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}
