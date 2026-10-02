import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export interface CRMProvider { createLead(lead: LeadInput): Promise<void>; updateLead(id: string, values: Partial<LeadInput>): Promise<void> }
export interface EmailProvider { sendSellerConfirmation(lead: LeadInput): Promise<void>; sendAdminLeadNotification(lead: LeadInput): Promise<void>; sendInvestorConfirmation(lead: LeadInput): Promise<void> }
export interface PropertyAnalysisProvider { analyze(input: PropertyAnalysisInput): Promise<unknown> }
export interface ValuationProvider { estimate(address: string): Promise<number | null> }
export interface MarketDataProvider { getMarket(slug: string): Promise<unknown | null> }
export interface RentalDataProvider { estimateMonthlyRent(address: string): Promise<number | null> }
export interface AIAnalysisProvider { summarize(input: PropertyAnalysisInput): Promise<string> }
export type LeadInput = { kind: "seller" | "investor" | "contact"; name: string; email: string; phone?: string; address?: string; city?: string; state?: string; zip?: string; propertyType?: string; bedrooms?: number; bathrooms?: number; squareFeet?: number; occupancy?: string; condition?: string; situation?: string; preferredContact?: string; interest?: string; message?: string };
export type PropertyAnalysisInput = { purchasePrice: number; renovationBudget: number; monthlyRent: number };

export class HubSpotCRMProvider implements CRMProvider {
  private readonly token = process.env.HUBSPOT_ACCESS_TOKEN;
  async createLead(lead: LeadInput) {
    if (!this.token) return;
    const [firstname, ...rest] = lead.name.trim().split(/\s+/);
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert", {
      method: "POST", headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: [{ id: lead.email, idProperty: "email", properties: { email: lead.email, firstname, lastname: rest.join(" "), phone: lead.phone || "" } }] }),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error(`HubSpot returned HTTP ${response.status}`);
  }
  async updateLead(id: string, values: Partial<LeadInput>) {
    if (!this.token) return;
    const properties: Record<string,string> = {};
    if (values.name) { const [firstname,...rest]=values.name.trim().split(/\s+/); properties.firstname=firstname; properties.lastname=rest.join(" "); }
    if (values.email) properties.email=values.email;
    if (values.phone) properties.phone=values.phone;
    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(id)}`, {
      method: "PATCH", headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ properties }), signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error(`HubSpot returned HTTP ${response.status}`);
  }
}

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

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char); }

export async function sendLeadEmails(lead: LeadInput) {
  const from = process.env.RESEND_FROM_EMAIL; const apiKey = process.env.RESEND_API_KEY;
  if (!from || !apiKey) return;
  const resend = new Resend(apiKey); const name = escapeHtml(lead.name);
  const type = lead.kind === "seller" ? "property inquiry" : lead.kind === "investor" ? "partnership inquiry" : "message";
  const confirmation = lead.kind === "seller" ? "Thank you for sharing your property details. Our team will review the opportunity and follow up with you." : "Thank you for reaching out to Stable & Noble Properties. Our team will review your note and follow up with you.";
  await resend.emails.send({ from, to: lead.email, subject: "We received your inquiry | Stable & Noble Properties", text: `Hello ${lead.name},\n\n${confirmation}\n\nStable & Noble Properties`, html: `<p>Hello ${name},</p><p>${confirmation}</p><p>Stable &amp; Noble Properties</p>` });
  const recipient = process.env.LEAD_NOTIFICATION_EMAIL;
  if (recipient) {
    const summary = [lead.address, lead.city, lead.state, lead.email, lead.phone, lead.interest].filter(Boolean).map(x=>escapeHtml(String(x))).join("<br/>");
    await resend.emails.send({ from, to: recipient, subject: `New ${type} from ${lead.name}`, text: `New ${type}\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || "Not provided"}\nAddress: ${lead.address || "Not provided"}`, html: `<p>New ${type} from ${name}</p><p>${summary}</p>` });
  }
}
