// Timezone helpers for the business timezone (spec: all date math in business TZ).

function offsetMs(instant: Date, timeZone: string): number {
  const utc = new Date(instant.toLocaleString("en-US", { timeZone: "UTC" }));
  const local = new Date(instant.toLocaleString("en-US", { timeZone }));
  return local.getTime() - utc.getTime();
}

export function datePartsInZone(instant: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const parts = Object.fromEntries(dtf.formatToParts(instant).map((p) => [p.type, p.value]));
  const weekdayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return {
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    isoWeekday: weekdayMap[parts.weekday] ?? 1,
  };
}

export function todayInZone(timeZone: string): string {
  return datePartsInZone(new Date(), timeZone).dateStr;
}

export function isoWeekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow === 0 ? 7 : dow;
}

// Convert a wall-clock time in `timeZone` to an instant.
export function zonedWallTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  let instant = new Date(Date.UTC(year, month - 1, day, hour, minute));
  for (let i = 0; i < 2; i++) {
    instant = new Date(Date.UTC(year, month - 1, day, hour, minute) - offsetMs(instant, timeZone));
  }
  return instant;
}

// bookingDate column value: midnight UTC of the calendar date.
export function dateStrToUtcDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function utcDateToDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}
