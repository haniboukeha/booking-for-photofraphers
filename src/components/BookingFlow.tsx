"use client";

import { useEffect, useMemo, useState, useTransition, useSyncExternalStore, useActionState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock, Lock, MapPin, ShoppingBag, Trash2 } from "lucide-react";
import { submitBooking, type BookingFormState } from "@/app/actions/booking";
import { cartTotal, getSnapshot, removeFromCart, setAddonQuantity, subscribe } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { generateSlots } from "@/lib/slots";
import { getDict, fmt, type Locale } from "@/lib/i18n";

interface Availability {
  available: boolean;
  status: string;
  reason: string | null;
}

function Steps({ d, current }: { d: ReturnType<typeof getDict>; current: 1 | 2 }) {
  const steps = [d.booking.step1, d.booking.step2, d.booking.step3];
  return (
    <ol className="flex items-center gap-2 text-xs font-semibold sm:text-sm" aria-label="Booking progress">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-4 bg-slate-300 sm:w-8" />}
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${
                active ? "bg-slate-900 text-white" : done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
              }`}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{n}</span>}
              <span className="hidden sm:inline">{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function BookingFlow({
  locale,
  currency,
  today,
  openTime,
  closeTime,
}: {
  locale: Locale;
  currency: string;
  today: string;
  openTime: string;
  closeTime: string;
}) {
  const d = getDict(locale);
  const items = useSyncExternalStore(subscribe, getSnapshot, () => []);
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [checking, setChecking] = useState(false);
  const [isPending] = useTransition();
  const [state, formAction] = useActionState<BookingFormState, FormData>(submitBooking, { ok: false });
  const checkId = useRef(0);

  const minDate = useMemo(() => {
    const dt = new Date(today + "T12:00:00Z");
    dt.setUTCDate(dt.getUTCDate() + 1);
    return dt.toISOString().slice(0, 10);
  }, [today]);

  const duration = useMemo(
    () => Math.max(60, ...items.map((i) => i.durationMinutes ?? 60)),
    [items]
  );
  const slots = useMemo(() => generateSlots(openTime, closeTime, duration), [openTime, closeTime, duration]);
  const effectiveTime = slots.includes(time) ? time : "";

  async function handleDateChange(value: string) {
    setDate(value);
    const id = ++checkId.current;
    if (!value) {
      setAvailability(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`/api/availability?date=${value}`);
      const data = (await res.json()) as Availability;
      if (id === checkId.current) setAvailability(data);
    } catch {
      if (id === checkId.current) setAvailability(null);
    } finally {
      if (id === checkId.current) setChecking(false);
    }
  }

  useEffect(() => {
    if (state?.ok && state.code) {
      router.push(`/booking/${state.code}`);
    }
  }, [state, router]);

  const total = cartTotal(items);
  const canSubmit = items.length > 0 && date !== "" && effectiveTime !== "" && availability?.available === true && !checking;

  if (items.length === 0) {
    return (
      <div className="card mx-auto max-w-md p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <p className="mt-5 text-lg font-semibold">{d.booking.emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{d.booking.emptyText}</p>
        <Link href="/services" className="btn btn-primary mt-7">
          {d.common.viewServices}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Steps d={d} current={2} />

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <form action={formAction} className="space-y-6">
            <input
              type="hidden"
              name="itemsJson"
              value={JSON.stringify(items.map((i) => ({ packageId: i.packageId, addons: i.addons.map((a) => ({ addonId: a.addonId, quantity: a.quantity })) })))}
            />
            <input type="hidden" name="time" value={effectiveTime} />

            <div className="card p-6">
              <h2 className="mb-4 text-base font-semibold">{d.booking.whenTitle}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="date">{d.booking.dateLabel}</label>
                  <input
                    id="date"
                    type="date"
                    name="date"
                    required
                    min={minDate}
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="input"
                  />
                  <div aria-live="polite" className="min-h-5">
                    {checking && <p className="mt-1.5 text-xs text-slate-400">{d.booking.checking}</p>}
                    {!checking && date && availability && !availability.available && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {availability.reason ?? d.booking.unavailable} {d.booking.chooseAnother}
                      </p>
                    )}
                    {!checking && availability?.available && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {d.booking.available}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="time-select">{d.booking.timeLabel}</label>
                  <select
                    id="time-select"
                    required
                    value={effectiveTime}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={!date || !availability?.available || slots.length === 0}
                    className="input disabled:opacity-50"
                  >
                    <option value="">—</option>
                    {slots.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" /> {fmt(d.booking.hoursNote, { open: openTime, close: closeTime })}
                  </p>
                  {date && availability?.available && slots.length === 0 && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{d.booking.noSlots}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="mb-4 text-base font-semibold">{d.booking.whoTitle}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{d.booking.firstName}</label>
                  <input name="firstName" required autoComplete="given-name" className="input" />
                </div>
                <div>
                  <label className="label">{d.booking.lastName}</label>
                  <input name="lastName" required autoComplete="family-name" className="input" />
                </div>
                <div>
                  <label className="label">{d.booking.phone}</label>
                  <input name="phone" type="tel" required autoComplete="tel" placeholder="+213 555 12 34 56" className="input" />
                </div>
                <div>
                  <label className="label">{d.booking.email}</label>
                  <input name="email" type="email" autoComplete="email" placeholder="you@example.com" className="input" />
                </div>
              </div>
              <div className="mt-4">
                <label className="label flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-sky-600" /> {d.booking.addressLabel}
                </label>
                <textarea
                  name="eventAddress"
                  required
                  rows={2}
                  placeholder={d.booking.addressPlaceholder}
                  className="input resize-y"
                />
              </div>
              <div className="mt-4">
                <label className="label">{d.booking.notes}</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder={d.booking.notesPlaceholder}
                  className="input resize-y"
                />
              </div>
            </div>

            {state?.error && (
              <p className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
              </p>
            )}

            <button type="submit" disabled={!canSubmit || isPending} className="btn btn-amber w-full py-3.5 text-base">
              <Lock className="h-4 w-4" />
              {isPending ? d.booking.submitting : d.booking.submit}
            </button>
            <p className="text-center text-xs text-slate-400">{d.booking.disclaimer}</p>
          </form>
        </div>

        <aside className="lg:col-span-2">
          <div className="card sticky top-24 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{d.booking.yourBooking}</h2>
              <span className="chip bg-slate-100 text-slate-500">{items.length} {d.booking.items}</span>
            </div>
            <ul className="mt-4 space-y-5">
              {items.map((item) => (
                <li key={item.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.serviceName}</p>
                      <p className="text-xs text-slate-500">{item.packageName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-sm font-semibold">{formatMoney(item.packagePrice, currency)}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 text-xs text-slate-400 transition hover:text-red-600"
                        aria-label={`${d.common.remove} ${item.serviceName}`}
                      >
                        <Trash2 className="h-3 w-3" /> {d.common.remove}
                      </button>
                    </div>
                  </div>
                  {item.addons.length > 0 && (
                    <ul className="mt-2.5 space-y-1.5">
                      {item.addons.map((a) => (
                        <li key={a.addonId} className="flex items-center justify-between text-sm text-slate-600">
                          <span className="flex items-center gap-2">
                            {a.name}
                            {a.allowQuantity && (
                              <span className="flex items-center gap-0.5 rounded-full border border-slate-200 p-0.5">
                                <button
                                  onClick={() => setAddonQuantity(item.id, a.addonId, Math.max(a.minQuantity, a.quantity - 1))}
                                  className="flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                                  aria-label={`Decrease ${a.name}`}
                                >
                                  −
                                </button>
                                <span className="w-5 text-center text-xs font-bold">{a.quantity}</span>
                                <button
                                  onClick={() => setAddonQuantity(item.id, a.addonId, Math.min(a.maxQuantity, a.quantity + 1))}
                                  className="flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                                  aria-label={`Increase ${a.name}`}
                                >
                                  +
                                </button>
                              </span>
                            )}
                          </span>
                          <span>{formatMoney(a.price * a.quantity, currency)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>{d.common.total}</span>
                <span>{formatMoney(total, currency)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{d.booking.recalculated}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
