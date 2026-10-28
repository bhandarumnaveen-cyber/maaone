# Security policy

Maa One (one.maalabs.in) is run by Maa Labs Private Limited.

## Reporting a problem

Please do not open a public issue for security problems. Email **hello@maalabs.in** with
"Security" in the subject, or use GitHub's **Report a vulnerability** button on the Security tab.
Include the page or endpoint, steps to reproduce and what an attacker could do.

We reply within 3 working days and tell you when it is fixed. Please give us 30 days before
sharing details publicly. Testing must not touch other customers' data or disrupt the service.

## For contributors

- Never commit keys. Real values live only in `.env.local` (ignored) and Hostinger environment variables;
  `.env.example` holds placeholders. CI scans every push for secrets.
- `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`,
  `TURNSTILE_SECRET_KEY` and `CRON_SECRET` are server-only: never prefix them with `NEXT_PUBLIC_`
  and only read them in files that import `server-only`.
- If a key is ever pasted in a chat, issue or commit, rotate it at once; deleting the text is not enough.
