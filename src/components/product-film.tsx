"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import {
  BarChart3,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  Contact,
  Globe,
  Home,
  Inbox,
  KanbanSquare,
  Lock,
  MousePointer2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "./icons";

/**
 * "Maa One in 50 seconds": one lead for a bridal makeup studio goes through the whole v1 product,
 * shown on the web app (laptop) and the mobile app side by side, kept in sync.
 *
 *   1. Connect WhatsApp and the website form, fill the business profile
 *   2. Leads from both land in one inbox; AI marks them hot / warm / cold, spam stays out
 *   3. AI explains why a lead is hot and drafts the reply from the studio's own prices
 *   4. The owner approves it on her phone; it goes out on WhatsApp and the laptop updates
 *   5. Pipeline: move the lead, set a follow-up, assign it to staff
 *   6. Daily summary on WhatsApp and the dashboard
 *
 * Every frame is a pure function of `t` (ms), so it plays like a video on the site and
 * scripts/record-demo.mjs renders it frame by frame into MP4 (window.__maaOneFilm.seek).
 * Everything is drawn on a fixed-size stage that is scaled to fit, so it looks the same everywhere.
 */

export const FILM_LENGTH = 50_000;

const scenes = [
  { start: 0, title: "Connect once", body: "Link WhatsApp and your website form, then tell Maa One your services and prices. Takes 5 minutes." },
  { start: 7_000, title: "Every lead in one inbox", body: "WhatsApp and website enquiries land together. AI marks each one hot, warm or cold — spam stays out." },
  { start: 14_000, title: "AI reads the lead and writes the reply", body: "It shows why the lead is hot and drafts a reply from your own prices — Hinglish, Hindi, Punjabi or English." },
  { start: 23_000, title: "Approve from your phone", body: "One tap and the reply goes out on WhatsApp. Your phone and laptop stay in sync." },
  { start: 30_000, title: "Follow up, never forget", body: "Move the lead along your pipeline, set a reminder and hand it to your staff." },
  { start: 38_000, title: "Know your day in one message", body: "A daily summary on WhatsApp, and a live dashboard of leads, reply time and wins." },
  { start: 45_000, title: "Poora business, ek app mein", body: "Maa One — Maa Labs' biggest launch, coming in 2027." },
] as const;

const S: number[] = scenes.map((s) => s.start);

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** 0 → 1 between `from` and `from + dur` ms, eased. */
const prog = (t: number, from: number, dur = 400) => ease(Math.min(1, Math.max(0, (t - from) / dur)));
const between = (t: number, a: number, b: number) => t >= a && t < b;
const sceneAt = (t: number): number => S.reduce((idx, s, i) => (t >= s ? i : idx), 0);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/* ------------------------------------------------------------------ */
/* Story data                                                          */
/* ------------------------------------------------------------------ */

const BUSINESS = "Glow & Grace Bridal Studio";
const OWNER = "Harleen";

type Score = "Hot" | "Warm" | "Cold" | "Spam";
type Lead = { id: string; name: string; channel: "whatsapp" | "web"; msg: string; score: Score; time: string; at: number };

// `at`: when the lead arrives in scene 2 (ms).
const leads: Lead[] = [
  { id: "simran", name: "Simran Kaur", channel: "web", msg: "14 Feb ko meri shaadi hai, bridal makeup chahiye. Trial ho sakta hai?", score: "Hot", time: "11:42", at: 8_900 },
  { id: "rohit", name: "Rohit Deshmukh", channel: "whatsapp", msg: "Sister ki engagement 2 March — party makeup for 4 people", score: "Hot", time: "11:38", at: 8_300 },
  { id: "spam", name: "+91 70•••• 1180", channel: "whatsapp", msg: "Congratulations! You won ₹5,000, click link", score: "Spam", time: "11:31", at: 9_500 },
  { id: "jaspreet", name: "Aisha Khan", channel: "whatsapp", msg: "Kal shaam 5 baje hair spa ka slot milega?", score: "Warm", time: "11:20", at: 7_700 },
  { id: "neha", name: "Neha Iyer", channel: "web", msg: "What are your prices for a hair spa?", score: "Warm", time: "10:55", at: 7_400 },
  { id: "pooja", name: "Pooja Shetty", channel: "web", msg: "Do you offer a franchise in Pune?", score: "Cold", time: "10:12", at: 10_100 },
];
const visibleLeads = leads.filter((l) => l.score !== "Spam");

const draft =
  "Hi Simran ji, congratulations! Hamara bridal package ₹18,000 se shuru hai — HD makeup, hair styling aur dupatta draping included. Trial ₹2,500 ka hai, jo package mein adjust ho jaata hai. Is Sunday 12 baje trial book kar dein?";

const profile = [
  { label: "Bridal makeup", price: "from ₹18,000" },
  { label: "Engagement / party makeup", price: "₹3,500 per person" },
  { label: "Hair spa", price: "₹1,200" },
  { label: "Bridal trial", price: "₹2,500 · adjusted in package" },
];

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

type Format = "landscape" | "portrait";
const STAGE: Record<Format, { w: number; h: number }> = {
  landscape: { w: 1280, h: 720 },
  portrait: { w: 405, h: 720 },
};

declare global {
  interface Window {
    __maaOneFilm?: { seek: (ms: number) => void; length: number };
  }
}

/**
 * The film with its controls. `format` fixes the layout (used by the video page); without it,
 * phones get the portrait layout and bigger screens the landscape one.
 */
export function ProductFilm({ format, controls = true }: { format?: Format; controls?: boolean }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tRef = useRef(0);

  const seek = useCallback((ms: number) => {
    tRef.current = Math.max(0, Math.min(FILM_LENGTH, ms));
    setT(tRef.current);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      seek(S[2] + 7_500);
    }
    window.__maaOneFilm = {
      seek: (ms) => {
        setPlaying(false);
        seek(ms);
      },
      length: FILM_LENGTH,
    };
    return () => mq.removeEventListener("change", update);
  }, [seek]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Loop, holding the end card for 2 s.
      let next = tRef.current + Math.min(100, now - last);
      last = now;
      if (next > FILM_LENGTH + 2_000) next = 0;
      tRef.current = next;
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, visible]);

  const f: Format = format ?? (narrow ? "portrait" : "landscape");
  const tt = Math.min(t, FILM_LENGTH);
  const active = sceneAt(tt);

  return (
    <div ref={rootRef} className={clsx(!format && "mx-auto w-full", !format && f === "portrait" && "max-w-[420px]")}>
      <ScaledStage format={f} bare={!controls}>
        <Stage t={tt} format={f} />
      </ScaledStage>
      {controls && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <div className="flex w-full max-w-xl gap-1.5" role="tablist" aria-label="Demo steps">
            {scenes.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`${i + 1}. ${s.title}`}
                title={s.title}
                onClick={() => {
                  seek(s.start);
                  setPlaying(true);
                }}
                className="flex-1 py-2"
              >
                <span className="block h-1 overflow-hidden rounded-full bg-white/20">
                  <span className="block h-full rounded-full bg-amber-300" style={{ width: `${(i < active ? 1 : i === active ? sceneProgress(tt, i) : 0) * 100}%` }} />
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (tt >= FILM_LENGTH) seek(0);
                setPlaying((p) => !p);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-indigo-900 shadow-lg transition-transform hover:scale-105"
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => {
                seek(0);
                setPlaying(true);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Restart the demo"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-sm text-indigo-100 tabular-nums" aria-live="off">
              {Math.floor(tt / 1000)}s / {FILM_LENGTH / 1000}s
            </span>
          </div>
          <p className="sr-only" aria-live="polite">
            Step {active + 1}: {scenes[active].title}. {scenes[active].body}
          </p>
        </div>
      )}
    </div>
  );
}

function sceneProgress(t: number, i: number) {
  const end = S[i + 1] ?? FILM_LENGTH;
  return Math.min(1, Math.max(0, (t - S[i]) / (end - S[i])));
}

/** Scales a fixed-size stage to the width of its container. */
function ScaledStage({ format, bare, children }: { format: Format; bare: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const { w, h } = STAGE[format];
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / w));
    ro.observe(el);
    setScale(el.clientWidth / w);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className={clsx("relative w-full overflow-hidden", !bare && "rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-white/10")} style={{ aspectRatio: `${w} / ${h}` }} aria-hidden="true">
      {scale > 0 && (
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: w, height: h, transform: `scale(${scale})` }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stage: laptop + phone + captions                                    */
/* ------------------------------------------------------------------ */

const DESK = { w: 1080, h: 620 };
const PHONE = { w: 270, h: 560 };

function Stage({ t, format }: { t: number; format: Format }) {
  const s = sceneAt(t);
  // Phone takes the spotlight in scene 4 (approve) and 6 (summary).
  const phoneFocus = Math.max(prog(t, S[3] - 300, 600) * (1 - prog(t, S[4] - 300, 600)), prog(t, S[5] + 3_500, 600) * (1 - prog(t, S[6] - 200, 400)));
  const endIn = prog(t, S[6], 700);

  const L =
    format === "landscape"
      ? {
          desk: { x: 36, y: 136, s: 0.855 },
          phone: { x: 1004 - 34 * phoneFocus, y: 146 - 42 * phoneFocus, s: 0.98 + 0.08 * phoneFocus },
        }
      : {
          desk: { x: 15, y: 150, s: 0.347 },
          phone: { x: (405 - PHONE.w * (0.8 + 0.04 * phoneFocus)) / 2, y: 238 - 12 * phoneFocus, s: 0.8 + 0.04 * phoneFocus },
        };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(120%_90%_at_0%_0%,#3b35b0_0%,#1e1b4b_55%,#120f33_100%)] font-sans text-white">
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[420px] w-[420px] rounded-full bg-indigo-400/20 blur-3xl" />

      <Caption t={t} format={format} />

      {/* Laptop */}
      <div
        className="absolute origin-top-left"
        style={{
          left: L.desk.x,
          top: L.desk.y,
          width: DESK.w,
          height: DESK.h,
          transform: `scale(${L.desk.s})`,
          filter: `brightness(${1 - 0.35 * phoneFocus}) saturate(${1 - 0.3 * phoneFocus})`,
        }}
      >
        <DesktopWindow t={t} />
      </div>

      {/* Phone */}
      <div
        className="absolute origin-top-left"
        style={{ left: L.phone.x, top: L.phone.y, width: PHONE.w, height: PHONE.h, transform: `scale(${L.phone.s})` }}
      >
        <PhoneDevice t={t} />
      </div>

      {s >= 1 && s <= 5 && <SyncBadge t={t} format={format} />}
      {endIn > 0 && <EndCard t={t} format={format} />}
    </div>
  );
}

function Caption({ t, format }: { t: number; format: Format }) {
  const i = Math.min(sceneAt(t), 5);
  const sc = scenes[i];
  const fade = prog(t, sc.start, 450);
  const big = format === "portrait";
  return (
    <div
      className={clsx("absolute", big ? "inset-x-5 top-6 text-center" : "top-7 left-10 max-w-[1180px]")}
      style={{ opacity: fade, transform: `translateY(${(1 - fade) * 10}px)` }}
    >
      <p className={clsx("font-bold tracking-[0.14em] text-amber-300 uppercase", big ? "text-[11px]" : "text-[13px]")}>
        Step {i + 1} of 6
      </p>
      <p className={clsx("font-extrabold tracking-tight", big ? "mt-1 text-[21px] leading-tight" : "mt-1 text-[30px] leading-none")}>{sc.title}</p>
      <p className={clsx("text-indigo-100", big ? "mt-1.5 text-[12.5px] leading-snug" : "mt-2 text-[16px]")}>{sc.body}</p>
    </div>
  );
}

function SyncBadge({ t, format }: { t: number; format: Format }) {
  const on = between(t, S[3] + 3_200, S[3] + 6_400);
  const p = on ? prog(t, S[3] + 3_200, 300) * (1 - prog(t, S[3] + 6_000, 300)) : 0;
  if (!p) return null;
  return (
    <div
      className={clsx(
        "absolute flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 font-semibold text-white shadow-xl",
        format === "landscape" ? "top-[118px] left-[560px] text-[13px]" : "top-[232px] left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap",
      )}
      style={{ opacity: p }}
    >
      <RefreshCw className={format === "landscape" ? "h-4 w-4" : "h-3 w-3"} /> Synced to laptop
    </div>
  );
}

function EndCard({ t, format }: { t: number; format: Format }) {
  const fade = prog(t, S[6], 700);
  const rise = prog(t, S[6] + 300, 800);
  const big = format === "landscape";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(100%_80%_at_50%_0%,#3b35b0_0%,#1e1b4b_60%,#120f33_100%)] px-8 text-center" style={{ opacity: fade }}>
      <div style={{ opacity: rise, transform: `translateY(${(1 - rise) * 18}px)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/maa-one-logo-560.webp" alt="" className={clsx("mx-auto rounded-2xl bg-white px-5 py-3 shadow-2xl", big ? "w-[340px]" : "w-[230px]")} />
        <p className={clsx("font-extrabold text-amber-300", big ? "mt-7 text-[34px]" : "mt-6 text-[22px]")}>Poora business, ek app mein.</p>
        <p className={clsx("text-indigo-100", big ? "mt-3 text-[17px]" : "mt-2 text-[12.5px]")}>
          One inbox · AI replies · Pipeline · Follow-ups · Daily summary
        </p>
        <p className={clsx("text-indigo-200/80", big ? "mt-1.5 text-[14px]" : "mt-1.5 text-[11px]")}>Next: bookings, GST invoices and UPI payments</p>
        <p className={clsx("mx-auto inline-flex items-center gap-2 rounded-full bg-amber-400 font-bold text-slate-950", big ? "mt-7 px-5 py-2.5 text-[16px]" : "mt-6 px-4 py-2 text-[12px]")}>
          Launching 2027 · one.maalabs.in
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop web app                                                     */
/* ------------------------------------------------------------------ */

type Page = "settings" | "inbox" | "leads" | "home";

function DesktopWindow({ t }: { t: number }) {
  const s = sceneAt(t);
  const page: Page = s === 0 ? "settings" : s <= 3 ? "inbox" : s === 4 ? "leads" : "home";
  const url = { settings: "settings/channels", inbox: "inbox", leads: "leads", home: "home" }[page];
  const swap = s >= 1 ? prog(t, S[Math.min(s, 5)], 350) : 1;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-white text-slate-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/20">
      {/* Browser chrome */}
      <div className="flex h-[34px] items-center gap-3 border-b border-slate-200 bg-slate-100 px-3">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto flex w-[420px] items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-[12px] text-slate-500 ring-1 ring-slate-200">
          <Lock className="h-3 w-3" /> app.maalabs.in/{url}
        </span>
        <span className="w-[54px]" />
      </div>
      <div className="flex h-[586px]">
        <Sidebar page={page} t={t} />
        <div className="relative min-w-0 flex-1 bg-[#f6f6fb]" style={{ opacity: 0.3 + 0.7 * swap }}>
          {page === "settings" && <SettingsPage t={t} />}
          {page === "inbox" && <InboxPage t={t} />}
          {page === "leads" && <LeadsPage t={t} />}
          {page === "home" && <DashboardPage t={t} />}
        </div>
      </div>
      <Cursor t={t} />
    </div>
  );
}

function Sidebar({ page, t }: { page: Page; t: number }) {
  const unread = t < S[1] ? 0 : t < S[2] ? visibleLeads.filter((l) => t > l.at).length : t < S[3] + 3_000 ? 4 : 3;
  const items: { id: Page | "contacts" | "reports"; label: string; Icon: typeof Home }[] = [
    { id: "home", label: "Home", Icon: Home },
    { id: "inbox", label: "Inbox", Icon: Inbox },
    { id: "leads", label: "Leads", Icon: KanbanSquare },
    { id: "contacts", label: "Contacts", Icon: Contact },
    { id: "reports", label: "Reports", Icon: BarChart3 },
    { id: "settings", label: "Settings", Icon: Settings },
  ];
  return (
    <aside className="flex w-[176px] shrink-0 flex-col bg-[linear-gradient(180deg,#1e1b4b_0%,#2a2580_60%,#312e81_100%)] px-3 py-4 text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/maa-one-logo-280.webp" alt="" className="h-9 w-auto self-start" />
      <p className="mt-1.5 truncate text-[10px] font-semibold tracking-[0.1em] text-indigo-200 uppercase">{BUSINESS}</p>
      <nav className="mt-5 space-y-1">
        {items.map(({ id, label, Icon }) => (
          <span
            key={id}
            className={clsx("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium", id === page ? "bg-[#4f46e5] text-white shadow-lg shadow-black/20" : "text-indigo-100/85")}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {id === "inbox" && unread > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-[10px] leading-4 font-bold">{unread}</span>}
          </span>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2 rounded-xl bg-white/10 p-2">
        <Avatar name={OWNER} className="h-7 w-7 text-[11px]" />
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold">{OWNER} (Owner)</span>
          <span className="block text-[10px] text-indigo-200">Growth plan</span>
        </span>
      </div>
    </aside>
  );
}

function PageHeader({ title, sub, right }: { title: string; sub: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between border-b border-slate-200 bg-white px-6 py-3.5">
      <div>
        <p className="text-[19px] font-bold tracking-tight">{title}</p>
        <p className="text-[12px] text-slate-500">{sub}</p>
      </div>
      {right}
    </div>
  );
}

/* ---- Scene 1: settings ---- */

function SettingsPage({ t }: { t: number }) {
  const wa = t > 1_700 ? "on" : t > 900 ? "busy" : "off";
  const web = t > 2_700 ? "on" : t > 2_000 ? "busy" : "off";
  return (
    <div className="h-full">
      <PageHeader title="Set up Maa One" sub="Connect where your enquiries come from — AI replies use your business profile." />
      <div className="grid grid-cols-[1fr_1.15fr] gap-4 p-5">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-[14px] font-bold">Channels</p>
          <div className="mt-3 space-y-2.5">
            <ChannelRow icon={<WhatsAppIcon className="h-5 w-5 text-emerald-600" />} name="WhatsApp Business" detail="+91 98140 •• 220" state={wa} />
            <ChannelRow icon={<Globe className="h-5 w-5 text-indigo-600" />} name="Website enquiry form" detail="glowandgrace.in · WordPress" state={web} />
            <ChannelRow icon={<InstagramIcon className="h-5 w-5 text-pink-600" />} name="Instagram DMs" detail="@glowandgrace.mumbai" state="soon" />
          </div>
          <div className="mt-4 rounded-lg bg-indigo-50 p-3 text-[11.5px] text-indigo-900" style={{ opacity: prog(t, 3_000, 400) }}>
            <b>Any website works:</b> paste one line of code to add the enquiry form and WhatsApp button.
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="flex items-center gap-1.5 text-[14px] font-bold">
            <Sparkles className="h-4 w-4 text-amber-500" /> Business profile
            <span className="ml-auto text-[11px] font-medium text-slate-400">AI uses this for every reply</span>
          </p>
          <p className="mt-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Services and prices</p>
          <div className="mt-1.5 space-y-1.5">
            {profile.map((p, i) => {
              const v = prog(t, 1_200 + i * 650, 350);
              return (
                <div key={p.label} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-[12.5px]" style={{ opacity: v, transform: `translateY(${(1 - v) * 6}px)` }}>
                  <span className="font-medium">{p.label}</span>
                  <span className="text-slate-600">{p.price}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]" style={{ opacity: prog(t, 4_000, 400) }}>
            <Field label="Area served" value="Mumbai · Bandra West" />
            <Field label="Working hours" value="10 AM – 8 PM, Mon–Sat" />
          </div>
          <p className="mt-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase" style={{ opacity: prog(t, 4_600, 400) }}>
            Reply languages
          </p>
          <div className="mt-1.5 flex gap-1.5">
            {["Hinglish", "Hindi", "Punjabi", "English"].map((l, i) => {
              const on = prog(t, 4_800 + i * 250, 250);
              return (
                <span key={l} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold" style={{ opacity: 0.25 + 0.75 * on, borderColor: on > 0.5 ? "#4f46e5" : "#e2e8f0", color: on > 0.5 ? "#3730a3" : "#64748b", background: on > 0.5 ? "#eef2ff" : "white" }}>
                  {on > 0.5 && <Check className="h-3 w-3" />} {l}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelRow({ icon, name, detail, state }: { icon: ReactNode; name: string; detail: string; state: "off" | "busy" | "on" | "soon" }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold">{name}</span>
        <span className="block text-[11px] text-slate-500">{detail}</span>
      </span>
      {state === "on" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          <Check className="h-3 w-3" /> Connected
        </span>
      )}
      {state === "busy" && <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700"><Spin /> Connecting</span>}
      {state === "off" && <span className="rounded-lg bg-[#3730A3] px-3 py-1.5 text-[11px] font-bold text-white">Connect</span>}
      {state === "soon" && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">Coming in v2</span>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-1.5">
      <p className="text-[10.5px] text-slate-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

/* ---- Scenes 2–4: inbox ---- */

function InboxPage({ t }: { t: number }) {
  const open = t >= S[2] - 300;
  const sent = t >= S[3] + 2_900;
  const stage = sent ? "Contacted" : "New";
  const arrived = visibleLeads.filter((l) => t > l.at);
  const spamCaught = t > leads[2].at + 900;
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Inbox"
        sub={`${arrived.length} new today · ${arrived.filter((l) => l.score === "Hot").length} hot · replies drafted by AI`}
        right={
          <span className="flex gap-1.5 text-[11.5px] font-semibold">
            {["All", "Hot", "Warm", "Cold"].map((f, i) => (
              <span key={f} className={clsx("rounded-full px-3 py-1", i === 0 ? "bg-[#3730A3] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>
                {f}
              </span>
            ))}
            <span className={clsx("rounded-full px-3 py-1 ring-1 transition-colors", spamCaught ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-white text-slate-400 ring-slate-200")}>
              Spam {spamCaught ? "1" : "0"}
            </span>
          </span>
        }
      />
      <div className="flex min-h-0 flex-1">
        {/* List */}
        <ul className="w-[262px] shrink-0 space-y-1.5 overflow-hidden border-r border-slate-200 bg-white p-2">
          {leads.map((l) => {
            const inn = prog(t, l.at, 450);
            if (!inn) return null;
            const isSpam = l.score === "Spam";
            const out = isSpam ? prog(t, l.at + 1_000, 450) : 0;
            const selected = l.id === "simran" && open;
            const scoreIn = prog(t, l.at + 450, 300);
            return (
              <li
                key={l.id}
                className={clsx("overflow-hidden rounded-lg", selected ? "bg-indigo-50 ring-2 ring-indigo-300" : "")}
                style={{ maxHeight: `${(1 - out) * inn * 76}px`, opacity: inn * (1 - out), transform: `translateX(${out * 40}px)` }}
              >
                <div className="flex gap-2.5 px-2.5 py-2">
                  <Avatar name={l.name} className="h-8 w-8 text-[11px]" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[12.5px] font-semibold">{l.name}</span>
                      <ChannelIcon channel={l.channel} className="h-3 w-3" />
                      <span className="ml-auto text-[10.5px] text-slate-400">{l.time}</span>
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-600">{l.id === "simran" && sent ? `You: ${draft}` : l.msg}</span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <ScoreChip score={l.score} pop={scoreIn} />
                      {l.id === "simran" && sent && <StagePill stage="Contacted" />}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Conversation */}
        <div className="flex min-w-0 flex-1 flex-col bg-[#f3f1ec]">
          {!open ? (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
              <Inbox className="h-10 w-10" />
              <p className="mt-2 text-[13px]">Select a conversation</p>
            </div>
          ) : (
            <ConversationDesktop t={t} sent={sent} />
          )}
        </div>

        {/* Lead details */}
        {open && <LeadPanel t={t} stage={stage} />}
      </div>
    </div>
  );
}

function ConversationDesktop({ t, sent }: { t: number; sent: boolean }) {
  const formIn = prog(t, S[2] - 300, 400);
  const draftIn = prog(t, S[2] + 2_600, 450);
  const typed = Math.round(draft.length * Math.min(1, Math.max(0, (t - (S[2] + 3_000)) / 4_200)));
  const lang = t > S[2] + 7_500 && t < S[3] ? "Hinglish" : "Hinglish";
  const sentIn = prog(t, S[3] + 2_900, 450);
  return (
    <>
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <Avatar name="Simran Kaur" className="h-8 w-8 text-[11px]" />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold">Simran Kaur</span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Globe className="h-3 w-3" /> Website form · glowandgrace.in/bridal · +91 98765 •• 410
          </span>
        </span>
      </div>
      <div className="flex-1 space-y-2.5 overflow-hidden p-4">
        <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-white p-3 shadow-sm" style={{ opacity: formIn }}>
          <p className="text-[10.5px] font-bold tracking-wide text-indigo-600 uppercase">Website enquiry</p>
          <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11.5px]">
            <span className="text-slate-500">Service</span>
            <span className="font-medium">Bridal makeup</span>
            <span className="text-slate-500">Wedding date</span>
            <span className="font-medium">14 Feb 2027</span>
            <span className="text-slate-500">Budget</span>
            <span className="font-medium">About ₹20,000</span>
          </div>
          <p className="mt-2 text-[12.5px]">14 Feb ko meri shaadi hai, bridal makeup chahiye. Trial ho sakta hai pehle?</p>
          <p className="mt-1 text-right text-[10px] text-slate-400">11:42</p>
        </div>
        {sent && (
          <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-[#d9fdd3] p-3 text-[12.5px] shadow-sm" style={{ opacity: sentIn, transform: `translateY(${(1 - sentIn) * 12}px)` }}>
            {draft}
            <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
              <WhatsAppIcon className="h-3 w-3 text-emerald-600" /> Sent on WhatsApp by {OWNER} · 11:44 <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
            </span>
          </div>
        )}
      </div>
      {!sent && draftIn > 0 && (
        <div className="m-3 rounded-xl border border-amber-300 bg-amber-50 p-3 shadow-lg" style={{ opacity: draftIn, transform: `translateY(${(1 - draftIn) * 30}px)` }}>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[12px] font-bold whitespace-nowrap text-amber-800">
              <Sparkles className="h-3.5 w-3.5" /> AI draft
            </span>
            <span className="flex gap-1 text-[10.5px] font-semibold">
              {["Hinglish", "Hindi", "Punjabi", "English"].map((l) => (
                <span key={l} className={clsx("rounded-full px-2 py-0.5", l === lang ? "bg-amber-500 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200")}>
                  {l}
                </span>
              ))}
            </span>
          </div>
          <p className="mt-2 min-h-[54px] text-[12.5px] leading-snug text-slate-800">
            <Highlighted text={draft.slice(0, typed)} />
            {typed < draft.length && <span className="ml-0.5 inline-block h-3.5 w-0.5 bg-slate-700 align-middle" />}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#3730A3] px-3.5 py-2 text-[12px] font-semibold whitespace-nowrap text-white">
              <Send className="h-3.5 w-3.5" /> Approve &amp; send
            </span>
            <span className="rounded-lg bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200">Edit</span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-[12px] font-semibold whitespace-nowrap text-slate-700 ring-1 ring-slate-200">
              <Wand2 className="h-3.5 w-3.5" /> Rewrite
            </span>
          </div>
        </div>
      )}
    </>
  );
}

/** Highlights the prices taken from the business profile. */
function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(₹[\d,]+)/);
  return (
    <>
      {parts.map((p, i) =>
        /^₹[\d,]+$/.test(p) ? (
          <mark key={i} className="rounded bg-amber-200/80 px-0.5 text-slate-900">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function LeadPanel({ t, stage }: { t: number; stage: string }) {
  const scoreIn = prog(t, S[2] + 500, 450);
  const reasons = ["Wedding date fixed — 14 Feb", "Budget shared — about ₹20,000", "Asked for a trial → ready to book"];
  return (
    <aside className="w-[222px] shrink-0 overflow-hidden border-l border-slate-200 bg-white p-3.5" style={{ opacity: prog(t, S[2] - 200, 400) }}>
      <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">AI lead score</p>
      <div className="mt-1.5 flex items-center gap-2" style={{ opacity: scoreIn, transform: `scale(${0.85 + 0.15 * scoreIn})`, transformOrigin: "left" }}>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-[15px] font-extrabold text-rose-600 ring-4 ring-rose-100">92</span>
        <span>
          <ScoreChip score="Hot" />
          <span className="mt-0.5 block text-[11px] text-slate-500">Likely to book this week</span>
        </span>
      </div>
      <ul className="mt-2.5 space-y-1">
        {reasons.map((r, i) => {
          const v = prog(t, S[2] + 1_000 + i * 450, 350);
          return (
            <li key={r} className="flex gap-1.5 text-[11.5px] text-slate-700" style={{ opacity: v, transform: `translateX(${(1 - v) * 8}px)` }}>
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {r}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-[11.5px]">
        <Detail label="Source" value="Website form" />
        <Detail label="Service" value="Bridal makeup" />
        <Detail label="Expected value" value="₹18,000" />
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Stage</span>
          <StagePill stage={stage} withChevron />
        </div>
        <Detail label="Assigned to" value={OWNER} />
      </div>
    </aside>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/* ---- Scene 5: pipeline ---- */

const columns = [
  { name: "New", cards: [{ n: "Pooja Shetty", v: "—" }, { n: "Neha Iyer", v: "₹1,200" }] },
  { name: "Contacted", cards: [{ n: "Aisha Khan", v: "₹1,200" }, { n: "Rohit Deshmukh", v: "₹14,000" }] },
  { name: "Quote sent", cards: [{ n: "Mehak Shah", v: "₹22,000" }] },
  { name: "Won", cards: [{ n: "Ritika Ahuja", v: "₹19,500" }, { n: "Kavya Jain", v: "₹3,500" }, { n: "Aman & family", v: "₹14,000" }] },
  { name: "Lost", cards: [{ n: "Sonia D.", v: "₹18,000" }] },
];

function LeadsPage({ t }: { t: number }) {
  const s0 = S[4];
  const drag = prog(t, s0 + 1_400, 900); // Contacted → Quote sent
  const popIn = prog(t, s0 + 2_700, 350);
  const reminderSet = t > s0 + 4_300;
  const assigned = t > s0 + 5_600;
  const colW = 166;
  const gap = 10;
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Leads" sub="Pipeline · 9 open leads · ₹74,700 expected" right={<span className="rounded-lg bg-[#3730A3] px-3 py-1.5 text-[12px] font-semibold text-white">+ Add lead</span>} />
      <div className="relative flex-1 p-4">
        <div className="flex" style={{ gap }}>
          {columns.map((c, ci) => (
            <div key={c.name} className="shrink-0 rounded-xl bg-slate-100 p-2" style={{ width: colW }}>
              <p className={clsx("flex items-center justify-between px-1 text-[12px] font-bold", ci === 3 ? "text-emerald-700" : ci === 4 ? "text-slate-500" : "text-slate-700")}>
                {c.name}
                <span className="rounded-full bg-white px-1.5 text-[10.5px] text-slate-500">
                  {c.cards.length + (ci === 1 && drag < 0.5 ? 1 : 0) + (ci === 2 && drag >= 0.5 ? 1 : 0)}
                </span>
              </p>
              <div className="mt-2 space-y-1.5">
                {/* Simran's slot */}
                {ci === 1 && <div style={{ height: 74 * (1 - drag) }} />}
                {ci === 2 && <div style={{ height: 74 * drag }} />}
                {c.cards.map((card) => (
                  <div key={card.n} className="rounded-lg bg-white p-2 shadow-sm">
                    <p className="truncate text-[12px] font-semibold">{card.n}</p>
                    <p className="text-[11px] text-slate-500">{card.v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Simran's card, dragged from Contacted to Quote sent */}
        <div
          className="absolute rounded-lg bg-white p-2 shadow-xl ring-2 ring-amber-300"
          style={{
            width: colW - 16,
            top: 16 + 34 - 8 * Math.sin(Math.PI * drag),
            left: 16 + 8 + lerp(1, 2, drag) * (colW + gap),
            transform: `rotate(${3 * Math.sin(Math.PI * drag)}deg)`,
          }}
        >
          <p className="flex items-center justify-between text-[12px] font-bold">
            Simran Kaur <ScoreChip score="Hot" />
          </p>
          <p className="text-[11px] text-slate-500">Bridal · ₹18,000</p>
          <p className="mt-1 flex items-center gap-1.5 text-[10.5px]">
            {reminderSet && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">
                <Bell className="h-3 w-3" /> Sat 11:00
              </span>
            )}
            {assigned && <Avatar name="Manpreet" className="ml-auto h-5 w-5 text-[8.5px]" />}
          </p>
        </div>

        {/* Follow-up popover */}
        {popIn > 0 && (
          <div
            className="absolute w-[250px] rounded-xl bg-white p-3 shadow-2xl ring-1 ring-black/10"
            style={{ top: 70, left: 16 + 2 * (colW + gap) + colW + 4, opacity: popIn * (1 - prog(t, s0 + 6_700, 300)), transform: `translateY(${(1 - popIn) * 8}px)` }}
          >
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold">
              <Bell className="h-4 w-4 text-amber-500" /> Follow-up
            </p>
            <div className="mt-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px]">
              <span className="text-slate-400">When </span>Saturday, 11:00 AM
            </div>
            <div className="mt-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px]">
              <span className="text-slate-400">Note </span>Confirm Sunday trial
            </div>
            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px]">
              <span>
                <span className="text-slate-400">Assign </span>
                {assigned || t > s0 + 5_000 ? "Manpreet (staff)" : OWNER}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <span className={clsx("mt-2.5 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[12px] font-semibold", reminderSet ? "bg-emerald-50 text-emerald-700" : "bg-[#3730A3] text-white")}>
              {reminderSet ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Reminder set
                </>
              ) : (
                "Save"
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Scene 6: dashboard ---- */

const byDay = [6, 9, 7, 12, 8, 14, 9];
const days = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Today"];

function DashboardPage({ t }: { t: number }) {
  const s0 = S[5];
  const grow = prog(t, s0 + 300, 1_400);
  const tiles = [
    { label: "Leads today", value: Math.round(9 * grow), suffix: "", note: "6 WhatsApp · 3 website" },
    { label: "Avg. first reply", value: Math.max(3, Math.round(lerp(240, 3, grow))), suffix: " min", note: "was 4 hours before Maa One" },
    { label: "Waiting for reply", value: 2, suffix: "", note: "both under 10 minutes" },
    { label: "Won this week", value: Math.round(62_500 * grow), suffix: "", note: "6 bookings", money: true },
  ];
  return (
    <div className="flex h-full flex-col">
      <PageHeader title={`Good evening, ${OWNER}`} sub={`${BUSINESS} · today at a glance`} />
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-4 gap-3">
          {tiles.map((k) => (
            <div key={k.label} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <p className="text-[11.5px] text-slate-500">{k.label}</p>
              <p className="mt-1 text-[24px] font-extrabold tracking-tight tabular-nums">
                {k.money ? `₹${k.value.toLocaleString("en-IN")}` : k.value}
                {k.suffix && <span className="text-[14px] font-bold text-slate-500">{k.suffix}</span>}
              </p>
              <p className="text-[10.5px] text-slate-500">{k.note}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1.6fr_1fr] gap-3">
          <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200">
            <p className="text-[13px] font-bold">Leads by day</p>
            <div className="mt-3 flex h-[150px] items-end gap-3">
              {byDay.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10.5px] font-semibold text-slate-500" style={{ opacity: grow }}>{v}</span>
                  <div className={clsx("w-full rounded-t-md", i === 6 ? "bg-amber-400" : "bg-indigo-500")} style={{ height: `${(v / 14) * 120 * prog(t, s0 + 300 + i * 90, 700)}px` }} />
                  <span className="text-[10.5px] text-slate-400">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200">
            <p className="text-[13px] font-bold">Leads by source</p>
            <div className="mt-3 flex items-center gap-4">
              <Donut p={grow} />
              <ul className="space-y-2 text-[12px]">
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> WhatsApp <b className="ml-auto pl-3">61%</b>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Website <b className="ml-auto pl-3">39%</b>
                </li>
              </ul>
            </div>
            <p className="mt-3 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800">Reply time is 80× faster than last month</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Donut({ p }: { p: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 90 90" className="h-[96px] w-[96px] -rotate-90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="#6366f1" strokeWidth="14" strokeDasharray={`${c * p} ${c}`} />
      <circle cx="45" cy="45" r={r} fill="none" stroke="#10b981" strokeWidth="14" strokeDasharray={`${c * 0.61 * p} ${c}`} />
    </svg>
  );
}

/* ---- Mouse pointer on the laptop ---- */

// [time ms, x, y, click]: positions inside the desktop window (1080 × 620).
const path: [number, number, number, boolean?][] = [
  [0, 670, 434],
  [700, 977, 157],
  [900, 977, 157, true],
  [1_600, 929, 217],
  [2_000, 977, 219, true],
  [3_000, 864, 310],
  [S[1], 620, 380],
  [S[2] - 1_200, 360, 300],
  [S[2] - 500, 330, 150],
  [S[2] - 350, 330, 150, true],
  [S[2] + 2_000, 600, 380],
  [S[2] + 7_400, 560, 520],
  [S[3], 560, 520],
  [S[4] + 400, 400, 200],
  [S[4] + 1_300, 410, 160],
  [S[4] + 1_400, 410, 160, true],
  [S[4] + 2_300, 572, 160],
  [S[4] + 2_500, 572, 160, true],
  [S[4] + 3_800, 760, 300],
  [S[4] + 4_200, 760, 300, true],
  [S[4] + 4_800, 860, 260],
  [S[4] + 5_000, 860, 260, true],
  [S[4] + 5_600, 860, 380],
  [S[5], 640, 420],
];

function Cursor({ t }: { t: number }) {
  if (t >= S[6]) return null;
  let i = 0;
  while (i < path.length - 1 && path[i + 1][0] <= t) i++;
  const a = path[i];
  const b = path[i + 1] ?? a;
  const p = b === a ? 1 : prog(t, a[0], b[0] - a[0]);
  const x = lerp(a[1], b[1], p);
  const y = lerp(a[2], b[2], p);
  const click = path.find((k) => k[3] && t >= k[0] && t < k[0] + 350);
  const cp = click ? (t - click[0]) / 350 : 0;
  return (
    <div className="pointer-events-none absolute z-50" style={{ left: x, top: y }}>
      {click && <span className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-indigo-500/30" style={{ transform: `scale(${0.4 + cp})`, opacity: 1 - cp }} />}
      <MousePointer2 className="h-5 w-5 fill-slate-900 text-white drop-shadow" style={{ transform: click ? "scale(0.85)" : undefined }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile app                                                          */
/* ------------------------------------------------------------------ */

function PhoneDevice({ t }: { t: number }) {
  return (
    <div className="relative h-full w-full rounded-[42px] bg-slate-950 p-[7px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/15">
      <div className="absolute top-[14px] left-1/2 z-40 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
      <div className="relative h-full w-full overflow-hidden rounded-[35px] bg-[#f6f6fb] text-slate-900">
        <PhoneScreens t={t} />
      </div>
    </div>
  );
}

function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={clsx("flex h-[34px] items-end justify-between px-6 pb-1 text-[11px] font-semibold", dark ? "text-white" : "text-slate-900")}>
      <span>11:44</span>
      <span className="flex items-center gap-1">
        <span className="flex items-end gap-px">
          {[3, 5, 7, 9].map((h) => (
            <span key={h} className={clsx("w-[2.5px] rounded-sm", dark ? "bg-white" : "bg-slate-900")} style={{ height: h }} />
          ))}
        </span>
        <span className={clsx("ml-1 h-[9px] w-[18px] rounded-[3px] border p-px", dark ? "border-white" : "border-slate-900")}>
          <span className={clsx("block h-full w-3/4 rounded-[1px]", dark ? "bg-white" : "bg-slate-900")} />
        </span>
      </span>
    </div>
  );
}

function PhoneScreens({ t }: { t: number }) {
  const s = sceneAt(t);
  if (s === 0) return <PhoneSetup t={t} />;
  if (s === 1) return <PhoneInbox t={t} />;
  if (s === 2 || s === 3) return <PhoneChat t={t} />;
  if (s === 4) return <PhoneLead t={t} />;
  return <PhoneSummary t={t} />;
}

function AppBar({ title, sub, back = false }: { title: string; sub?: string; back?: boolean }) {
  return (
    <div className="bg-[#3730A3] text-white">
      <StatusBar dark />
      <div className="flex items-center gap-2 px-4 pt-1 pb-3">
        {back && <span className="text-[18px] leading-none">‹</span>}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold">{title}</span>
          {sub && <span className="block truncate text-[11px] text-indigo-200">{sub}</span>}
        </span>
      </div>
    </div>
  );
}

function TabBar({ active }: { active: "Home" | "Inbox" | "Leads" | "More" }) {
  const items = [
    { label: "Home", Icon: Home },
    { label: "Inbox", Icon: Inbox },
    { label: "Leads", Icon: KanbanSquare },
    { label: "More", Icon: UserRound },
  ] as const;
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-slate-200 bg-white px-2 pt-2 pb-5">
      {items.map(({ label, Icon }) => (
        <span key={label} className={clsx("flex flex-col items-center gap-0.5 text-[10px] font-semibold", label === active ? "text-[#3730A3]" : "text-slate-400")}>
          <Icon className="h-[18px] w-[18px]" />
          {label}
        </span>
      ))}
    </div>
  );
}

function PhoneSetup({ t }: { t: number }) {
  const steps = [
    { label: "WhatsApp Business connected", at: 1_700 },
    { label: "Website form connected", at: 2_700 },
    { label: "Business profile filled", at: 5_600 },
  ];
  const done = steps.filter((st) => t > st.at).length;
  return (
    <div className="h-full">
      <AppBar title="Welcome, Harleen" sub={BUSINESS} />
      <div className="p-4">
        <p className="text-[13px] font-bold">Set up in 3 steps</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${(done / 3) * 100}%` }} />
        </div>
        <ul className="mt-4 space-y-2.5">
          {steps.map((st) => {
            const ok = t > st.at;
            return (
              <li key={st.label} className={clsx("flex items-center gap-3 rounded-xl p-3 text-[12.5px] font-medium shadow-sm", ok ? "bg-emerald-50 text-emerald-900" : "bg-white text-slate-700")}>
                <span className={clsx("flex h-6 w-6 items-center justify-center rounded-full", ok ? "bg-emerald-500 text-white" : "border-2 border-slate-300")}>{ok && <Check className="h-3.5 w-3.5" />}</span>
                {st.label}
              </li>
            );
          })}
        </ul>
        <div className="mt-5 rounded-xl bg-indigo-50 p-3 text-[12px] text-indigo-900">
          Install the app to get a <b>notification for every new lead</b> — wherever you are.
        </div>
        <span className={clsx("mt-5 flex items-center justify-center rounded-xl py-3 text-[13px] font-bold", done === 3 ? "bg-[#3730A3] text-white" : "bg-slate-200 text-slate-400")}>
          Go to inbox
        </span>
      </div>
    </div>
  );
}

function PhoneInbox({ t }: { t: number }) {
  const notif = prog(t, leads[0].at + 200, 400) * (1 - prog(t, leads[0].at + 3_200, 400));
  return (
    <div className="relative h-full">
      <AppBar title="Inbox" sub={`${visibleLeads.filter((l) => t > l.at).length} new · AI-sorted`} />
      <div className="flex gap-1.5 px-3 py-2.5 text-[11px] font-semibold">
        {["All", "Hot", "Warm", "Cold"].map((f, i) => (
          <span key={f} className={clsx("rounded-full px-3 py-1", i === 0 ? "bg-[#3730A3] text-white" : "bg-white text-slate-600 shadow-sm")}>
            {f}
          </span>
        ))}
      </div>
      <ul className="space-y-1.5 px-2.5">
        {visibleLeads.map((l) => {
          const inn = prog(t, l.at, 450);
          if (!inn) return null;
          return (
            <li key={l.id} className="overflow-hidden rounded-xl bg-white shadow-sm" style={{ maxHeight: inn * 70, opacity: inn }}>
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <Avatar name={l.name} className="h-9 w-9 text-[11px]" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-[12.5px] font-semibold">{l.name}</span>
                    <ChannelIcon channel={l.channel} className="h-3 w-3 shrink-0" />
                  </span>
                  <span className="block truncate text-[11.5px] text-slate-600">{l.msg}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-400">{l.time}</span>
                  <ScoreChip score={l.score} pop={prog(t, l.at + 450, 300)} />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <TabBar active="Inbox" />
      {notif > 0 && <PushNotification title="Hot lead · Simran Kaur" body="Website form: Bridal makeup for 14 Feb, asked for a trial" p={notif} />}
    </div>
  );
}

function PhoneChat({ t }: { t: number }) {
  const draftIn = prog(t, S[2] + 2_600, 450);
  const typed = Math.round(draft.length * Math.min(1, Math.max(0, (t - (S[2] + 3_000)) / 4_200)));
  const tapAt = S[3] + 1_700;
  const pressed = between(t, tapAt, tapAt + 350);
  const sending = between(t, tapAt + 350, tapAt + 1_000);
  const sent = t >= tapAt + 1_000;
  const sentIn = prog(t, tapAt + 1_000, 450);
  const toast = prog(t, tapAt + 1_500, 350) * (1 - prog(t, S[4] - 600, 300));
  const notif = prog(t, S[3] - 200, 400) * (1 - prog(t, S[3] + 1_100, 300));
  return (
    <div className="relative flex h-full flex-col bg-[#efeae2]">
      <div className="bg-[#3730A3] text-white">
        <StatusBar dark />
        <div className="flex items-center gap-2.5 px-3 pt-1 pb-2.5">
          <span className="text-[18px] leading-none">‹</span>
          <Avatar name="Simran Kaur" className="h-8 w-8 text-[11px]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-bold">Simran Kaur</span>
            <span className="flex items-center gap-1 text-[10.5px] text-indigo-200">
              <Globe className="h-3 w-3" /> Website form · reply on WhatsApp
            </span>
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden p-2.5">
        <div className="rounded-xl bg-white/95 p-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11.5px] font-bold">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI lead score
            </span>
            <span className="flex items-center gap-1.5">
              <b className="text-[12px] text-rose-600">92</b> <ScoreChip score="Hot" pop={prog(t, S[2] + 500, 400)} />
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">Date fixed · budget shared · wants a trial</p>
        </div>
        <div className="max-w-[88%] rounded-xl rounded-tl-sm bg-white px-2.5 py-2 text-[12px] shadow-sm">
          14 Feb ko meri shaadi hai, bridal makeup chahiye. Trial ho sakta hai pehle? Budget around ₹20k.
          <span className="mt-0.5 block text-right text-[9.5px] text-slate-400">11:42</span>
        </div>
        {sent && (
          <div className="ml-auto max-w-[90%] rounded-xl rounded-tr-sm bg-[#d9fdd3] px-2.5 py-2 text-[12px] shadow-sm" style={{ opacity: sentIn, transform: `translateY(${(1 - sentIn) * 16}px) scale(${0.96 + 0.04 * sentIn})` }}>
            {draft}
            <span className="mt-0.5 flex items-center justify-end gap-1 text-[9.5px] text-slate-500">
              11:44 <CheckCheck className={clsx("h-3.5 w-3.5", t > tapAt + 2_200 ? "text-sky-500" : "text-slate-400")} />
            </span>
          </div>
        )}
      </div>
      {!sent && draftIn > 0 && (
        <div className="relative m-2 rounded-2xl border border-amber-300 bg-amber-50 p-2.5 shadow-lg" style={{ opacity: draftIn, transform: `translateY(${(1 - draftIn) * 40}px)` }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11.5px] font-bold whitespace-nowrap text-amber-800">
              <Sparkles className="h-3.5 w-3.5" /> AI draft
            </span>
            <span className="flex gap-0.5 text-[9.5px] font-semibold">
              {["Hinglish", "Hindi", "Punjabi"].map((l, i) => (
                <span key={l} className={clsx("rounded-full px-1.5 py-0.5", i === 0 ? "bg-amber-500 text-white" : "bg-white text-slate-500")}>
                  {l}
                </span>
              ))}
            </span>
          </div>
          <p className="mt-1.5 min-h-[64px] text-[12px] leading-snug text-slate-800">
            <Highlighted text={draft.slice(0, typed)} />
            {typed < draft.length && <span className="ml-0.5 inline-block h-3 w-0.5 bg-slate-700 align-middle" />}
          </p>
          <div className="mt-2 flex gap-1.5">
            <span className={clsx("relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-bold text-white transition-transform", pressed ? "scale-95 bg-indigo-900" : "bg-[#3730A3]", between(t, S[3] + 900, tapAt) && "ring-4 ring-amber-300/70")}>
              {sending ? <Spin /> : <Send className="h-3.5 w-3.5" />} {sending ? "Sending…" : "Approve & send"}
            </span>
            <span className="rounded-xl bg-white px-3 py-2.5 text-[12.5px] font-semibold text-slate-700">Edit</span>
          </div>
          {between(t, tapAt - 500, tapAt + 700) && <Tap p={(t - (tapAt - 500)) / 1_200} x={86} y={128} />}
        </div>
      )}
      {sent && (
        <div className="m-2 rounded-full bg-white px-4 py-2.5 text-[11.5px] text-slate-400 shadow-sm">Type a message…</div>
      )}
      {toast > 0 && (
        <div className="absolute inset-x-3 top-[86px] flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-[11.5px] font-semibold text-white shadow-xl" style={{ opacity: toast, transform: `translateY(${(1 - toast) * -8}px)` }}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
            <Check className="h-3 w-3" />
          </span>
          Sent on WhatsApp · replied in 2 min
        </div>
      )}
      {notif > 0 && <PushNotification title="Reply ready for Simran" body="AI drafted a reply in Hinglish. Tap to review and send." p={notif} />}
    </div>
  );
}

function PhoneLead({ t }: { t: number }) {
  const s0 = S[4];
  const stage = t > s0 + 2_400 ? "Quote sent" : "Contacted";
  const reminder = prog(t, s0 + 4_400, 400);
  const assigned = t > s0 + 5_600;
  const notif = prog(t, s0 + 6_000, 400);
  return (
    <div className="relative h-full">
      <AppBar title="Simran Kaur" sub="Bridal makeup · ₹18,000" back />
      <div className="space-y-2.5 p-3">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Stage</p>
          <div className="mt-2 flex gap-1">
            {["New", "Contacted", "Quote sent", "Won"].map((st) => {
              const on = st === stage;
              const past = ["New", "Contacted", "Quote sent", "Won"].indexOf(st) < ["New", "Contacted", "Quote sent", "Won"].indexOf(stage);
              return (
                <span key={st} className={clsx("flex-1 rounded-md py-1.5 text-center text-[10.5px] font-bold", on ? "bg-[#3730A3] text-white" : past ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400")}>
                  {st}
                </span>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm" style={{ opacity: 0.35 + 0.65 * reminder }}>
          <p className="flex items-center gap-1.5 text-[12.5px] font-bold">
            <Bell className="h-4 w-4 text-amber-500" /> Follow-up
          </p>
          <p className="mt-1 text-[12px]">Saturday, 11:00 AM — Confirm Sunday trial</p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-white p-3 shadow-sm">
          <Avatar name={assigned ? "Manpreet" : OWNER} className="h-8 w-8 text-[11px]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] text-slate-500">Assigned to</span>
            <span className="block text-[12.5px] font-semibold">{assigned ? "Manpreet (staff)" : `${OWNER} (you)`}</span>
          </span>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Activity</p>
          <ul className="mt-1.5 space-y-1 text-[11px] text-slate-600">
            <li>11:42 · Enquiry from website form</li>
            <li>11:44 · AI reply sent on WhatsApp by {OWNER}</li>
            {t > s0 + 2_400 && <li>11:52 · Moved to Quote sent</li>}
          </ul>
        </div>
      </div>
      <TabBar active="Leads" />
      {notif > 0 && <PushNotification title="Assigned to Manpreet" body="Simran Kaur · follow up Saturday 11:00 AM. Manpreet got a notification too." p={notif} />}
    </div>
  );
}

const summary = [
  "Aaj ka summary — Glow & Grace",
  "• 9 new leads (6 WhatsApp, 3 website)",
  "• 2 waiting for a reply",
  "• 3 hot: Simran, Rohit, Aisha",
  "• 4 follow-ups tomorrow",
  "Average first reply: 3 min",
];

function PhoneSummary({ t }: { t: number }) {
  const s0 = S[5];
  const msgIn = prog(t, s0 + 600, 450);
  const lines = summary.filter((_, i) => t > s0 + 900 + i * 380).length;
  return (
    <div className="relative flex h-full flex-col bg-[#efeae2]">
      <div className="bg-[#008069] text-white">
        <StatusBar dark />
        <div className="flex items-center gap-2.5 px-3 pt-1 pb-2.5">
          <span className="text-[18px] leading-none">‹</span>
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/maa-labs-mark-96.webp" alt="" className="h-6 w-6 object-contain" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[13.5px] font-bold">
              Maa One
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-300 text-[#008069]">
                <Check className="h-2.5 w-2.5" />
              </span>
            </span>
            <span className="block text-[10.5px] text-emerald-100">Business account · daily summary</span>
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-2 p-3">
        <p className="mx-auto w-fit rounded-md bg-white/80 px-2 py-0.5 text-[10px] text-slate-500">TODAY</p>
        <div className="max-w-[92%] rounded-xl rounded-tl-sm bg-white px-3 py-2.5 shadow-sm" style={{ opacity: msgIn, transform: `translateY(${(1 - msgIn) * 12}px)` }}>
          {summary.slice(0, lines).map((l, i) => (
            <p key={l} className={clsx("text-[12px] leading-relaxed", i === 0 && "font-bold", i === summary.length - 1 && "mt-1 font-semibold text-emerald-700")}>
              {l}
            </p>
          ))}
          <p className="mt-1 text-right text-[9.5px] text-slate-400">8:00 PM</p>
        </div>
        {lines === summary.length && (
          <div className="max-w-[92%] overflow-hidden rounded-xl bg-white shadow-sm" style={{ opacity: prog(t, s0 + 3_400, 400) }}>
            <span className="block px-3 py-2 text-center text-[12px] font-semibold text-[#008069]">Open inbox</span>
            <span className="block border-t border-slate-100 px-3 py-2 text-center text-[12px] font-semibold text-[#008069]">See tomorrow&rsquo;s follow-ups</span>
          </div>
        )}
      </div>
      <div className="m-2 rounded-full bg-white px-4 py-2.5 text-[11.5px] text-slate-400 shadow-sm">Message</div>
    </div>
  );
}

function PushNotification({ title, body, p }: { title: string; body: string; p: number }) {
  return (
    <div className="absolute inset-x-2 top-[40px] z-30 rounded-2xl bg-white/95 p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur" style={{ opacity: p, transform: `translateY(${(1 - p) * -60}px)` }}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/maa-labs-mark-96.webp" alt="" className="h-4 w-4 rounded bg-[#1e1b4b] object-contain p-px" />
        MAA ONE · now
      </div>
      <p className="mt-1 text-[12.5px] font-bold">{title}</p>
      <p className="text-[11.5px] leading-snug text-slate-600">{body}</p>
    </div>
  );
}

function Tap({ p, x, y }: { p: number; x: number; y: number }) {
  const c = Math.min(1, Math.max(0, p));
  return (
    <span className="pointer-events-none absolute z-20" style={{ left: x, top: y }}>
      <span className="absolute -top-5 -left-5 h-10 w-10 rounded-full bg-white/80 shadow-lg ring-2 ring-indigo-400" style={{ transform: `scale(${c < 0.4 ? 1 : 1 - (c - 0.4) * 0.6})`, opacity: c < 0.85 ? 0.9 : (1 - c) * 6 }} />
      <span className="absolute -top-8 -left-8 h-16 w-16 rounded-full border-2 border-white/80" style={{ transform: `scale(${0.3 + c})`, opacity: c > 0.4 ? 1 - c : 0 }} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const avatarTones = ["from-indigo-500 to-indigo-300", "from-rose-500 to-orange-300", "from-emerald-500 to-teal-300", "from-amber-500 to-yellow-300", "from-sky-500 to-cyan-300", "from-fuchsia-500 to-pink-300"];

function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("") || "?";
  const tone = avatarTones[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarTones.length];
  return <span className={clsx("flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white", tone, className)}>{initials}</span>;
}

function ChannelIcon({ channel, className }: { channel: Lead["channel"]; className?: string }) {
  return channel === "whatsapp" ? <WhatsAppIcon className={clsx("text-emerald-600", className)} /> : <Globe className={clsx("text-indigo-600", className)} />;
}

function ScoreChip({ score, pop = 1 }: { score: Score | "Won"; pop?: number }) {
  const tone = {
    Hot: "bg-rose-100 text-rose-700",
    Warm: "bg-amber-100 text-amber-800",
    Cold: "bg-sky-100 text-sky-700",
    Spam: "bg-slate-200 text-slate-600",
    Won: "bg-emerald-100 text-emerald-700",
  }[score];
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold", tone)} style={{ opacity: pop, transform: `scale(${0.6 + 0.4 * pop})` }}>
      {score}
    </span>
  );
}

function StagePill({ stage, withChevron = false }: { stage: string; withChevron?: boolean }) {
  const contacted = stage !== "New";
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold", contacted ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600")}>
      {stage}
      {withChevron && <ChevronDown className="h-3 w-3" />}
    </span>
  );
}

function Spin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

