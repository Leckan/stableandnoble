import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead, deleteSellerPhotos, HubSpotCRMProvider, saveSellerPhotos, sendLeadEmails } from "@/lib/providers";
import { verifiedImageExtension } from "@/lib/images";

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
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 26 * 1024 * 1024) return NextResponse.json({ error: "Please keep photo uploads under 25 MB total." }, { status: 413 });
  const multipart = request.headers.get("content-type")?.includes("multipart/form-data") || false;
  let uploadedPhotos: File[] = [];
  let body: unknown = null;
  if (multipart) {
    const form = await request.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: "The submitted form could not be read." }, { status: 400 });
    uploadedPhotos = form.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
    body = Object.fromEntries([...form.entries()].filter(([key]) => key !== "photos"));
  } else body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the required fields." }, { status: 400 });
  if (uploadedPhotos.length > 5) return NextResponse.json({ error: "Please upload no more than five photos." }, { status: 400 });
  const totalBytes = uploadedPhotos.reduce((sum,file)=>sum+file.size,0);
  if (uploadedPhotos.some(file=>file.size > 5 * 1024 * 1024) || totalBytes > 25 * 1024 * 1024) return NextResponse.json({ error: "Each photo must be 5 MB or smaller, with no more than 25 MB total." }, { status: 400 });
  if (uploadedPhotos.length && parsed.data.kind !== "seller") return NextResponse.json({ error: "Photo uploads are only available for property inquiries." }, { status: 400 });
  for (const file of uploadedPhotos) if (!(await verifiedImageExtension(file))) return NextResponse.json({ error: "Use JPG, PNG, or WebP images only." }, { status: 400 });
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!configured) return NextResponse.json({ error: "Lead storage is not configured yet." }, { status: 503 });
  let photoPaths: string[] = [];
  try {
    if (uploadedPhotos.length) photoPaths = await saveSellerPhotos(uploadedPhotos);
    await createLead({ ...parsed.data, photoUploads: photoPaths });
    try { await new HubSpotCRMProvider().createLead(parsed.data); } catch (error) { console.error("CRM lead sync failed", error instanceof Error ? error.message : "unknown provider error"); }
    try { await sendLeadEmails(parsed.data); } catch { /* Lead is persisted; email delivery can be retried separately. */ }
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  catch {
    if (photoPaths.length) await deleteSellerPhotos(photoPaths).catch(()=>undefined);
    return NextResponse.json({ error: "We couldn’t save your inquiry. Please try again." }, { status: 500 });
  }
}
