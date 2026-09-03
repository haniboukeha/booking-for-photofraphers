// Working-hours slot logic. closeTime may be earlier than openTime,
// meaning the window crosses midnight (e.g. 14:00 – 01:00).

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const m = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function windowMinutes(openTime: string, closeTime: string): number {
  const o = toMinutes(openTime);
  const c = toMinutes(closeTime);
  return c > o ? c - o : c + 1440 - o;
}

export function generateSlots(openTime: string, closeTime: string, durationMin: number, step = 30): string[] {
  const start = toMinutes(openTime);
  const window = windowMinutes(openTime, closeTime);
  const slots: string[] = [];
  for (let rel = 0; rel + durationMin <= window; rel += step) {
    slots.push(fromMinutes(start + rel));
  }
  return slots;
}

export function isValidSlot(time: string, openTime: string, closeTime: string, durationMin: number): boolean {
  return generateSlots(openTime, closeTime, durationMin).includes(time);
}
