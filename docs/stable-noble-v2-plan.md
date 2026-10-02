# Stable & Noble Properties V2 — implementation plan

## Discovery

- **Existing architecture:** the supplied workspace was empty (no package manifest, source tree, Git metadata, routes, or assets).
- **Existing site:** the referenced website could not be fetched from this environment, so no live copy or assets were assumed.
- **Reusable material:** only the company name, founder identity, positioning, and requirements provided in the attached brief.
- **Replace:** the empty workspace becomes a Next.js App Router TypeScript application.

## Target architecture

- Next.js App Router with server-rendered public pages and small client components for forms, navigation, and the manual property calculator.
- Marketing copy is structured to move into Sanity; operational records live in Supabase/Postgres.
- Supabase service-role access stays server-side in the lead API. The database migration enables RLS and has no anonymous write policies.
- Provider interfaces isolate CRM, email, market, valuation, rental, analysis, and AI services.
- SEO metadata, sitemap, robots policy, and security response headers live in the Next app.

## Implementation sequence

1. Establish the design system and responsive shell.
2. Build the homepage and public informational routes with honest empty states.
3. Add seller, investor, and contact inquiry forms plus server validation and persistence adapter.
4. Add manual-input property analysis with explicit assumptions and disclaimers.
5. Add Supabase schema, indexes, constraints, and RLS foundation.
6. Document local setup and integrations; run available static/build checks.

## Scope notes

The implementation now includes Supabase Auth gating for the admin, staff-facing property/lead/deal pages, public published-property reads, Sanity Studio schemas and homepage copy reads, Resend inquiry-email hooks, and HubSpot contact upsert hooks. The migration has not been applied and no external writes or emails were made while building. Resend sender and notification-recipient variables are not configured. Object storage uploads, analytics provider wiring, and automated browser tests remain before production launch. The API currently has a process-local throttle; replace it with shared rate limiting at the edge or in a datastore for multi-instance deployment. No testimonials, operating history, public portfolio, market activity, or investment returns are fabricated.
