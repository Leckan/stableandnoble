"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient, requireStaff } from "@/lib/supabase/server";
import { removePropertyImage, uploadPropertyImage } from "@/lib/providers";
import { verifiedImageExtension } from "@/lib/images";

const propertySchema = z.object({
  title: z.string().trim().min(3).max(160), slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  city: z.string().trim().min(2).max(100), state: z.string().trim().length(2), zip: z.string().trim().max(10).optional(),
  propertyType: z.string().trim().min(2).max(80), strategy: z.string().trim().max(80).optional(),
  status: z.enum(["lead","under_analysis","offer_made","under_contract","renovation","for_sale","for_rent","sold","held","archived"]),
  description: z.string().trim().max(5000).optional(), isPublic: z.boolean()
}).superRefine((value,context)=>{
  if (value.isPublic && !["for_sale","for_rent","sold","held"].includes(value.status)) context.addIssue({code:"custom",path:["status"],message:"A property must be in a public status to publish."});
});

function parsePropertyForm(form: FormData) {
  return propertySchema.safeParse({
    title: form.get("title"), slug: form.get("slug"), city: form.get("city"), state: form.get("state"), zip: form.get("zip") || undefined,
    propertyType: form.get("propertyType"), strategy: form.get("strategy") || undefined, status: form.get("status"),
    description: form.get("description") || undefined, isPublic: form.get("isPublic") === "on"
  });
}

export async function signOut() {
  const supabase = await createSupabaseServerClient(); await supabase.auth.signOut(); redirect("/admin/login");
}

export async function createProperty(form: FormData) {
  const { supabase } = await requireStaff();
  const parsed = parsePropertyForm(form);
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

export async function updateProperty(form: FormData) {
  const { supabase } = await requireStaff(); const id = z.string().uuid().safeParse(form.get("id"));
  const parsed = parsePropertyForm(form);
  if (!id.success || !parsed.success) redirect("/admin/properties?error=validation");
  const value = parsed.data;
  const { error } = await supabase.from("properties").update({
    title: value.title, slug: value.slug, city: value.city, state: value.state.toUpperCase(), zip: value.zip,
    property_type: value.propertyType, strategy: value.strategy, status: value.status,
    description: value.description, is_public: value.isPublic, updated_at: new Date().toISOString()
  }).eq("id", id.data);
  if (error) redirect(`/admin/properties?error=${error.code === "23505" ? "duplicate" : "save"}`);
  revalidatePath("/admin/properties"); revalidatePath("/portfolio"); revalidatePath(`/portfolio/${value.slug}`); revalidatePath("/"); redirect("/admin/properties?saved=1");
}

export async function archiveProperty(form: FormData) {
  const { supabase } = await requireStaff(); const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return;
  const { error } = await supabase.from("properties").update({status:"archived",is_public:false,updated_at:new Date().toISOString()}).eq("id",id.data);
  if (!error) { revalidatePath("/admin/properties"); revalidatePath("/portfolio"); revalidatePath("/"); }
}

export async function addPropertyImage(form: FormData) {
  const { supabase } = await requireStaff();
  const propertyId = z.string().uuid().safeParse(form.get("propertyId"));
  const file = form.get("image");
  const altText = z.string().trim().min(5).max(250).safeParse(form.get("altText"));
  if (!propertyId.success || !(file instanceof File) || !altText.success || file.size > 10 * 1024 * 1024 || file.size === 0) redirect("/admin/properties?error=image");
  const extension = await verifiedImageExtension(file);
  if (!extension) redirect("/admin/properties?error=image");
  let stored: {path:string;url:string} | null = null;
  try {
    stored = await uploadPropertyImage(propertyId.data,file,extension);
    const {data: existing} = await supabase.from("property_images").select("sort_order").eq("property_id",propertyId.data).order("sort_order",{ascending:false}).limit(1).maybeSingle();
    const {error} = await supabase.from("property_images").insert({property_id:propertyId.data,url:stored.url,alt_text:altText.data,sort_order:(existing?.sort_order || 0)+1,metadata:{storage_path:stored.path}});
    if (error) throw error;
  } catch {
    if (stored) await removePropertyImage(stored.path).catch(()=>undefined);
    redirect("/admin/properties?error=image");
  }
  revalidatePath("/admin/properties"); revalidatePath("/portfolio"); revalidatePath("/"); redirect("/admin/properties?saved=1");
}

export async function deletePropertyImage(form: FormData) {
  const { supabase } = await requireStaff(); const id = z.string().uuid().safeParse(form.get("imageId"));
  if (!id.success) return;
  const {data:image} = await supabase.from("property_images").select("id,property_id,metadata").eq("id",id.data).maybeSingle();
  if (!image) return;
  const path = (image.metadata as {storage_path?:string}|null)?.storage_path;
  if (path) {
    try { await removePropertyImage(path); }
    catch { redirect("/admin/properties?error=media"); }
  }
  const {error} = await supabase.from("property_images").delete().eq("id",id.data);
  if (!error) { revalidatePath("/admin/properties"); revalidatePath("/portfolio"); revalidatePath(`/portfolio/${image.property_id}`); revalidatePath("/"); }
}

export async function setPropertyVisibility(form: FormData) {
  const { supabase } = await requireStaff(); const id = z.string().uuid().safeParse(form.get("id"));
  const visible = form.get("visible") === "true";
  if (!id.success) return;
  const { error } = await supabase.from("properties").update({ is_public: visible, updated_at: new Date().toISOString() }).eq("id", id.data);
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
