import { createClient } from "@supabase/supabase-js";

export interface CRMProvider { createLead(lead: LeadInput): Promise<void>; updateLead(id: string, values: Partial<LeadInput>): Promise<void> }
export interface EmailProvider { sendSellerConfirmation(lead: LeadInput): Promise<void>; sendAdminLeadNotification(lead: LeadInput): Promise<void>; sendInvestorConfirmation(lead: LeadInput): Promise<void> }
export interface PropertyAnalysisProvider { analyze(input: PropertyAnalysisInput): Promise<unknown> }
export interface ValuationProvider { estimate(address: string): Promise<number | null> }
export interface MarketDataProvider { getMarket(slug: string): Promise<unknown | null> }
export interface RentalDataProvider { estimateMonthlyRent(address: string): Promise<number | null> }
export interface AIAnalysisProvider { summarize(input: PropertyAnalysisInput): Promise<string> }
export type LeadInput = { kind: "seller" | "investor" | "contact"; name: string; email: string; phone?: string; address?: string; city?: string; state?: string; zip?: string; propertyType?: string; bedrooms?: number; bathrooms?: number; squareFeet?: number; occupancy?: string; condition?: string; situation?: string; preferredContact?: string; interest?: string; message?: string };
export type PropertyAnalysisInput = { purchasePrice: number; renovationBudget: number; monthlyRent: number };

export async function createLead(lead: LeadInput) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { error } = lead.kind === "seller"
    ? await db.from("seller_leads").insert({
      address: lead.address!, city: lead.city!, state: lead.state!, zip: lead.zip, property_type: lead.propertyType,
      bedrooms: lead.bedrooms, bathrooms: lead.bathrooms, square_feet: lead.squareFeet, occupancy: lead.occupancy,
      condition: lead.condition, situation: lead.situation, name: lead.name, email: lead.email, phone: lead.phone,
      preferred_contact: lead.preferredContact, message: lead.message, lead_status: "new", source: "website"
    })
    : lead.kind === "investor"
      ? await db.from("investor_leads").insert({ name: lead.name, email: lead.email, phone: lead.phone, interest: lead.interest, message: lead.message, lead_status: "new", source: "website" })
      : await db.from("partner_leads").insert({ name: lead.name, email: lead.email, phone: lead.phone, interest: "General contact", message: lead.message, lead_status: "new", source: "website" });
  if (error) throw error;
}
