import { Building2, CalendarClock, Save, SlidersHorizontal } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { updateSettings } from "@/app/actions/admin-settings";
import { Flash } from "@/components/Flash";

const DAYS = [
  [1, "Mon"],
  [2, "Tue"],
  [3, "Wed"],
  [4, "Thu"],
  [5, "Fri"],
  [6, "Sat"],
  [7, "Sun"],
] as const;

export default async function AdminSettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const sp = await searchParams;
  const s = await getSettings();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Business identity, contact details and the availability policy.</p>

      <Flash show={sp.saved === "1"} message="Settings saved." />

      <form action={updateSettings} className="mt-6 space-y-6">
        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="flex items-center gap-2 font-semibold sm:col-span-2">
            <Building2 className="h-4 w-4 text-sky-600" /> Business
          </h2>
          <label>
            <span className="label">Business name</span>
            <input name="businessName" required defaultValue={s.businessName} className="input" />
          </label>
          <label>
            <span className="label">Timezone</span>
            <input name="timezone" required defaultValue={s.timezone} className="input" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Headline</span>
            <input name="headline" defaultValue={s.headline} className="input" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Short description</span>
            <textarea name="description" rows={2} defaultValue={s.description} className="input resize-y" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">About page text</span>
            <textarea name="aboutText" rows={3} defaultValue={s.aboutText} className="input resize-y" />
          </label>
        </div>

        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">Contact</h2>
          <label><span className="label">Phone</span><input name="phone" defaultValue={s.phone} className="input" /></label>
          <label><span className="label">Email</span><input name="email" type="email" defaultValue={s.email} className="input" /></label>
          <label><span className="label">WhatsApp</span><input name="whatsapp" defaultValue={s.whatsapp} className="input" /></label>
          <label><span className="label">Instagram</span><input name="instagram" defaultValue={s.instagram} className="input" /></label>
          <label><span className="label">Location</span><input name="location" defaultValue={s.location} className="input" /></label>
          <label><span className="label">Business hours</span><input name="businessHours" defaultValue={s.businessHours} className="input" /></label>
        </div>

        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="h-4 w-4 text-sky-600" /> Availability policy
          </h2>
          <p className="mt-1 text-xs text-slate-400">Working days and hold rules used by the availability service (spec §10.2).</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Working hours — open at</span>
              <input name="openTime" type="time" required defaultValue={s.openTime} className="input" />
            </label>
            <label>
              <span className="label">Working hours — close at</span>
              <input name="closeTime" type="time" required defaultValue={s.closeTime} className="input" />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Customers can only pick start times whose full session fits inside this window. A close time
            earlier than the open time crosses midnight (e.g. 14:00 → 01:00).
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {DAYS.map(([n, label]) => (
              <label
                key={n}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50 has-[:checked]:text-sky-800"
              >
                <input type="checkbox" name="workingDays" value={n} defaultChecked={s.workingDays.includes(n)} className="h-3.5 w-3.5 accent-sky-600" />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-2.5 text-sm font-medium">
              <input type="checkbox" name="holdPending" defaultChecked={s.holdPending} className="h-4 w-4 accent-sky-600" />
              PENDING holds the date
            </label>
            <label>
              <span className="label">Hold hours</span>
              <input name="holdHours" type="number" min={1} max={168} defaultValue={s.holdHours} className="input" />
            </label>
            <label>
              <span className="label">Max bookings / day</span>
              <input name="maxBookingsPerDay" type="number" min={1} max={20} defaultValue={s.maxBookingsPerDay} className="input" />
            </label>
          </div>
          {s.maxBookingsPerDay === 1 && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-800 ring-1 ring-sky-200">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
              With max bookings/day = 1 the database enforces a hard one-hold-per-date guarantee. If you raise
              this limit, drop the <code className="rounded bg-sky-100 px-1">bookings_day_hold</code> index and
              enable the overlap exclusion constraint instead (see the constraints migration).
            </p>
          )}
        </div>

        <button className="btn btn-primary">
          <Save className="h-4 w-4" /> Save settings
        </button>
      </form>
    </div>
  );
}
