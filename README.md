# Stable & Noble Properties V2

A premium real estate investment company website and platform foundation for Stable & Noble Properties LLC.

## Architecture

- Next.js App Router and TypeScript. Public marketing routes render on the server; interactive navigation, lead forms, and the calculator are small client components.
- Supabase/PostgreSQL is intended for operational data. A migration is in `supabase/migrations` with RLS enabled.
- Sanity Studio schemas live in `src/sanity/schemas.ts`; launch the standalone Studio with `npm run studio`. Homepage copy reads the published `siteSettings` document and falls back to local editorial defaults.
- Supabase Auth protects `/admin`; staff role checks use the `public.users` profile table. Public portfolio pages read only published properties through the anon key.
- Provider contracts in `src/lib/providers.ts` prepare for CRM, email, valuation, rental data, market data, and AI integrations.

## Local development

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Run `npm run dev` and open http://localhost:3000.

The public site and manual-input calculator can be explored without third-party credentials. Lead submissions require Supabase URL and service role key; without them the API returns an intentional configuration error and does not pretend to store the lead.

## Environment variables

| Variable | Required for | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical links and sitemap | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase connection | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Future browser-side Supabase Auth | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side lead persistence | **Yes, server only** |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Future Sanity content | No |
| `NEXT_PUBLIC_SANITY_DATASET` | Future Sanity content | No |
| `SANITY_API_TOKEN` | Preview/draft CMS access | **Yes, server only** |
| `RESEND_API_KEY` | Inquiry confirmation email delivery | **Yes, server only** |
| `RESEND_FROM_EMAIL` | Verified sender address for inquiry emails | No |
| `LEAD_NOTIFICATION_EMAIL` | Optional internal lead notification recipient | No |
| `HUBSPOT_ACCESS_TOKEN` | Lead contact upsert to HubSpot | **Yes, server only** |
| `OPENAI_API_KEY` | Future AI analysis | **Yes, server only** |
| `MAPBOX_TOKEN` | Future map experience | Keep server-side if scoped as secret |

## Database

Create and link a Supabase project, then apply both migrations in timestamp order using the Supabase CLI or SQL editor:

1. `supabase/migrations/202610010001_initial_schema.sql` creates the operational schema and access policies.
2. `supabase/migrations/202610020001_asset_storage.sql` creates the private seller-inquiry photo bucket and public property-image bucket with their storage policies.
3. `supabase/migrations/202610030001_analytics_events.sql` creates a minimal first-party event table for public page views and conversion activity.

The application never applies migrations automatically. After applying them, create/invite a team account in Supabase Auth, then grant its profile staff access in the SQL editor:

```sql
insert into public.users (id, full_name, role)
select id, 'Team Admin', 'admin'
from auth.users
where email = 'admin@example.com'
on conflict (id) do update set role = 'admin';
```

The lead API uses the service-role key only on the server. Public reads use the anon key under RLS. Never put service-role, Sanity, Resend, HubSpot, or OpenAI secrets in `NEXT_PUBLIC_` variables.

## Sanity

Run `npm run studio` from the repository root. The Studio uses the configured project ID and dataset. Create a `siteSettings` document and publish it to update the homepage hero and introduction. Other editorial schemas are ready for pages, insights, team, FAQs, case studies, and markets. Published insights and market records still need their public listing/detail UI wired before use.

## Email

Inquiry confirmation delivery requires `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL`. Internal notifications are sent only when `LEAD_NOTIFICATION_EMAIL` is configured. Neither address is currently configured in `.env`, so email hooks remain inactive. The app does not send an email during setup or build.

## Routes

Implemented: `/`, `/about`, `/what-we-do` and service pages, `/portfolio` and database-backed property details, `/sell-your-property` and `/sell-your-property/thank-you`, `/invest`, `/invest/partners`, `/property-analyzer`, `/markets/[slug]` placeholder, `/insights` and article placeholder, `/contact`, `/privacy`, `/terms`, `/disclosures`, `/admin` operations dashboard, `/api/leads`, `/api/analytics`, `/sitemap.xml`, `/robots.txt`.

## Checks

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` for local checks. The current Vitest suite covers the manual property-analysis calculations.

## Production readiness

Before launch: apply all three Supabase migrations; create Auth users and assign staff roles; create/publish site settings in Sanity; configure a verified Resend sender and internal lead recipient; replace the process-local lead and analytics throttles with a shared edge/datastore limiter; verify HubSpot token scopes and contact sync; connect external AI/market data providers; replace placeholder legal text after legal review; add approved property photos/data; and run browser, accessibility, and responsive QA. Seller photo uploads accept up to five JPEG, PNG, or WebP images, at 5 MB each and 25 MB total. The analytics pipeline stores event names and clean URL paths only; it does not store IP addresses, form contents, or personal data. Property calculations are illustrative only and do not use external market data.
