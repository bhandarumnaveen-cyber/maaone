/**
 * Maa One — single source of truth for the website.
 * Roadmap, modules, FAQs and brand credits live here. Live settings (sales_open,
 * launch date, contacts) and plans come from Supabase; the values below are fallbacks.
 */

import type { Plan } from "@/lib/types";

/**
 * Fallbacks only. The live values come from Supabase (site_settings, plans)
 * and are used instead whenever the database is reachable.
 */
export const fallbackSettings = {
  salesOpen: false,
  launchDate: "2027-01-24",
  trialDays: 14,
  gstRate: 18,
  supportEmail: "hello@maalabs.in",
  naveencodesEmail: "connect@naveencodes.com",
  whatsapp: "+918053385815",
  instagram: "maalabs18",
  appUrl: "https://one.maalabs.in",
};

export const site = {
  name: "Maa One",
  tagline: "Poora business, ek app mein",
  taglineEnglish: "The whole business, in one app",
  description:
    "Maa One puts every lead from your website and WhatsApp in one inbox. AI drafts the reply in Hindi, Punjabi or English. You approve and win the customer.",
  url: "https://maaone.in",
  company: "Maa Labs Private Limited",
  companyShort: "Maa Labs",
  founder: "Naveen Goyal",
  founderTitle: "Founder & Director",
  developer: {
    name: "NaveenCodes",
    url: "https://naveencodes.com",
  },
  creditLine: "Maa One — a Maa Labs product · Built by NaveenCodes",
  copyrightYear: 2026,
} as const;

/* ------------------------------------------------------------------ */
/* Versions                                                            */
/* ------------------------------------------------------------------ */

export type VersionId = "v1" | "v1.5" | "v2" | "v3" | "v4";
export type VersionStatus = "released" | "in-progress" | "planned";

export type Version = {
  id: VersionId;
  month: string;
  name: string;
  status: VersionStatus;
  summary: string;
};

export const versions: Version[] = [
  {
    id: "v1",
    month: "January 2027",
    name: "Maa One Inbox",
    status: "in-progress",
    summary:
      "Every website and WhatsApp lead in one inbox, scored by AI, with a reply drafted in Hindi, Punjabi or English.",
  },
  {
    id: "v1.5",
    month: "March 2027",
    name: "Mobile app",
    status: "planned",
    summary: "Maa One on your phone as a proper app — Android first, then iOS.",
  },
  {
    id: "v2",
    month: "May 2027",
    name: "Get paid",
    status: "planned",
    summary:
      "Bookings, quotes, GST invoices and UPI payment links with automatic reminders.",
  },
  {
    id: "v3",
    month: "August 2027",
    name: "Do the work and grow",
    status: "planned",
    summary:
      "A technician app, AMC renewals, Google reviews, WhatsApp campaigns and a Hindi and Punjabi interface.",
  },
  {
    id: "v4",
    month: "November 2027 onward",
    name: "Scale",
    status: "planned",
    summary:
      "Khata, expenses, stock, the “Ask Maa” AI assistant, agency mode and an open API.",
  },
];

export const versionById = Object.fromEntries(
  versions.map((v) => [v.id, v]),
) as Record<VersionId, Version>;

export const statusLabel: Record<VersionStatus, string> = {
  released: "Released",
  "in-progress": "In progress",
  planned: "Planned",
};

/* ------------------------------------------------------------------ */
/* Modules                                                             */
/* ------------------------------------------------------------------ */

export type Module = {
  name: string;
  description: string;
  version: VersionId;
  /** A later version that completes this module (e.g. basic CRM in v1, full in v2). */
  upgrade?: { version: VersionId; label: string };
};

export type ModuleGroup = {
  id: "win" | "work" | "paid" | "grow" | "platform";
  title: string;
  blurb: string;
  modules: Module[];
};

export const moduleGroups: ModuleGroup[] = [
  {
    id: "win",
    title: "Win customers",
    blurb: "Never miss a lead again, wherever it comes from.",
    modules: [
      {
        name: "Unified inbox",
        description:
          "Website form enquiries and WhatsApp chats land in one inbox, sorted by who needs a reply first.",
        version: "v1",
      },
      {
        name: "AI lead scoring and reply drafts",
        description:
          "AI reads every message, marks hot leads and drafts a reply in Hindi, Punjabi or English. You approve with one tap.",
        version: "v1",
      },
      {
        name: "CRM",
        description:
          "Every customer, conversation and follow-up in one place. Basic CRM in v1; pipelines, tags and reports in v2.",
        version: "v1",
        upgrade: { version: "v2", label: "Full CRM" },
      },
      {
        name: "Lead widgets for any website",
        description:
          "Add an enquiry form or WhatsApp button to WordPress, Wix, Shopify or a custom site with one line of code.",
        version: "v1",
      },
      {
        name: "Missed-call leads",
        description:
          "A missed call becomes a lead with an instant WhatsApp reply, so the caller doesn’t go to a competitor.",
        version: "v2",
      },
      {
        name: "Instagram and email inbox",
        description:
          "Instagram DMs and email enquiries join the same inbox, with the same AI drafts.",
        version: "v2",
      },
      {
        name: "Ad lead tracking",
        description:
          "See which Google and Meta ads bring leads that actually pay, not just clicks.",
        version: "v3",
      },
      {
        name: "AI website chatbot",
        description:
          "A chatbot trained on your services and prices that answers visitors and books them in, day and night.",
        version: "v4",
      },
    ],
  },
  {
    id: "work",
    title: "Do the work",
    blurb: "Run jobs, visits and renewals without a register.",
    modules: [
      {
        name: "Bookings",
        description:
          "Customers pick a slot, you get the booking, and both sides get WhatsApp reminders.",
        version: "v2",
      },
      {
        name: "Technician app",
        description:
          "Assign jobs to your team, track visits, and collect photos and signatures on site.",
        version: "v3",
      },
      {
        name: "AMC and renewals",
        description:
          "Annual contracts and service due dates tracked automatically, with renewal reminders sent for you.",
        version: "v3",
      },
      {
        name: "Parts and stock",
        description:
          "Know what is in stock, what was used on which job, and when to reorder.",
        version: "v4",
      },
    ],
  },
  {
    id: "paid",
    title: "Get paid",
    blurb: "From quote to payment, without chasing.",
    modules: [
      {
        name: "Quotes and GST invoices",
        description:
          "Send a professional quote on WhatsApp, turn it into a GST invoice in one tap.",
        version: "v2",
      },
      {
        name: "UPI payment links and reminders",
        description:
          "Every invoice carries a UPI link. Polite reminders go out until it is paid.",
        version: "v2",
      },
      {
        name: "Khata ledger",
        description:
          "A digital khata for every customer — credit, payments and balance at a glance.",
        version: "v4",
      },
      {
        name: "Expenses and CA export",
        description:
          "Log expenses from a photo of the bill and send your CA a clean export at month end.",
        version: "v4",
      },
    ],
  },
  {
    id: "grow",
    title: "Grow",
    blurb: "Turn happy customers into more customers.",
    modules: [
      {
        name: "Google review requests",
        description:
          "Ask every happy customer for a Google review at the right moment, automatically.",
        version: "v3",
      },
      {
        name: "WhatsApp campaigns",
        description:
          "Send offers and updates to the right customer lists using approved WhatsApp templates.",
        version: "v3",
      },
      {
        name: "Festival offers",
        description:
          "Ready-made Diwali, Holi, Lohri and Eid offer templates, scheduled in advance.",
        version: "v3",
      },
      {
        name: "Referral rewards",
        description:
          "Reward customers who send you new customers, tracked without spreadsheets.",
        version: "v4",
      },
    ],
  },
  {
    id: "platform",
    title: "Platform",
    blurb: "Built for how Indian businesses actually work.",
    modules: [
      {
        name: "Installable web app",
        description:
          "Install Maa One on any phone or laptop straight from the browser. No app store needed.",
        version: "v1",
      },
      {
        name: "Android and iOS app",
        description:
          "Native apps with instant notifications — Android first, then iOS.",
        version: "v1.5",
      },
      {
        name: "AI voice notes",
        description:
          "Speak a reply or a note in your language; Maa One types it out and tidies it up.",
        version: "v2",
      },
      {
        name: "Hindi and Punjabi interface",
        description: "Use the whole app in Hindi or Punjabi, not just the AI replies.",
        version: "v3",
      },
      {
        name: "Team roles",
        description:
          "Add staff with the right access. Basic roles in v1; full permissions and activity logs in v3.",
        version: "v1",
        upgrade: { version: "v3", label: "Full team roles" },
      },
      {
        name: "“Ask Maa” AI assistant",
        description:
          "Ask questions about your business in plain language — “Kitne leads aaye is hafte?” — and get answers.",
        version: "v4",
      },
      {
        name: "Agency mode",
        description:
          "Manage several businesses from one login, under your own brand.",
        version: "v4",
      },
      {
        name: "Integrations and API",
        description:
          "Connect Maa One to Tally, Google Sheets, Zapier and your own tools.",
        version: "v4",
      },
    ],
  },
];

/** Modules (and module upgrades) that ship in a given version, for the roadmap. */
export function modulesInVersion(id: VersionId): string[] {
  const names: string[] = [];
  for (const group of moduleGroups) {
    for (const m of group.modules) {
      if (m.version === id) {
        names.push(m.upgrade ? `${m.name} (basic)` : m.name);
      }
      if (m.upgrade?.version === id) names.push(m.upgrade.label);
    }
  }
  return names;
}

export function isAvailable(id: VersionId): boolean {
  return versionById[id].status === "released";
}

/* ------------------------------------------------------------------ */
/* Plans (fallback — live plans come from the Supabase plans table)    */
/* ------------------------------------------------------------------ */

export const fallbackPlans: Plan[] = [
  {
    code: "starter",
    name: "Starter",
    tagline: "For a single owner getting started",
    inrMonthly: 49900,
    inrYearly: 499000,
    usdMonthly: 1200,
    usdYearly: 12000,
    maxUsers: 1,
    maxBusinesses: 1,
    features: ["Inbox for website forms + WhatsApp", "AI lead scoring and reply drafts", "Basic CRM", "1 user"],
    popular: false,
  },
  {
    code: "growth",
    name: "Growth",
    tagline: "Every live module for a small team",
    inrMonthly: 149900,
    inrYearly: 1499000,
    usdMonthly: 2900,
    usdYearly: 29000,
    maxUsers: 3,
    maxBusinesses: 1,
    features: ["Everything in Starter", "Every live module", "3 users", "Mobile app"],
    popular: true,
  },
  {
    code: "pro",
    name: "Pro",
    tagline: "For teams with technicians in the field",
    inrMonthly: 299900,
    inrYearly: 2999000,
    usdMonthly: 5900,
    usdYearly: 59000,
    maxUsers: 10,
    maxBusinesses: 1,
    features: ["Everything in Growth", "10 users", "Technician app", "Campaigns", "Priority support"],
    popular: false,
  },
  {
    code: "agency",
    name: "Agency",
    tagline: "Run many businesses under your own brand",
    inrMonthly: 499900,
    inrYearly: 4999000,
    usdMonthly: 9900,
    usdYearly: 99000,
    maxUsers: null,
    maxBusinesses: 10,
    features: ["Up to 10 businesses", "White-label branding", "Everything in Pro"],
    popular: false,
  },
];

type Cell = boolean | string;
/** Feature rows for the comparison table, keyed by plan code. Users and businesses come from the plans table. */
export const comparison: { label: string; values: Record<string, Cell> }[] = [
  { label: "Website form + WhatsApp inbox", values: { starter: true, growth: true, pro: true, agency: true } },
  { label: "AI lead scoring and reply drafts", values: { starter: true, growth: true, pro: true, agency: true } },
  { label: "CRM", values: { starter: "Basic", growth: "Full", pro: "Full", agency: "Full" } },
  { label: "Lead widgets for your website", values: { starter: true, growth: true, pro: true, agency: true } },
  { label: "Every live module", values: { starter: false, growth: true, pro: true, agency: true } },
  { label: "Android and iOS app", values: { starter: false, growth: true, pro: true, agency: true } },
  { label: "Technician app", values: { starter: false, growth: false, pro: true, agency: true } },
  { label: "WhatsApp campaigns", values: { starter: false, growth: false, pro: true, agency: true } },
  { label: "Priority support", values: { starter: false, growth: false, pro: true, agency: true } },
  { label: "White-label", values: { starter: false, growth: false, pro: false, agency: true } },
];

/* ------------------------------------------------------------------ */
/* Launch path                                                         */
/* ------------------------------------------------------------------ */

export function launchSteps(s: { trialDays: number; launchDateLabel: string }) {
  return [
    { title: "Join the waitlist", when: "Now", current: true },
    { title: "Pilot with the first businesses", when: "December 2026" },
    { title: `Paid launch with a ${s.trialDays}-day free trial`, when: s.launchDateLabel },
    { title: "A new module every 2–3 months, small updates every 2 weeks", when: "After launch" },
  ];
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const faqs: { q: string; a: string }[] = [
  {
    q: "Is my customers' data safe?",
    a: "Yes. Your data is encrypted in transit and at rest, access is limited to your team, and we never sell or share it. Your customers' details belong to you, and you can ask us to delete your account and data at any time.",
  },
  {
    q: "Do I need the WhatsApp Business API?",
    a: "You don't need to set it up yourself. During onboarding we help you connect your business number through Meta's official WhatsApp Business Platform. Meta's message charges are passed through at cost, with no markup.",
  },
  {
    q: "Will it work with my existing website?",
    a: "Yes. Add our lead widget with one line of code, or point your existing contact form to Maa One. It works with WordPress, Wix, Shopify, Webflow and custom-built sites.",
  },
  {
    q: "Can my staff use it?",
    a: "Yes. Starter includes 1 user, Growth 3 users and Pro 10 users. Basic team roles come in v1; full permissions and activity logs in v3. You pay per business, not per user.",
  },
  {
    q: "Is there a mobile app?",
    a: "From day one Maa One is an installable web app that works on any phone. The Android app arrives in v1.5 (March 2027), followed by iOS.",
  },
  {
    q: "Which languages does the AI reply in?",
    a: "Hindi, Punjabi and English — including Hinglish, the way your customers actually write. The full app interface in Hindi and Punjabi arrives in v3.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account in two clicks. Your plan stays active until the end of the period you've paid for, and there are no cancellation fees.",
  },
  {
    q: "Is GST included?",
    a: "Prices shown exclude 18% GST. You get a proper GST invoice from Maa Labs Private Limited every month, so registered businesses can claim input tax credit.",
  },
];

/* ------------------------------------------------------------------ */
/* Waitlist form options                                               */
/* ------------------------------------------------------------------ */

export const businessTypes = [
  "AC and appliance repair",
  "Salon, spa or beauty",
  "Clinic or healthcare",
  "Coaching or tuition",
  "Real estate",
  "Interior design or construction",
  "Pest control or cleaning",
  "Events and weddings",
  "Travel agency",
  "Gym or fitness",
  "Marketing agency",
  "Other service business",
];
