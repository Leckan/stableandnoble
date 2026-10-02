import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAnalyticsEvent } from "@/lib/providers";

const eventSchema = z.object({
  event: z.enum(["page_view", "property_view", "seller_form_started", "seller_form_completed", "investor_form_started", "investor_form_completed", "contact_form_submitted", "property_analyzer_started", "property_analyzer_completed"]),
  route: z.string().min(1).max(200).regex(/^\/(?!\/)/)
}).strict();

const requests = new Map<string, number[]>();
function overLimit(ip: string) {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter(timestamp => now - timestamp < 60_000);
  if (recent.length >= 60) { requests.set(ip, recent); return true; }
  recent.push(now);
  requests.set(ip, recent);
  if (requests.size > 2000) for (const [key, timestamps] of requests) if (timestamps.every(timestamp => now - timestamp >= 60_000)) requests.delete(key);
  return false;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 2048) return new NextResponse(null, { status: 413 });
  const payload = eventSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return new NextResponse(null, { status: 400 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (overLimit(ip)) return new NextResponse(null, { status: 429 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return new NextResponse(null, { status: 204 });
  try {
    await recordAnalyticsEvent(payload.data.event, payload.data.route);
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
