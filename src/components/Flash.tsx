import { CheckCircle2 } from "lucide-react";

export function Flash({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  return (
    <div className="fade-up mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200" role="status">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
