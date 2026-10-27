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
Everything content-related lives in [`src/site.config.ts`](src/site.config.ts):
- `SALES_OPEN` — `false` turns every buy/trial button into "Join the waitlist"
- launch date, contact details, versions (roadmap), modules (features), plans, comparison table, FAQs

## Build phases
1. **Done:** design system, Home, Features, Roadmap, Pricing (waitlist mode), About, Contact, footer, legal drafts
2. Supabase auth, waitlist storage + position, feature requests, admin
3. Razorpay Subscriptions, webhooks, GST invoices, account area
4. Blog and changelog (MDX), sitemap, robots, JSON-LD, OG images

Forms currently validate and return `preview: true` without storing anything; Phase 2 connects them to Supabase.
