# Stable & Noble Properties V2 — build status

Last reviewed: 2026-10-02

## Completed in the repository

- Next.js App Router application with a responsive premium visual system, shared navigation/footer, accessible mobile menu, and public marketing routes.
- Homepage, company/service pages, seller, investor and contact funnels, property analyzer, portfolio/catalog and property detail views, FAQ, legal information pages, and admin routes.
- Multi-step seller intake with optional image uploads, server-side Zod validation, Supabase persistence, a storage provider, optional Resend email, and optional HubSpot CRM adapter.
- Manual-input property-analysis calculations with scenario metrics and financial disclaimers; provider interfaces leave room for valuation, rental, market, AI, email, and CRM services.
- Supabase migrations for the operating schema, property/seller image storage, and analytics events; RLS and staff-gated admin operations are represented in the SQL and server access layer.
- Supabase Auth staff workspace with property and image management, lead statuses, deal pipeline, and analytics views.
- Sanity schemas for site settings, navigation, pages, articles, case studies, FAQs, testimonials, team members, markets, and SEO. Public site settings, navigation, FAQs, and global SEO defaults are connected to the configured dataset.
- Published Sanity article list/detail integration, metadata, Article structured data, related-article links, and article/property sitemap entries (implemented in this increment).
- Base metadata, canonical metadata where content is dynamic, robots policy, sitemap, and security response headers.

## Pending or requiring external verification

- **Sanity editing:** the standalone Studio runs at `http://localhost:3334`; the project CORS allow-list still needs that credentialed origin before Studio can edit the linked dataset.
- **Sanity content:** no published insight articles were found during the previous dataset check. The new list therefore shows its intentional empty state until editorial content is published.
- **Supabase deployment:** migrations are present locally. The user reported applying the database and storage migrations; live RLS, Auth staff role provisioning, and storage policies still need deployment verification.
- **Analytics:** the linked Supabase API returned 404, `Could not find the table 'public.analytics_events' in the schema cache`, for a read-only table check. This explains the local `/api/analytics` HTTP 503. Apply `supabase/migrations/202610030001_analytics_events.sql`, then confirm events persist.
- **Email/CRM:** Resend and HubSpot are optional adapters; credentials, sender identity, notification recipient, and live delivery/upsert behavior need configuration and verification.
- **Content integration:** Sanity has schemas for pages, case studies, testimonials, team members, and market pages, but these are not yet fully connected to public routes. Homepage sections and several service/market narratives remain code-authored.
- **Legal:** privacy, terms, and disclosure copy is placeholder language requiring company and legal review before launch.
- **Automated QA:** no automated browser-flow test suite was found in the repository. Run a production build and exercise seller, property discovery, analyzer, and staff workflows against the linked services before launch.
- **Production:** configure the production URL, verify all production environment variables and CORS entries, check SEO/structured data and mobile layouts, and complete deployment review.
- **Sanity project cleanup:** six documents created while the open Studio was connected to the wrong project `lmcac878` remain there pending an explicit cleanup decision.

## This increment

Insights now loads published, dated `blogPost` documents from Sanity. Article pages render Portable Text paragraphs, headings, lists, block quotes, inline images, and safe links. Each article includes canonical/Open Graph/Twitter metadata, Article JSON-LD, and up to three related articles from its category. The sitemap includes currently published articles and public properties. Empty datasets continue to render a designed empty state; no sample article or business claims were invented.

Verification: production build, typecheck, lint, `git diff --check`, and the three existing Vitest tests pass. The Insights page was opened in the in-app browser and rendered its expected editorial empty state. The local server also logged `/api/analytics` returning HTTP 503, which remains an integration item to diagnose against the linked Supabase deployment.
