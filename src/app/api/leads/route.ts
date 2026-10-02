import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead, HubSpotCRMProvider, sendLeadEmails } from "@/lib/providers";

const optionalNumber = z.preprocess(value => value === "" ? undefined : value, z.coerce.number().min(0).max(10000000).optional());
const schema = z.object({
  kind: z.enum(["seller", "investor", "contact"]), name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254), phone: z.string().trim().max(32).optional(),
  address: z.string().trim().max(250).optional(), city: z.string().trim().max(100).optional(), state: z.string().trim().max(2).optional(),
  zip: z.string().trim().max(10).optional(), propertyType: z.string().max(80).optional(), message: z.string().trim().max(3000).optional(),
  bedrooms: optionalNumber, bathrooms: optionalNumber,
  squareFeet: z.preprocess(value => value === "" ? undefined : value, z.coerce.number().int().min(0).max(10000000).optional()), occupancy: z.string().max(80).optional(),
  condition: z.string().max(120).optional(), situation: z.string().max(120).optional(), preferredContact: z.string().max(40).optional(),
  interest: z.string().max(120).optional()
});

const requests = new Map<string, number[]>();
function isRateLimited(ip: string) {
  const now = Date.now(); const recent = (requests.get(ip) || []).filter(time => now - time < 60_000);
  if (recent.length >= 5) { requests.set(ip, recent); return true; }
  recent.push(now); requests.set(ip, recent); return false;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return NextResponse.json({ error: "Please wait a moment before sending another inquiry." }, { status: 429 });
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the required fields." }, { status: 400 });
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!configured) return NextResponse.json({ error: "Lead storage is not configured yet." }, { status: 503 });
  try {
    await createLead(parsed.data);
    try { await new HubSpotCRMProvider().createLead(parsed.data); } catch (error) { console.error("CRM lead sync failed", error instanceof Error ? error.message : "unknown provider error"); }
    try { await sendLeadEmails(parsed.data); } catch { /* Lead is persisted; email delivery can be retried separately. */ }
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  catch { return NextResponse.json({ error: "We couldn’t save your inquiry. Please try again." }, { status: 500 }); }
}
