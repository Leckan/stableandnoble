# Stable & Noble Properties V2

A premium real estate investment company website and platform foundation for Stable & Noble Properties LLC.

## Architecture

- Next.js App Router and TypeScript. Public marketing routes render on the server; interactive navigation, lead forms, and the calculator are small client components.
- Supabase/PostgreSQL is intended for operational data. A migration is in `supabase/migrations` with RLS enabled.
- CMS content is intended for Sanity. The current copy is local and can be moved into Sanity documents without changing the page shell.
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
| `RESEND_API_KEY` | Future email delivery | **Yes, server only** |
| `HUBSPOT_ACCESS_TOKEN` | Future CRM sync | **Yes, server only** |
| `OPENAI_API_KEY` | Future AI analysis | **Yes, server only** |
| `MAPBOX_TOKEN` | Future map experience | Keep server-side if scoped as secret |

## Database

Create a Supabase project, then apply `supabase/migrations/202610010001_initial_schema.sql` using the Supabase CLI or SQL editor. The lead API uses the service-role key only on the server. Keep RLS enabled and configure a first admin user and role before building admin write operations.

## Routes

Implemented: `/`, `/about`, `/what-we-do` and service pages, `/portfolio`, `/portfolio/[slug]` placeholder, `/sell-your-property`, `/invest`, `/invest/partners`, `/property-analyzer`, `/markets/[slug]` placeholder, `/insights` and article placeholder, `/contact`, `/privacy`, `/terms`, `/disclosures`, `/admin` placeholders, `/api/leads`, `/sitemap.xml`, `/robots.txt`.

## Checks

`npm run typecheck` and `npm run build` are the principal local checks. `npm run lint` is provided for consistency; Next.js 15 may require a separately configured ESLint setup.

## Production readiness

Before launch: configure Supabase and migrate the schema; add Supabase Auth and staff role provisioning; complete CRUD and lead-status workflows; add Sanity schemas and connect content; implement upload storage and shared edge/datastore rate limiting (the current throttle is process-local); connect email and CRM providers; replace placeholder legal text after legal review; add approved portfolio images/data; connect analytics; and run accessibility, browser, and responsive QA. Property calculations are illustrative only and do not use external market data.
