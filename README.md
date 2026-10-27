# Maa One — maaone.in

The official website for **Maa One** — *Poora business, ek app mein*.
Maa One is a product of Maa Labs Private Limited · Built by NaveenCodes.

## Stack
Next.js (App Router) · TypeScript · Tailwind CSS v4 · deployed on Vercel.
Supabase, Razorpay Subscriptions and email arrive in later phases.

## Develop
```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Configuration
- **Supabase** (`supabase/maaone_schema.sql`, already applied) holds the live settings:
  `site_settings` (`sales_open`, `launch_date`, `trial_days`, `gst_rate`, contacts, `app_url`) and `plans`.
  The site re-reads them every 5 minutes, so edits in Supabase need no redeploy.
- [`src/site.config.ts`](src/site.config.ts) holds the roadmap, modules, FAQs, brand credits and
  fallback settings/plans used only if Supabase can't be reached.
- Environment variables: see `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` is server-only.

## Build phases
1. **Done:** design system, Home, Features, Roadmap, Pricing (waitlist mode), About, Contact, footer, legal drafts
2. **Done:** Supabase settings/plans, OTP login, waitlist (`join_waitlist`), feature requests, contact messages, `/admin`
3. Razorpay Subscriptions, webhooks, GST invoices, account area
4. Blog and changelog (MDX), sitemap, robots, JSON-LD, OG images

Admin: sign up via `/login`, then run the "MAKE YOURSELF ADMIN" line at the bottom of the schema file.
