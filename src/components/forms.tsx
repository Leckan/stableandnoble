"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function LeadForm({ kind = "contact" }: { kind?: "seller" | "investor" | "contact" }) {
  const seller = kind === "seller";
  const investor = kind === "investor";
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = event.currentTarget; const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, kind }) });
      if (!response.ok) throw new Error("We couldn't send your note just now. Please try again.");
      setSent(true); form.reset();
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again in a moment."); }
  }
  if (sent) return <div className="form-success"><span className="success-icon">✓</span><h3>Thank you for reaching out.</h3><p>Your note is with our team. We’ll be in touch using your preferred contact details.</p></div>;
  return <form className="lead-form" onSubmit={submit}>
    {seller && <><div className="form-section-label">01 / THE PROPERTY</div><label>Property address<input name="address" autoComplete="street-address" required placeholder="Street address"/></label><div className="form-grid"><label>City<input name="city" autoComplete="address-level2" required/></label><label>State<input name="state" autoComplete="address-level1" required maxLength={2} placeholder="CA"/></label><label>ZIP code<input name="zip" autoComplete="postal-code" inputMode="numeric" required/></label><label>Property type<select name="propertyType" defaultValue=""><option value="" disabled>Select type</option>{["Single family", "Multifamily", "Commercial", "Land", "Other"].map(x => <option key={x}>{x}</option>)}</select></label><label>Bedrooms<input name="bedrooms" type="number" min="0"/></label><label>Bathrooms<input name="bathrooms" type="number" min="0" step="0.5"/></label><label>Approx. square feet<input name="squareFeet" type="number" min="0"/></label><label>Occupancy<select name="occupancy"><option>Occupied</option><option>Vacant</option><option>Owner occupied</option></select></label></div><label>Property condition<select name="condition"><option>Move-in ready</option><option>Needs cosmetic updates</option><option>Needs significant repairs</option><option>Not sure</option></select></label><label>What best describes your situation?<select name="situation"><option>Considering a sale</option><option>Inherited property</option><option>Relocating</option><option>Rental property</option><option>Property needs repairs</option><option>Other</option></select></label><label>Anything else we should know?<textarea name="message" rows={3}/></label><div className="form-section-label">02 / YOUR CONTACT DETAILS</div></>}
    {investor && <><div className="form-section-label">PARTNERSHIP INTEREST</div><label>I’m interested in<select name="interest"><option>Private lending</option><option>Acquisition partnership</option><option>Strategic partnership</option><option>Learning more</option></select></label><label>Briefly tell us about your interest<textarea name="message" rows={3}/></label></>}
    <div className="form-grid"><label>Your name<input name="name" autoComplete="name" required/></label><label>Email address<input name="email" type="email" autoComplete="email" required/></label><label>Phone number<input name="phone" type="tel" autoComplete="tel"/></label>{seller && <label>Preferred contact<select name="preferredContact"><option>Email</option><option>Phone</option><option>Text</option></select></label>}</div>
    {!seller && !investor && <label>How can we help?<textarea name="message" rows={4} required/></label>}
    <label className="consent"><input type="checkbox" required/><span>I agree that Stable & Noble Properties may contact me about this inquiry.</span></label>
    {error && <p className="form-error" role="alert">{error}</p>}<button className="button" type="submit">{seller ? "Send property details" : investor ? "Send partnership inquiry" : "Send message"}<span>↗</span></button><p className="form-privacy">Your information is used to respond to your inquiry. See our <Link href="/privacy">Privacy Policy</Link>.</p>
  </form>;
}

export function Analyzer() {
  const [result, setResult] = useState<null | { total: number; cap: number; yieldPct: number; equity: number; cashFlow: number; flipMargin: number | null }>(null);
  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const n = (key: string) => Number(data.get(key) || 0);
    const purchase = n("purchase"), renovation = n("renovation"), closing = n("closing"), rent = n("rent"), expenses = n("expenses"), down = n("down"), rate = n("rate"), arv = n("arv"), exitCosts = n("exitCosts");
    const total = purchase + renovation + closing; const noi = rent * 12 - expenses * 12;
    const loan = purchase * (1 - down / 100); const monthlyRate = rate / 1200;
    const monthlyDebt = monthlyRate > 0 ? loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -360)) : loan / 360;
    setResult({ total, cap: total > 0 ? (noi / total) * 100 : 0, yieldPct: total > 0 ? rent * 12 / total * 100 : 0, equity: purchase * down / 100 + renovation + closing, cashFlow: noi / 12 - monthlyDebt, flipMargin: arv > 0 ? arv - total - exitCosts : null });
  }
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return <div className="analyzer-layout"><form className="analyzer-form" onSubmit={calculate}><p className="eyebrow">MANUAL ASSUMPTIONS</p><h2>Start with what you know.</h2><p className="muted">Enter your own estimates. No market data is fetched or implied.</p><div className="form-grid"><label>Purchase price<input name="purchase" type="number" min="0" required placeholder="450000"/></label><label>Renovation budget<input name="renovation" type="number" min="0" placeholder="35000"/></label><label>Closing & other costs<input name="closing" type="number" min="0" placeholder="10000"/></label><label>Expected monthly rent<input name="rent" type="number" min="0" required placeholder="3200"/></label><label>Monthly operating expenses<input name="expenses" type="number" min="0" placeholder="850"/></label><label>Down payment (%)<input name="down" type="number" min="0" max="100" defaultValue="25"/></label><label>Annual interest rate (%)<input name="rate" type="number" min="0" step="0.1" defaultValue="7"/></label><label>Estimated resale value<input name="arv" type="number" min="0" placeholder="Optional"/></label><label>Estimated selling costs<input name="exitCosts" type="number" min="0" placeholder="Optional"/></label></div><button className="button">Calculate scenarios <span>↗</span></button></form><div className="analysis-result">{result ? <><p className="eyebrow">ILLUSTRATIVE RESULTS</p><h2>Your starting point.</h2><div className="metric-grid"><Metric name="Estimated project cost" value={fmt(result.total)}/><Metric name="Estimated equity" value={fmt(result.equity)}/><Metric name="Gross yield on project cost" value={`${result.yieldPct.toFixed(1)}%`}/><Metric name="Estimated cap rate" value={`${result.cap.toFixed(1)}%`}/><Metric name="Estimated monthly cash flow" value={fmt(result.cashFlow)}/>{result.flipMargin !== null && <Metric name="Illustrative flip margin" value={fmt(result.flipMargin)}/>}</div><p className="fine-print">Cash flow assumes a 30-year fully amortizing loan and excludes taxes, vacancy, reserves, insurance, management, and other costs. Flip margin subtracts only the project costs and selling costs you entered; it excludes taxes, financing and holding costs.</p><Link className="text-link" href="/contact">Discuss an opportunity <span>↗</span></Link></> : <div className="result-placeholder"><span className="result-mark">S&N</span><h3>Model the opportunity.</h3><p>Enter assumptions to see a transparent first-pass view of project cost, rental yield, cap rate and equity.</p></div>}</div></div>;
}
function Metric({ name, value }: { name: string; value: string }) { return <div className="metric"><span>{name}</span><strong>{value}</strong></div>; }
