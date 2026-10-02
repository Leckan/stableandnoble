export type PublicProperty = {
  id: string; slug: string; title: string; city: string; state: string; property_type: string; status: string;
  strategy: string | null; description: string | null; bedrooms: number | null; bathrooms: number | null;
  square_feet: number | null; is_public: boolean; property_images?: { url: string; alt_text: string | null; sort_order: number }[];
};

const selectable = "id,slug,title,city,state,property_type,status,strategy,description,bedrooms,bathrooms,square_feet,is_public,property_images(url,alt_text,sort_order)";

async function queryProperties(filters: string, limit: number): Promise<PublicProperty[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return [];
  const params = new URLSearchParams({ select: selectable, limit: String(limit), order: "featured.desc,created_at.desc", ...Object.fromEntries(new URLSearchParams(filters)) });
  try {
    const response = await fetch(`${base}/rest/v1/properties?${params}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 120 }, signal: AbortSignal.timeout(2500)
    });
    if (!response.ok) return [];
    return await response.json() as PublicProperty[];
  } catch { return []; }
}

export function getPublicProperties(limit = 12) {
  return queryProperties("is_public=eq.true&status=in.(for_sale,for_rent,sold,held)", limit);
}

export async function getPublicProperty(slug: string): Promise<PublicProperty | null> {
  const rows = await queryProperties(`slug=eq.${encodeURIComponent(slug)}&is_public=eq.true&status=in.(for_sale,for_rent,sold,held)`, 1);
  return rows[0] || null;
}
