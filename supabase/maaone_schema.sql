-- =====================================================================
--  MAA ONE WEBSITE (maaone.in) — COMPLETE SUPABASE DATABASE
--  A Maa Labs product · Built by NaveenCodes
--  Founder & Director: Naveen Goyal
--
--  HOW TO RUN
--  1. Create a NEW Supabase project.
--  2. Open SQL Editor → New query → paste this whole file → Run.
--  3. Sign up once on your website with your own email, then run the
--     "MAKE YOURSELF ADMIN" line at the very bottom of this file.
--
--  Run this file ONCE on a fresh project. It runs inside a transaction:
--  if anything fails, nothing is created, so you can fix and run again.
--
--  MONEY RULE: every amount is stored as a whole number in paise (INR)
--  or cents (USD). ₹499.00 is stored as 49900. Never use decimals.
--
--  Version 1.0 · 27 October 2026
-- =====================================================================

begin;

-- No extensions needed: gen_random_uuid() is built into Postgres 13+.
-- Emails are always stored in lowercase (enforced by checks below).


-- =====================================================================
-- 0. SHARED HELPERS
-- =====================================================================

-- Keeps updated_at correct on every UPDATE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =====================================================================
-- 1. SITE SETTINGS  (public, read-only for visitors)
--    Change values from SQL Editor or the admin page — no redeploy.
-- =====================================================================

create table public.site_settings (
  key          text primary key,
  value        jsonb not null,
  description  text,
  updated_at   timestamptz not null default now()
);

insert into public.site_settings (key, value, description) values
  ('sales_open',     'false',                     'false = all buy/trial buttons open the waitlist. true = real signup + payment.'),
  ('launch_date',    '"2027-01-24"',              'Paid launch date shown in the countdown'),
  ('trial_days',     '14',                        'Free trial length in days'),
  ('gst_rate',       '18',                        'GST percentage added on top of plan prices'),
  ('company_state',  '"Punjab"',                  'State of Maa Labs GST registration. Same state = CGST + SGST, other state = IGST. CHECK THIS.'),
  ('support_email',  '"hello@maalabs.in"',        'Support email shown on the site'),
  ('naveencodes_email', '"connect@naveencodes.com"', 'Shown next to the Built by NaveenCodes credit'),
  ('whatsapp',       '"+918053385815"',           'WhatsApp number for the chat button'),
  ('instagram',      '"maalabs18"',               'Instagram handle'),
  ('app_url',        '"https://one.maalabs.in"',  'Where the Open Maa One button goes');

create trigger trg_site_settings_updated
  before update on public.site_settings
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 2. PLANS  (public, read-only for visitors)
-- =====================================================================

create table public.plans (
  code                      text primary key check (code ~ '^[a-z][a-z0-9_]{1,30}$'),
  name                      text not null,
  tagline                   text,
  -- prices BEFORE GST
  price_inr_monthly         integer not null check (price_inr_monthly >= 0),  -- paise
  price_inr_yearly          integer not null check (price_inr_yearly  >= 0),  -- paise
  price_usd_monthly         integer not null check (price_usd_monthly >= 0),  -- cents
  price_usd_yearly          integer not null check (price_usd_yearly  >= 0),  -- cents
  -- what the customer actually pays in India (price + 18% GST); use this
  -- amount when you create the matching plan in the Razorpay dashboard
  price_inr_monthly_with_gst integer generated always as (round(price_inr_monthly * 1.18)::integer) stored,
  price_inr_yearly_with_gst  integer generated always as (round(price_inr_yearly  * 1.18)::integer) stored,
  max_users                 integer,           -- null = no fixed limit
  max_businesses            integer not null default 1,
  ai_drafts_per_month       integer,           -- null = decide before launch
  features                  jsonb not null default '[]',
  is_popular                boolean not null default false,
  is_active                 boolean not null default true,
  sort_order                integer not null default 0,
  -- fill these after creating plans in the Razorpay dashboard
  razorpay_plan_id_monthly  text unique,
  razorpay_plan_id_yearly   text unique,
  updated_at                timestamptz not null default now()
);

insert into public.plans
  (code, name, tagline, price_inr_monthly, price_inr_yearly, price_usd_monthly, price_usd_yearly,
   max_users, max_businesses, ai_drafts_per_month, features, is_popular, sort_order)
values
  ('starter', 'Starter', 'For a single owner getting started',
   49900,  499000, 1200, 12000, 1, 1, 300,
   '["Inbox for website forms + WhatsApp", "AI lead scoring and reply drafts", "Basic CRM", "1 user"]', false, 1),
  ('growth',  'Growth',  'Every live module for a small team',
   149900, 1499000, 2900, 29000, 3, 1, 1000,
   '["Everything in Starter", "Every live module", "3 users", "Mobile app"]', true, 2),
  ('pro',     'Pro',     'For teams with technicians in the field',
   299900, 2999000, 5900, 59000, 10, 1, null,
   '["Everything in Growth", "10 users", "Technician app", "Campaigns", "Priority support"]', false, 3),
  ('agency',  'Agency',  'Run many businesses under your own brand',
   499900, 4999000, 9900, 99000, null, 10, null,
   '["Up to 10 businesses", "White-label branding", "Everything in Pro"]', false, 4);

create trigger trg_plans_updated
  before update on public.plans
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 3. PROFILES  (one row per signed-up user, created automatically)
-- =====================================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text check (email is null or email = lower(email)),
  phone       text,
  full_name   text check (full_name is null or char_length(full_name) <= 120),
  is_admin    boolean not null default false,   -- only changeable from SQL Editor
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Creates the profile the moment someone signs up (email or phone OTP)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, full_name)
  values (new.id, lower(new.email), new.phone, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- True when the logged-in user is an admin (used by every admin policy)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;


-- =====================================================================
-- 4. WAITLIST  (before launch)
--    Visitors never read or write this table directly; they call
--    join_waitlist(), which returns their position.
-- =====================================================================

create table public.waitlist (
  id             uuid primary key default gen_random_uuid(),
  position       bigint generated always as identity unique,
  name           text not null check (char_length(name) between 1 and 120),
  business_name  text check (business_name is null or char_length(business_name) <= 160),
  business_type  text check (business_type is null or char_length(business_type) <= 80),
  city           text check (city is null or char_length(city) <= 80),
  phone          text check (phone is null or phone ~ '^\+?[0-9 ]{8,16}$'),
  email          text not null unique check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  plan_interest  text references public.plans(code),
  source         text check (source is null or char_length(source) <= 200),  -- utm_source, referrer
  status         text not null default 'waiting'
                   check (status in ('waiting', 'invited', 'converted', 'removed')),
  invited_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index waitlist_created_idx on public.waitlist (created_at desc);

create trigger trg_waitlist_updated
  before update on public.waitlist
  for each row execute function public.set_updated_at();

-- Join the waitlist. Joining again with the same email returns the
-- original position instead of creating a duplicate.
create or replace function public.join_waitlist(
  p_name           text,
  p_email          text,
  p_phone          text default null,
  p_business_name  text default null,
  p_business_type  text default null,
  p_city           text default null,
  p_plan_interest  text default null,
  p_source         text default null
)
returns table (waitlist_position bigint, total_on_waitlist bigint, already_joined boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_position bigint;
  v_inserted boolean;
begin
  insert into public.waitlist
    (name, email, phone, business_name, business_type, city, plan_interest, source)
  values
    (trim(p_name), lower(trim(p_email)), nullif(trim(p_phone), ''), nullif(trim(p_business_name), ''),
     nullif(trim(p_business_type), ''), nullif(trim(p_city), ''), nullif(p_plan_interest, ''),
     nullif(trim(p_source), ''))
  on conflict (email) do update
     set updated_at = now()
  returning waitlist.position, (xmax = 0)
  into v_position, v_inserted;

  return query
    select v_position,
           (select count(*) from public.waitlist w where w.status <> 'removed'),
           not v_inserted;
end;
$$;

-- Number shown on the homepage ("1,240 businesses are waiting")
create or replace function public.waitlist_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.waitlist where status <> 'removed';
$$;


-- =====================================================================
-- 5. FEATURE REQUESTS  (roadmap page form)
-- =====================================================================

create table public.feature_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid default auth.uid() references auth.users(id) on delete set null,
  name        text check (name is null or char_length(name) <= 120),
  email       text check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  request     text not null check (char_length(request) between 5 and 2000),
  status      text not null default 'new'
                check (status in ('new', 'planned', 'in_progress', 'done', 'declined')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index feature_requests_created_idx on public.feature_requests (created_at desc);

create trigger trg_feature_requests_updated
  before update on public.feature_requests
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 6. CONTACT MESSAGES  (contact page form)
-- =====================================================================

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid default auth.uid() references auth.users(id) on delete set null,
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone       text check (phone is null or phone ~ '^\+?[0-9 ]{8,16}$'),
  message     text not null check (char_length(message) between 5 and 5000),
  status      text not null default 'new' check (status in ('new', 'replied', 'closed', 'spam')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

create trigger trg_contact_messages_updated
  before update on public.contact_messages
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 7. BILLING DETAILS  (one row per customer, used on GST invoices)
-- =====================================================================

create table public.billing_details (
  user_id        uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  business_name  text not null check (char_length(business_name) between 1 and 160),
  gstin          text check (gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'),
  address_line1  text check (address_line1 is null or char_length(address_line1) <= 200),
  address_line2  text check (address_line2 is null or char_length(address_line2) <= 200),
  city           text check (city is null or char_length(city) <= 80),
  state          text check (state is null or char_length(state) <= 80),   -- decides CGST/SGST vs IGST
  pincode        text,
  country        char(2) not null default 'IN' check (country ~ '^[A-Z]{2}$'),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint pincode_format check (pincode is null or country <> 'IN' or pincode ~ '^[1-9][0-9]{5}$')
);

create trigger trg_billing_details_updated
  before update on public.billing_details
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 8. SUBSCRIPTIONS  (written only by your server / Razorpay webhook)
-- =====================================================================

create table public.subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users(id) on delete set null,  -- kept for tax records
  plan_code                 text not null references public.plans(code),
  billing_period            text not null check (billing_period in ('monthly', 'yearly')),
  currency                  text not null default 'INR' check (currency in ('INR', 'USD')),
  amount                    integer not null check (amount >= 0),   -- per period, BEFORE GST
  -- Razorpay subscription statuses
  status                    text not null default 'created'
                              check (status in ('created', 'authenticated', 'active', 'pending',
                                                'halted', 'paused', 'cancelled', 'completed', 'expired')),
  razorpay_subscription_id  text unique,
  razorpay_customer_id      text,
  trial_ends_at             timestamptz,
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  cancel_at_period_end      boolean not null default false,
  cancelled_at              timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- A user can have only ONE live subscription at a time
create unique index subscriptions_one_live_per_user
  on public.subscriptions (user_id)
  where status in ('created', 'authenticated', 'active', 'pending', 'halted', 'paused');

create index subscriptions_user_idx on public.subscriptions (user_id);

create trigger trg_subscriptions_updated
  before update on public.subscriptions
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 9. PAYMENTS  (written only by your server / Razorpay webhook)
-- =====================================================================

create table public.payments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users(id) on delete set null,
  subscription_id      uuid references public.subscriptions(id) on delete set null,
  razorpay_payment_id  text not null unique,
  razorpay_invoice_id  text,
  razorpay_order_id    text,
  amount               integer not null check (amount >= 0),   -- what the customer paid, GST included
  currency             text not null default 'INR' check (currency in ('INR', 'USD')),
  status               text not null check (status in ('created', 'authorized', 'captured', 'refunded', 'failed')),
  method               text,          -- upi, card, netbanking ...
  error_reason         text,
  paid_at              timestamptz,
  created_at           timestamptz not null default now()
);

create index payments_user_idx         on public.payments (user_id);
create index payments_subscription_idx on public.payments (subscription_id);
create index payments_paid_idx         on public.payments (paid_at desc) where status = 'captured';


-- =====================================================================
-- 10. GST INVOICES  (created only by issue_invoice())
-- =====================================================================

-- One running counter per Indian financial year (April–March)
create table public.invoice_counters (
  financial_year  text primary key,      -- e.g. '2026-27'
  last_number     integer not null default 0
);

create table public.invoices (
  id               uuid primary key default gen_random_uuid(),
  invoice_number   text not null unique check (char_length(invoice_number) <= 16),  -- GST rule: max 16 characters
  user_id          uuid references auth.users(id) on delete set null,
  subscription_id  uuid references public.subscriptions(id) on delete set null,
  payment_id       uuid unique references public.payments(id) on delete set null,
  invoice_date     date not null default current_date,
  period_start     date,
  period_end       date,
  description      text not null,
  buyer            jsonb not null,      -- frozen copy of billing details at invoice time
  place_of_supply  text,
  currency         text not null default 'INR' check (currency in ('INR', 'USD')),
  subtotal         integer not null check (subtotal >= 0),
  cgst             integer not null default 0 check (cgst >= 0),
  sgst             integer not null default 0 check (sgst >= 0),
  igst             integer not null default 0 check (igst >= 0),
  total            integer generated always as (subtotal + cgst + sgst + igst) stored,
  is_export        boolean not null default false,   -- overseas customer, zero-rated under LUT
  pdf_path         text,                             -- storage path: invoices/<user_id>/<file>.pdf
  status           text not null default 'issued' check (status in ('issued', 'cancelled')),
  created_at       timestamptz not null default now()
);

create index invoices_user_idx on public.invoices (user_id, invoice_date desc);

-- Next invoice number, e.g. MO/2026-27/00001 (resets every 1 April)
create or replace function public.next_invoice_number(p_date date default current_date)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_year int;
  v_fy         text;
  v_no         int;
begin
  v_start_year := case when extract(month from p_date) >= 4
                       then extract(year from p_date)::int
                       else extract(year from p_date)::int - 1 end;
  v_fy := v_start_year::text || '-' || lpad(((v_start_year + 1) % 100)::text, 2, '0');

  insert into public.invoice_counters (financial_year, last_number)
  values (v_fy, 1)
  on conflict (financial_year)
    do update set last_number = invoice_counters.last_number + 1
  returning last_number into v_no;

  return 'MO/' || v_fy || '/' || lpad(v_no::text, 5, '0');
end;
$$;

-- Creates the GST invoice for a captured payment. Call it from your
-- webhook handler (service role) after saving the payment.
-- The paid amount INCLUDES GST, so the tax is worked out backwards and
-- the invoice total always equals exactly what the customer paid.
create or replace function public.issue_invoice(
  p_payment_id    uuid,
  p_description   text,
  p_period_start  date default null,
  p_period_end    date default null
)
returns public.invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pay        public.payments;
  v_bill       public.billing_details;
  v_inv        public.invoices;
  v_rate       numeric := (select (value #>> '{}')::numeric from public.site_settings where key = 'gst_rate');
  v_home_state text    := (select value #>> '{}' from public.site_settings where key = 'company_state');
  v_subtotal   integer;
  v_tax        integer;
  v_export     boolean;
  v_same_state boolean;
begin
  select * into v_pay from public.payments where id = p_payment_id;
  if not found then
    raise exception 'Payment % not found', p_payment_id;
  end if;
  if v_pay.status <> 'captured' then
    raise exception 'Payment % is %, only captured payments get an invoice', p_payment_id, v_pay.status;
  end if;

  -- One invoice per payment: return the existing one if called twice (webhook retries)
  select * into v_inv from public.invoices where payment_id = p_payment_id;
  if found then
    return v_inv;
  end if;

  select * into v_bill from public.billing_details where user_id = v_pay.user_id;

  v_export     := coalesce(v_bill.country, 'IN') <> 'IN' or v_pay.currency <> 'INR';
  v_same_state := lower(coalesce(v_bill.state, v_home_state)) = lower(v_home_state);

  if v_export then
    v_subtotal := v_pay.amount;
    v_tax      := 0;
  else
    v_subtotal := round(v_pay.amount * 100 / (100 + v_rate))::integer;
    v_tax      := v_pay.amount - v_subtotal;
  end if;

  insert into public.invoices (
    invoice_number, user_id, subscription_id, payment_id, invoice_date,
    period_start, period_end, description, buyer, place_of_supply, currency,
    subtotal, cgst, sgst, igst, is_export
  )
  values (
    public.next_invoice_number(current_date),
    v_pay.user_id, v_pay.subscription_id, v_pay.id, current_date,
    p_period_start, p_period_end, p_description,
    jsonb_build_object(
      'business_name', v_bill.business_name,
      'gstin',         v_bill.gstin,
      'address_line1', v_bill.address_line1,
      'address_line2', v_bill.address_line2,
      'city',          v_bill.city,
      'state',         v_bill.state,
      'pincode',       v_bill.pincode,
      'country',       coalesce(v_bill.country, 'IN'),
      'email',         (select email from public.profiles where id = v_pay.user_id)
    ),
    case when v_export then 'Outside India' else coalesce(v_bill.state, v_home_state) end,
    v_pay.currency,
    v_subtotal,
    case when not v_export and v_same_state then v_tax / 2 else 0 end,             -- CGST
    case when not v_export and v_same_state then v_tax - v_tax / 2 else 0 end,     -- SGST
    case when not v_export and not v_same_state then v_tax else 0 end,             -- IGST
    v_export
  )
  returning * into v_inv;

  return v_inv;
end;
$$;


-- =====================================================================
-- 11. SUPPORT TICKETS  (account page support form)
-- =====================================================================

create table public.support_tickets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject      text not null check (char_length(subject) between 3 and 200),
  message      text not null check (char_length(message) between 5 and 5000),
  status       text not null default 'open' check (status in ('open', 'answered', 'closed')),
  admin_reply  text check (admin_reply is null or char_length(admin_reply) <= 5000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index support_tickets_user_idx on public.support_tickets (user_id, created_at desc);

create trigger trg_support_tickets_updated
  before update on public.support_tickets
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 12. WEBHOOK EVENTS  (server only — stops the same Razorpay event
--     being processed twice)
-- =====================================================================

create table public.webhook_events (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null default 'razorpay',
  event_id      text not null,          -- x-razorpay-event-id header
  event_type    text not null,          -- e.g. subscription.charged
  payload       jsonb not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  error         text,
  unique (provider, event_id)
);

create index webhook_events_unprocessed_idx on public.webhook_events (received_at) where processed_at is null;


-- =====================================================================
-- 13. ADMIN DASHBOARD NUMBERS
-- =====================================================================

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can see dashboard stats' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'waitlist_total',          (select count(*) from waitlist where status <> 'removed'),
    'waitlist_last_7_days',    (select count(*) from waitlist where created_at > now() - interval '7 days'),
    'contact_messages_new',    (select count(*) from contact_messages where status = 'new'),
    'feature_requests_new',    (select count(*) from feature_requests where status = 'new'),
    'support_tickets_open',    (select count(*) from support_tickets where status = 'open'),
    'subscriptions_active',    (select count(*) from subscriptions where status = 'active'),
    'subscriptions_in_trial',  (select count(*) from subscriptions where status = 'authenticated'),
    -- monthly recurring revenue in paise, before GST (yearly plans counted as 1/12)
    'mrr_inr_paise',           (select coalesce(sum(case when billing_period = 'yearly' then amount / 12 else amount end), 0)
                                  from subscriptions where status = 'active' and currency = 'INR'),
    'revenue_this_month_inr_paise',
                               (select coalesce(sum(amount), 0) from payments
                                  where status = 'captured' and currency = 'INR'
                                    and paid_at >= date_trunc('month', now()))
  );
end;
$$;


-- =====================================================================
-- 14. ROW LEVEL SECURITY  (who can see and change what)
--     Server code using the service_role key bypasses all of this.
-- =====================================================================

alter table public.site_settings     enable row level security;
alter table public.plans             enable row level security;
alter table public.profiles          enable row level security;
alter table public.waitlist          enable row level security;
alter table public.feature_requests  enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.billing_details   enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.payments          enable row level security;
alter table public.invoice_counters  enable row level security;
alter table public.invoices          enable row level security;
alter table public.support_tickets   enable row level security;
alter table public.webhook_events    enable row level security;

-- Site settings and plans: everyone can read, only admins can change
create policy "anyone reads settings"   on public.site_settings for select using (true);
create policy "admins change settings"  on public.site_settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "anyone reads active plans" on public.plans for select
  using (is_active or (select public.is_admin()));
create policy "admins change plans"       on public.plans for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Profiles: you see and edit your own; admins see everyone
create policy "read own profile"   on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Waitlist: only admins (visitors use join_waitlist())
create policy "admins read waitlist"   on public.waitlist for select to authenticated
  using ((select public.is_admin()));
create policy "admins update waitlist" on public.waitlist for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Feature requests: anyone can send; you see your own; admins see all
create policy "anyone sends feature request" on public.feature_requests for insert
  with check (user_id is null or user_id = (select auth.uid()));
create policy "read own or admin feature requests" on public.feature_requests for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "admins update feature requests" on public.feature_requests for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Contact messages: anyone can send; only admins read
create policy "anyone sends contact message" on public.contact_messages for insert
  with check (user_id is null or user_id = (select auth.uid()));
create policy "admins read contact messages" on public.contact_messages for select to authenticated
  using ((select public.is_admin()));
create policy "admins update contact messages" on public.contact_messages for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Billing details: your own row only; admins can read
create policy "read own billing"   on public.billing_details for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "create own billing" on public.billing_details for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "update own billing" on public.billing_details for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Subscriptions, payments, invoices: read your own; admins read all;
-- nobody writes from the browser (server + webhook only)
create policy "read own subscriptions" on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "read own payments"      on public.payments for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "read own invoices"      on public.invoices for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Support tickets: create and read your own; admins read and reply
create policy "create own ticket" on public.support_tickets for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "read own tickets"  on public.support_tickets for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "admins reply to tickets" on public.support_tickets for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- invoice_counters and webhook_events: no policies = server only


-- =====================================================================
-- 15. TABLE AND COLUMN PERMISSIONS
--     Row Level Security decides WHICH rows; these grants decide WHICH
--     columns a browser user may touch at all.
-- =====================================================================

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant usage on schema public to anon, authenticated;

-- Public pages
grant select on public.site_settings, public.plans to anon, authenticated;
grant update (value) on public.site_settings to authenticated;          -- admins only, by policy
grant update (name, tagline, price_inr_monthly, price_inr_yearly, price_usd_monthly, price_usd_yearly,
              max_users, max_businesses, ai_drafts_per_month, features, is_popular, is_active,
              sort_order, razorpay_plan_id_monthly, razorpay_plan_id_yearly)
  on public.plans to authenticated;                                      -- admins only, by policy

-- Forms anyone can submit (only these columns; status stays 'new')
grant insert (name, email, request)                 on public.feature_requests to anon, authenticated;
grant insert (name, email, phone, message)          on public.contact_messages to anon, authenticated;

-- Logged-in users
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;    -- never is_admin

grant select on public.billing_details to authenticated;
grant insert (business_name, gstin, address_line1, address_line2, city, state, pincode, country)
  on public.billing_details to authenticated;
grant update (business_name, gstin, address_line1, address_line2, city, state, pincode, country)
  on public.billing_details to authenticated;

grant select on public.subscriptions, public.payments, public.invoices to authenticated;

grant select on public.support_tickets to authenticated;
grant insert (subject, message) on public.support_tickets to authenticated;
grant update (status, admin_reply) on public.support_tickets to authenticated;  -- admins only, by policy

-- Admin screens (rows limited to admins by policy)
grant select on public.waitlist, public.feature_requests, public.contact_messages to authenticated;
grant update (status, invited_at) on public.waitlist         to authenticated;
grant update (status)             on public.feature_requests to authenticated;
grant update (status)             on public.contact_messages to authenticated;

-- Functions the website may call
grant execute on function public.join_waitlist(text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.waitlist_count()       to anon, authenticated;
grant execute on function public.is_admin()             to anon, authenticated;  -- used inside policies
grant execute on function public.admin_dashboard_stats() to authenticated;
-- next_invoice_number() and issue_invoice() stay server-only (service role)


-- =====================================================================
-- 16. STORAGE BUCKET FOR INVOICE PDFs  (private)
--     Upload each PDF to:  invoices/<user_id>/<invoice_number>.pdf
--     (replace "/" in the invoice number with "-" in the file name)
-- =====================================================================

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public)
    values ('invoices', 'invoices', false)
    on conflict (id) do nothing;

    begin
      execute $p$
        create policy "users read own invoice pdfs" on storage.objects
          for select to authenticated
          using (bucket_id = 'invoices'
                 and ((storage.foldername(name))[1] = (select auth.uid())::text
                      or (select public.is_admin())))
      $p$;
    exception when duplicate_object then null;
    end;
  end if;
end;
$$;

commit;


-- =====================================================================
-- MAKE YOURSELF ADMIN  (run once, AFTER you sign up on the website)
-- Replace the email with the one you signed up with, remove the "--",
-- and run only this line:
--
-- update public.profiles set is_admin = true where email = 'hello@maalabs.in';
-- =====================================================================
