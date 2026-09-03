import { getDayInfo } from "@/lib/availability";
import { getSettings } from "@/lib/settings";
import { todayInZone } from "@/lib/timezone";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  if (!rateLimit(`avail:${clientIp(request.headers)}`, 60, 60 * 1000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }
  const settings = await getSettings();
  const info = await getDayInfo(date, todayInZone(settings.timezone), settings);
  return Response.json({
    available: info.status === "AVAILABLE",
    status: info.status,
    reason: info.reason ?? null,
  });
}
