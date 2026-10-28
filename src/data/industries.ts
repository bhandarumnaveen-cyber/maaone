import type { AppImageName } from "@/components/app-image";

/** Landing pages at /for/<slug>. `modules` are module names from site.config.ts. */
export type Industry = {
  slug: string;
  name: string;
  /** Short label for menus. */
  short: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  sub: string;
  pains: { title: string; body: string }[];
  demo: string;
  image: AppImageName;
  modules: string[];
};

export const industries: Industry[] = [
  {
    slug: "ac-repair",
    name: "AC and appliance repair",
    short: "AC & appliance repair",
    metaTitle: "Maa One for AC and appliance repair businesses",
    metaDescription:
      "Reply to every AC service enquiry on WhatsApp in minutes, book technician visits, track AMC renewals and send GST invoices with UPI links.",
    headline: "Every AC service enquiry answered in minutes — even in peak summer",
    sub: "When the heat hits, enquiries flood in on WhatsApp and your website. Maa One sorts them, drafts the reply in Hindi, Punjabi or English, and reminds you about every AMC renewal.",
    pains: [
      { title: "Summer rush, missed calls", body: "In May and June you can't answer every call or message — and every unanswered one goes to another technician." },
      { title: "AMC renewals forgotten", body: "Annual contracts lapse because nobody reminded the customer in time." },
      { title: "Payments chased by phone", body: "Collecting after the job means calls, follow-ups and cash you have to track." },
    ],
    demo: "ac",
    image: "phone-technician",
    modules: ["Unified inbox", "AI lead scoring and reply drafts", "Missed-call leads", "Technician app", "AMC and renewals", "UPI payment links and reminders"],
  },
  {
    slug: "salon",
    name: "Salons, spas and beauty",
    short: "Salon & spa",
    metaTitle: "Maa One for salons, spas and beauty studios",
    metaDescription:
      "Answer booking and bridal enquiries instantly on WhatsApp, take bookings with reminders, ask for Google reviews and send festival offers.",
    headline: "Fill every slot — reply to bookings before they ask someone else",
    sub: "Bridal enquiries, appointment requests and price questions arrive all day. Maa One replies politely in your customer's language and turns them into confirmed bookings.",
    pains: [
      { title: "Busy hands, unread chats", body: "You're with a client while three WhatsApp enquiries wait. By the evening they've booked elsewhere." },
      { title: "No-shows and empty slots", body: "Without reminders, customers forget appointments and slots go to waste." },
      { title: "Repeat customers drift away", body: "Regulars stop coming because nobody sent an offer or a 'we miss you' message." },
    ],
    demo: "salon",
    image: "phone-inbox",
    modules: ["Unified inbox", "AI lead scoring and reply drafts", "Bookings", "Google review requests", "WhatsApp campaigns", "Festival offers"],
  },
  {
    slug: "clinic",
    name: "Clinics and healthcare",
    short: "Clinic",
    metaTitle: "Maa One for clinics and healthcare practices",
    metaDescription:
      "Reply to appointment enquiries on WhatsApp in Hindi, Punjabi or English, book consultations with reminders and keep every patient conversation in one place.",
    headline: "Patients get a reply in minutes — your staff gets their time back",
    sub: "Appointment requests, timings and fee questions come in all day. Maa One drafts a caring reply in the patient's language and books the slot, so your front desk isn't stuck on the phone.",
    pains: [
      { title: "Front desk overwhelmed", body: "Calls, walk-ins and WhatsApp messages all at once — some patients never get a reply." },
      { title: "Missed appointments", body: "Patients forget their slot without a reminder, and the doctor's time is lost." },
      { title: "Scattered conversations", body: "Messages sit on different phones with no history when the patient calls back." },
    ],
    demo: "clinic",
    image: "phone-ai-draft",
    modules: ["Unified inbox", "AI lead scoring and reply drafts", "CRM", "Bookings", "Google review requests", "Team roles"],
  },
  {
    slug: "real-estate",
    name: "Real estate",
    short: "Real estate",
    metaTitle: "Maa One for real estate agents and builders",
    metaDescription:
      "Capture every property enquiry from your website, WhatsApp and ads, score hot buyers with AI and follow up until the site visit.",
    headline: "Know which buyers are serious — and follow up until the site visit",
    sub: "Leads arrive from portals, ads, WhatsApp and your website. Maa One scores each buyer, drafts the first reply and reminds you to follow up, so hot leads don't go cold.",
    pains: [
      { title: "Too many leads, too little time", body: "Most enquiries are just browsing — finding the serious buyers takes hours." },
      { title: "Follow-ups fall through", body: "A buyer who wanted photos last week hears nothing and signs with another agent." },
      { title: "No idea which ads work", body: "You spend on Facebook and Google ads without knowing which ones bring real buyers." },
    ],
    demo: "property",
    image: "laptop-crm",
    modules: ["Unified inbox", "AI lead scoring and reply drafts", "CRM", "Lead widgets for any website", "Ad lead tracking", "WhatsApp campaigns"],
  },
  {
    slug: "coaching",
    name: "Coaching and tuition centres",
    short: "Coaching & tuition",
    metaTitle: "Maa One for coaching and tuition centres",
    metaDescription:
      "Answer every admission enquiry on WhatsApp, track demo classes and fee payments with UPI reminders, and send batch updates to parents.",
    headline: "Turn admission enquiries into enrolled students",
    sub: "Parents ask about fees, timings and batches on WhatsApp — usually in the evening. Maa One replies instantly in Hindi, Punjabi or English and follows up after the demo class.",
    pains: [
      { title: "Admission season chaos", body: "Hundreds of parent enquiries in a few weeks, all on one phone." },
      { title: "Demo class, then silence", body: "Students attend the free demo but nobody follows up to confirm admission." },
      { title: "Fee reminders are awkward", body: "Chasing monthly fees by phone takes time and strains relationships." },
    ],
    demo: "coaching",
    image: "phone-inbox",
    modules: ["Unified inbox", "AI lead scoring and reply drafts", "CRM", "UPI payment links and reminders", "WhatsApp campaigns", "Hindi and Punjabi interface"],
  },
  {
    slug: "interior-design",
    name: "Interior design and renovation",
    short: "Interior design",
    metaTitle: "Maa One for interior designers and renovation contractors",
    metaDescription:
      "Reply to project enquiries quickly, send professional quotes and GST invoices on WhatsApp, and collect payments by milestone with UPI links.",
    headline: "From first enquiry to final payment — every project in one place",
    sub: "Big-ticket clients compare three or four designers. Maa One helps you reply first, send a professional quote and collect each milestone payment without chasing.",
    pains: [
      { title: "Slow quotes lose projects", body: "Clients sign with whoever sends a clear estimate first." },
      { title: "Milestone payments get delayed", body: "Each stage means another round of reminders before the money comes in." },
      { title: "Site details everywhere", body: "Photos, measurements and approvals are spread across chats and notebooks." },
    ],
    demo: "interior",
    image: "phone-invoice",
    modules: ["Unified inbox", "AI lead scoring and reply drafts", "Quotes and GST invoices", "UPI payment links and reminders", "Technician app", "Expenses and CA export"],
  },
];

export const industryBySlug = (slug: string) => industries.find((i) => i.slug === slug);
