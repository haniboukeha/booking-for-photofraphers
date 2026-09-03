import Link from "next/link";
import { Ban, ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getMonthDays, type DayInfo } from "@/lib/availability";
import { todayInZone, utcDateToDateStr } from "@/lib/timezone";
import { blockDate, unblockDate } from "@/app/actions/admin-calendar";
import { Flash } from "@/components/Flash";

const CELL: Record<DayInfo["status"], string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100",
  PENDING: "bg-sky-50 text-sky-700 ring-sky-200",
  CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-200",
  BLOCKED: "bg-red-50 text-red-600 ring-red-200",
  CLOSED: "bg-slate-100 text-slate-400 ring-slate-200",
  PAST: "bg-white text-slate-300 ring-slate-100",
};

export default async function AdminCalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  const sp = await searchParams;
  const settings = await getSettings();
  const today = todayInZone(settings.timezone);
  const now = new Date(today + "T12:00:00Z");
  const year = Number(sp.year) || now.getUTCFullYear();
  const month = Number(sp.month) || now.getUTCMonth() + 1;
  const prefill = typeof sp.block === "string" ? sp.block : "";

  const days = await getMonthDays(year, month, today);
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  const blocked = await prisma.blockedDate.findMany({ orderBy: { date: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
      <p className="mt-1 text-sm text-slate-500">Click any available date to block it.</p>

      <Flash show={sp.saved === "1"} message="Calendar updated." />

      <div className="mt-5 flex items-center gap-3 text-sm">
        <Link
          href={`/admin/calendar?year=${prev.y}&month=${prev.m}`}
          className="btn btn-outline btn-sm"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <p className="min-w-44 text-center text-base font-bold">
          {new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
        </p>
        <Link
          href={`/admin/calendar?year=${next.y}&month=${next.m}`}
          className="btn btn-outline btn-sm"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1.5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="pb-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            {d}
          </div>
        ))}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          const info = days[dateStr];
          const isToday = dateStr === today;
          const cell = (
            <span
              className={`flex h-full min-h-16 w-full flex-col items-center justify-center rounded-xl p-1 text-center ring-1 transition ${CELL[info.status]} ${
                isToday ? "ring-2 ring-slate-900" : ""
              }`}
            >
              <span className="text-sm font-bold">{i + 1}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wide">{info.status}</span>
              {info.pendingCount + info.confirmedCount > 0 && (
                <span className="text-[9px] text-slate-400">{info.pendingCount + info.confirmedCount} hold{info.pendingCount + info.confirmedCount === 1 ? "" : "s"}</span>
              )}
            </span>
          );
          return info.status === "AVAILABLE" ? (
            <Link key={dateStr} href={`/admin/calendar?year=${year}&month=${month}&block=${dateStr}`} title={`Block ${dateStr}`}>
              {cell}
            </Link>
          ) : (
            <div key={dateStr} title={info.reason ?? ""}>{cell}</div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        {(["AVAILABLE", "PENDING", "CONFIRMED", "BLOCKED", "CLOSED"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded ring-1 ${CELL[s].split(" ").slice(0, 2).join(" ")}`} /> {s}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold">Block a date</h2>
          <form action={blockDate} className="mt-4 space-y-3">
            <input type="date" name="date" required defaultValue={prefill} className="input" />
            <select name="type" className="input">
              <option value="PERSONAL">Personal event</option>
              <option value="HOLIDAY">Holiday</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
            <input name="reason" required placeholder="Reason (e.g. Wedding shoot, Holiday)" className="input" />
            <button className="btn btn-primary">Block date</button>
          </form>
          <p className="mt-3 text-xs text-slate-400">
            Blocking is refused while a confirmed booking holds the date — move or cancel it first.
          </p>
        </div>

        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Ban className="h-4 w-4 text-red-500" /> Blocked dates
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {blocked.length === 0 && <li className="text-slate-400">Nothing blocked.</li>}
            {blocked.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                <span>
                  <span className="font-semibold">{utcDateToDateStr(b.date)}</span>{" "}
                  <span className="text-slate-500">— {b.reason}</span>{" "}
                  <span className="chip bg-slate-200 text-slate-500">{b.type}</span>
                </span>
                <form action={unblockDate}>
                  <input type="hidden" name="date" value={utcDateToDateStr(b.date)} />
                  <button className="text-xs font-semibold text-red-600 hover:underline">Unblock</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
