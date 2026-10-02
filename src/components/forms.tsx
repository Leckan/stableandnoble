"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculatePropertyAnalysis } from "@/lib/property-analysis";

export function LeadForm({ kind = "contact" }: { kind?: "seller" | "investor" | "contact" }) {
  return kind === "seller" ? <SellerLeadForm /> : <GeneralLeadForm kind={kind} />;
}

function SellerLeadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const steps = ["Address", "Property", "Situation", "Photos", "Contact"];
  function validateStep(index: number) {
    const section = formRef.current?.querySelector<HTMLElement>(`[data-step="${index}"]`);
    const fields = section?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea") || [];
    for (const field of fields) if (!field.checkValidity()) { field.reportValidity(); field.focus(); return; }
    return true;
  }
  function nextStep() {
    if (!validateStep(step)) return;
    setStep(value => Math.min(value + 1, steps.length - 1));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep(step)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/leads", { method: "POST", body: new FormData(event.currentTarget) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "We couldn't send your property details. Please try again.");
      formRef.current?.reset();
      router.push("/sell-your-property/thank-you");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again in a moment."); }
    finally { setBusy(false); }
  }
  return <form ref={formRef} noValidate className="lead-form seller-wizard" onSubmit={submit}>
    <input type="hidden" name="kind" value="seller" />
    <div className="wizard-progress" aria-label={`Step ${step + 1} of ${steps.length}`}><div className="wizard-progress-track"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }}/></div><div className="wizard-step-label"><span>STEP 0{step + 1} / 0{steps.length}</span><strong>{steps[step]}</strong></div></div>
    <section data-step="0" hidden={step !== 0}><div className="form-section-label">PROPERTY LOCATION</div><label>Street address<input name="address" autoComplete="street-address" required placeholder="Street address"/></label><div className="form-grid"><label>City<input name="city" autoComplete="address-level2" required/></label><label>State<input name="state" autoComplete="address-level1" required maxLength={2} placeholder="CA"/></label><label>ZIP code<input name="zip" autoComplete="postal-code" inputMode="numeric" required/></label></div></section>
    <section data-step="1" hidden={step !== 1}><div className="form-section-label">PROPERTY DETAILS</div><div className="form-grid"><label>Property type<select name="propertyType" defaultValue="" required><option value="" disabled>Select type</option>{["Single family", "Multifamily", "Commercial", "Land", "Other"].map(x => <option key={x}>{x}</option>)}</select></label><label>Occupancy<select name="occupancy"><option>Occupied</option><option>Vacant</option><option>Owner occupied</option></select></label><label>Bedrooms<input name="bedrooms" type="number" min="0" max="100" step="1"/></label><label>Bathrooms<input name="bathrooms" type="number" min="0" max="100" step="0.5"/></label><label>Approx. square feet<input name="squareFeet" type="number" min="0" max="10000000" step="1"/></label><label>Property condition<select name="condition"><option>Move-in ready</option><option>Needs cosmetic updates</option><option>Needs significant repairs</option><option>Not sure</option></select></label></div></section>
    <section data-step="2" hidden={step !== 2}><div className="form-section-label">YOUR SITUATION</div><label>What best describes your situation?<select name="situation"><option>Considering a sale</option><option>Need to sell quickly</option><option>Inherited property</option><option>Relocating</option><option>Rental property</option><option>Vacant property</option><option>Property needs repairs</option><option>Other</option></select></label><label>Anything else we should know?<textarea name="message" rows={5} placeholder="Share any details that would help us understand the opportunity."/></label></section>
    <section data-step="3" hidden={step !== 3}><div className="form-section-label">OPTIONAL PROPERTY PHOTOS</div><p className="upload-note">Add up to five JPG, PNG, or WebP images. Please avoid uploading documents or images containing sensitive information.</p><label className="upload-control">Choose photos<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple/></label></section>
    <section data-step="4" hidden={step !== 4}><div className="form-section-label">HOW SHOULD WE REACH YOU?</div><div className="form-grid"><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={120}/></label><label>Email address<input name="email" type="email" autoComplete="email" required/></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={32}/></label><label>Preferred contact<select name="preferredContact"><option>Email</option><option>Phone</option><option>Text</option></select></label></div><label className="consent"><input name="consent" type="checkbox" value="yes" required/><span>I agree that Stable & Noble Properties may contact me about this inquiry.</span></label></section>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="wizard-actions">{step > 0 && <button className="button button-quiet" type="button" onClick={() => setStep(value => Math.max(value - 1, 0))}>← Back</button>}{step < steps.length - 1 ? <button className="button" type="button" onClick={nextStep}>Continue <span>↗</span></button> : <button className="button" type="submit" disabled={busy}>{busy ? "Sending…" : "Send property details"}<span>↗</span></button>}</div>
    <p className="form-privacy">Your information is used to review your inquiry. See our <Link href="/privacy">Privacy Policy</Link>.</p>
  </form>;
}

function GeneralLeadForm({ kind }: { kind: "investor" | "contact" }) {
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
    {investor && <><div className="form-section-label">PARTNERSHIP INTEREST</div><label>I’m interested in<select name="interest"><option>Private lending</option><option>Acquisition partnership</option><option>Strategic partnership</option><option>Learning more</option></select></label><label>Briefly tell us about your interest<textarea name="message" rows={3}/></label></>}
    <div className="form-grid"><label>Your name<input name="name" autoComplete="name" required/></label><label>Email address<input name="email" type="email" autoComplete="email" required/></label><label>Phone number<input name="phone" type="tel" autoComplete="tel"/></label></div>
    {!investor && <label>How can we help?<textarea name="message" rows={4} required/></label>}
    <label className="consent"><input type="checkbox" required/><span>I agree that Stable & Noble Properties may contact me about this inquiry.</span></label>
    {error && <p className="form-error" role="alert">{error}</p>}<button className="button" type="submit">{investor ? "Send partnership inquiry" : "Send message"}<span>↗</span></button><p className="form-privacy">Your information is used to respond to your inquiry. See our <Link href="/privacy">Privacy Policy</Link>.</p>
  </form>;
}

export function Analyzer() {
  const [result, setResult] = useState<ReturnType<typeof calculatePropertyAnalysis> | null>(null);
  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const n = (key: string) => Number(data.get(key) || 0);
    setResult(calculatePropertyAnalysis({ purchasePrice: n("purchase"), renovationBudget: n("renovation"), closingCosts: n("closing"), monthlyRent: n("rent"), monthlyExpenses: n("expenses"), downPaymentPercent: n("down"), annualInterestPercent: n("rate"), estimatedResaleValue: n("arv"), sellingCosts: n("exitCosts") }));
  }
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return <div className="analyzer-layout"><form className="analyzer-form" onSubmit={calculate}><p className="eyebrow">MANUAL ASSUMPTIONS</p><h2>Start with what you know.</h2><p className="muted">Enter your own estimates. No market data is fetched or implied.</p><div className="form-grid"><label>Purchase price<input name="purchase" type="number" min="0" required placeholder="450000"/></label><label>Renovation budget<input name="renovation" type="number" min="0" placeholder="35000"/></label><label>Closing & other costs<input name="closing" type="number" min="0" placeholder="10000"/></label><label>Expected monthly rent<input name="rent" type="number" min="0" required placeholder="3200"/></label><label>Monthly operating expenses<input name="expenses" type="number" min="0" placeholder="850"/></label><label>Down payment (%)<input name="down" type="number" min="0" max="100" defaultValue="25"/></label><label>Annual interest rate (%)<input name="rate" type="number" min="0" step="0.1" defaultValue="7"/></label><label>Estimated resale value<input name="arv" type="number" min="0" placeholder="Optional"/></label><label>Estimated selling costs<input name="exitCosts" type="number" min="0" placeholder="Optional"/></label></div><button className="button">Calculate scenarios <span>↗</span></button></form><div className="analysis-result">{result ? <><p className="eyebrow">ILLUSTRATIVE RESULTS</p><h2>Your starting point.</h2><div className="metric-grid"><Metric name="Estimated project cost" value={fmt(result.projectCost)}/><Metric name="Estimated equity" value={fmt(result.equityRequired)}/><Metric name="Gross yield on project cost" value={`${result.grossYieldPercent.toFixed(1)}%`}/><Metric name="Estimated cap rate" value={`${result.capRatePercent.toFixed(1)}%`}/><Metric name="Estimated monthly cash flow" value={fmt(result.estimatedMonthlyCashFlow)}/>{result.cashOnCashPercent !== null && <Metric name="Illustrative cash-on-cash return" value={`${result.cashOnCashPercent.toFixed(1)}%`}/ >}{result.flipMargin !== null && <Metric name="Illustrative flip margin" value={fmt(result.flipMargin)}/>}</div><p className="fine-print">Cash flow assumes a 30-year fully amortizing loan and excludes taxes, vacancy, reserves, insurance, management, and other costs. Flip margin subtracts only the project costs and selling costs you entered; it excludes taxes, financing and holding costs.</p><Link className="text-link" href="/contact">Discuss an opportunity <span>↗</span></Link></> : <div className="result-placeholder"><span className="result-mark">S&N</span><h3>Model the opportunity.</h3><p>Enter assumptions to see a transparent first-pass view of project cost, rental yield, cap rate and equity.</p></div>}</div></div>;
}
function Metric({ name, value }: { name: string; value: string }) { return <div className="metric"><span>{name}</span><strong>{value}</strong></div>; }
