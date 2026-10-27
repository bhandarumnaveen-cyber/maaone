# Maa One — maaone.in

The official website for **Maa One** — *Poora business, ek app mein*.
Maa One is a product of Maa Labs Private Limited · Built by NaveenCodes.

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (auth, database, storage) ·
Razorpay Subscriptions · Resend (email) · MDX (blog, changelog) · Vercel.

## Develop
```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
npm run lint && npm run build
```

## Configuration
- **Supabase** (`supabase/maaone_schema.sql`, already applied) holds the live settings:
  `site_settings` (`sales_open`, `launch_date`, `trial_days`, `gst_rate`, `company_state`, contacts, `app_url`)
  and `plans`. Pages re-read them every 5 minutes — no redeploy needed.
- [`src/site.config.ts`](src/site.config.ts): roadmap versions, modules, FAQs, brand credits, and fallback
  settings/plans used only if Supabase can't be reached.
- `content/blog/*.mdx` and `content/changelog/*.mdx`: posts and releases (files starting with `_` or
  marked `draft: true` are not published; see `content/changelog/_template.mdx`).
- Environment variables: see `.env.example`. `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`,
  `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY` and `CRON_SECRET` are server-only.

## Going live checklist
1. **Supabase Auth**: add `{{ .Token }}` to the Magic Link and Confirm signup email templates (6-digit codes).
   For phone login, connect an SMS provider under Auth → Providers → Phone. Add `https://maaone.in` to
   Auth → URL Configuration.
2. **Admin**: log in once at `/login`, then run the "MAKE YOURSELF ADMIN" line at the end of the schema file.
3. **Razorpay** (test mode first):
   - Create one plan per plan and period. Amount = price **including GST**
     (`plans.price_inr_monthly_with_gst` / `price_inr_yearly_with_gst`), period monthly or yearly.
   - Save the plan IDs in `plans.razorpay_plan_id_monthly` / `razorpay_plan_id_yearly`.
   - Webhook URL `https://maaone.in/api/razorpay/webhook` with events: `subscription.*`
     (authenticated, activated, charged, pending, halted, cancelled, completed, paused, resumed, updated)
     and `payment.failed`. Put its secret in `RAZORPAY_WEBHOOK_SECRET`.
   - Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
4. **Email**: set `RESEND_API_KEY` and `EMAIL_FROM` (verify the maalabs.in domain in Resend).
   Without a key, emails are skipped and logged.
5. **Invoices**: set `INVOICE_SELLER_GSTIN` and `INVOICE_SELLER_ADDRESS` (printed on PDFs only), check
   `site_settings.company_state`, and have your CA confirm the SAC code (`INVOICE_SAC`, default 997331).
6. **Cron**: set `CRON_SECRET` in Vercel; `vercel.json` runs renewal reminders daily at 09:00 IST.
7. **Launch**: `update site_settings set value = 'true' where key = 'sales_open';`

## How purchase works (sales_open = true)
Plan → `/signup` (OTP login) → billing details → `/api/checkout` creates a Razorpay subscription
(first subscription starts after the free trial) → Razorpay Checkout → `/api/checkout/verify` →
`/account?welcome=1`. The verified webhook is the source of truth: it stores each event in
`webhook_events` (duplicates skipped), upserts `subscriptions` and `payments`, and for every captured
charge calls `issue_invoice()`, renders the GST PDF, uploads it to `invoices/<user_id>/<number>.pdf`,
saves `pdf_path` and emails it. Failed payments, cancellations, upgrades (immediate) and downgrades
(at renewal) are handled from `/account`.

## Build phases
1. ✅ Design system, marketing pages, footer, legal drafts
2. ✅ Supabase settings/plans, OTP login, waitlist, feature requests, contact, admin
3. ✅ Razorpay Subscriptions, webhook, GST invoice PDFs, emails, account area, renewal reminders
4. ✅ MDX blog and changelog, sitemap, robots, JSON-LD, Open Graph images
