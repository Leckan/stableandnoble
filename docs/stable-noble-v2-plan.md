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

## Current status

This plan describes the intended architecture and original implementation sequence. Current completion and pending work have moved on; use [`stable-noble-v2-status.md`](./stable-noble-v2-status.md) for the latest repository and external-service review. In particular, migrations and storage functionality have since been added, while live service configuration, deployment verification, and end-to-end QA remain launch tasks. No testimonials, operating history, public portfolio, market activity, or investment returns are fabricated.
