"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient, requireStaff } from "@/lib/supabase/server";

const propertySchema = z.object({
  title: z.string().trim().min(3).max(160), slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  city: z.string().trim().min(2).max(100), state: z.string().trim().length(2), zip: z.string().trim().max(10).optional(),
  propertyType: z.string().trim().min(2).max(80), strategy: z.string().trim().max(80).optional(),
  status: z.enum(["lead","under_analysis","offer_made","under_contract","renovation","for_sale","for_rent","sold","held","archived"]),
  description: z.string().trim().max(5000).optional(), isPublic: z.boolean()
});

export async function signOut() {
  const supabase = await createSupabaseServerClient(); await supabase.auth.signOut(); redirect("/admin/login");
}

export async function createProperty(form: FormData) {
  const { supabase } = await requireStaff();
  const parsed = propertySchema.safeParse({
    title: form.get("title"), slug: form.get("slug"), city: form.get("city"), state: form.get("state"), zip: form.get("zip") || undefined,
    propertyType: form.get("propertyType"), strategy: form.get("strategy") || undefined, status: form.get("status"),
    description: form.get("description") || undefined, isPublic: form.get("isPublic") === "on"
  });
  if (!parsed.success) redirect("/admin/properties?error=validation");
  const value = parsed.data;
  const { error } = await supabase.from("properties").insert({
    title: value.title, slug: value.slug, city: value.city, state: value.state.toUpperCase(), zip: value.zip,
    property_type: value.propertyType, strategy: value.strategy, status: value.status,
    description: value.description, is_public: value.isPublic
  });
  if (error) redirect(`/admin/properties?error=${error.code === "23505" ? "duplicate" : "save"}`);
  revalidatePath("/admin/properties"); revalidatePath("/portfolio"); revalidatePath("/"); redirect("/admin/properties?saved=1");
}

export async function setPropertyVisibility(form: FormData) {
  const { supabase } = await requireStaff(); const id = z.string().uuid().safeParse(form.get("id"));
  const visible = form.get("visible") === "true";
  if (!id.success) return;
  const { error } = await supabase.from("properties").update({ is_public: visible }).eq("id", id.data);
  if (!error) { revalidatePath("/admin/properties"); revalidatePath("/portfolio"); revalidatePath("/"); }
}

export async function updateLeadStatus(form: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().safeParse(form.get("id")); const table = z.enum(["seller_leads","buyer_leads","investor_leads","partner_leads"]).safeParse(form.get("table"));
  const status = z.enum(["new","contacted","qualified","in_progress","converted","closed","archived"]).safeParse(form.get("status"));
  if (!id.success || !table.success || !status.success) return;
  const { error } = await supabase.from(table.data).update({ lead_status: status.data }).eq("id", id.data);
  if (!error) revalidatePath("/admin/leads");
}

export async function createDeal(form: FormData) {
  const { supabase } = await requireStaff();
  const title = z.string().trim().min(3).max(180).safeParse(form.get("title"));
  const stage = z.enum(["lead","analysis","offer","under_contract","renovation","listed","sold","held"]).safeParse(form.get("stage"));
  const propertyIdValue = form.get("propertyId");
  const propertyId = propertyIdValue ? z.string().uuid().safeParse(propertyIdValue) : null;
  if (!title.success || !stage.success || (propertyId && !propertyId.success)) redirect("/admin/deals?error=validation");
  const { error } = await supabase.from("deals").insert({ title: title.data, stage: stage.data, property_id: propertyId?.success ? propertyId.data : null });
  if (error) redirect("/admin/deals?error=save");
  revalidatePath("/admin/deals"); redirect("/admin/deals?saved=1");
}

export async function updateDealStage(form: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().safeParse(form.get("id"));
  const stage = z.enum(["lead","analysis","offer","under_contract","renovation","listed","sold","held"]).safeParse(form.get("stage"));
  if (!id.success || !stage.success) return;
  const { error } = await supabase.from("deals").update({ stage: stage.data }).eq("id", id.data);
  if (!error) revalidatePath("/admin/deals");
}
