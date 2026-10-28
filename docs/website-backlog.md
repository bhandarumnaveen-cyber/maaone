# Maa One website — backlog and switches

Last updated: 28 October 2026

## Built and waiting only for keys (add in Hostinger → Environment variables, then redeploy)

| Feature | Variables | Where to get them |
|---|---|---|
| Analytics with cookie consent | `NEXT_PUBLIC_CLARITY_ID` and/or `NEXT_PUBLIC_GA_ID` | clarity.microsoft.com → new project → Settings → project ID; analytics.google.com → Admin → Data streams → Measurement ID (`G-…`) |
| Spam protection on forms | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | dash.cloudflare.com → Turnstile → Add widget → domain `one.maalabs.in` |
| Emails (waitlist, invoices, reminders) | `RESEND_API_KEY`, `EMAIL_FROM` | resend.com → verify `maalabs.in` → API Keys (planned with app v1) |
| Payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` + plan IDs in /admin/settings | Razorpay dashboard (before 24 January 2027) |
| Renewal reminders | `CRON_SECRET` + Hostinger cron job | see README |
| GST invoice seller details | `INVOICE_SELLER_GSTIN`, `INVOICE_SELLER_ADDRESS`, `INVOICE_SAC` | your CA |

## After the pilot (December 2026)

- **Testimonials and logos** from pilot businesses on the home page and industry pages (real names, photos with permission).
- **Demo video** (60–90 seconds) of the real app in the hero and on Features.
- **Real screenshots** of v1 replacing the concept mockups where they differ.
- **Case study** blog posts: "How <business> replies 10× faster".

## Before / around launch (January 2027)

- **Help centre** (`/help`): connect WhatsApp, add the website widget, invite staff, billing and GST invoices, cancel.
- **Error monitoring** with Sentry (free tier) for the website and the app.
- **Live AI demo** on the home page using the real model (rate-limited), replacing the sample replies.
- **Status page** for app uptime.

## Later

- Hindi version of Features, Pricing and the industry pages (home is at `/hi`); Punjabi home page (`/pa`).
- More industry pages: pest control, cleaning, events and weddings, travel agencies, gyms.
- Comparison pages (Maa One vs. spreadsheets / generic CRMs / WhatsApp Business app).
- Referral rewards once sales are open (free month for each referred paying customer).
- Customer reviews on Google, linked from the site.

## Content to review

- Founder note on About, both blog posts, FAQ answers.
- Legal pages ("[To be reviewed by a lawyer]").
- Sample AI replies in `src/data/demo-replies.ts` (Hindi and Punjabi wording, example prices).
- Industry page copy in `src/data/industries.ts`.
- Waitlist share text promises that businesses who refer others are invited to the pilot first — honour it using the Referrals column in /admin/waitlist.
