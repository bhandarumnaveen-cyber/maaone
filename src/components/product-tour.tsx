"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Briefcase, Check, CheckCheck, FileText, Flame, Home, Inbox as InboxIcon, IndianRupee, KanbanSquare, Pause, Phone, Play, RotateCcw, Send, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "./icons";

/**
 * A 25-second animated walk-through of Maa One on a phone: a WhatsApp lead arrives, AI scores it,
 * drafts the reply, the owner sends it, and the job ends as a paid GST invoice.
 *
 * Everything on screen is a pure function of the time `t` (ms), so the tour can play like a video
 * here and be rendered frame by frame into an MP4 (see scripts/record-demo.mjs, which calls
 * window.__maaOneTour.seek(t)). It plays only while on screen and stays still for reduced motion.
 */

export const TOUR_LENGTH = 25_000;

const scenes = [
  { start: 0, title: "A new lead arrives", body: "Priya asks about CCTV on WhatsApp. Maa One shows it at the top of your inbox." },
  { start: 4_000, title: "AI marks it hot", body: "She wants 4 cameras and asked the price — so she's ready to buy." },
  { start: 8_000, title: "The reply is drafted for you", body: "In Hinglish, from your own prices. Hindi, Punjabi or English too." },
  { start: 13_500, title: "You approve in one tap", body: "Sent on WhatsApp in under 2 minutes — before anyone else replies." },
  { start: 17_500, title: "Quote, won, paid", body: "The lead moves to Won and the GST invoice is paid by UPI." },
  { start: 22_000, title: "Poora business, ek app mein", body: "Every lead, reply and payment in one place." },
] as const;

const draft =
  "Namaste Priya ji! 4 HD CCTV cameras ka installation ₹18,500 se shuru hai — DVR, wiring aur 1 saal warranty included. Kal subah site visit kar sakte hain?";

const ease = (x: number) => 1 - Math.pow(1 - x, 3);
/** 0 → 1 between `from` and `from + dur` ms, eased. */
const prog = (t: number, from: number, dur: number) => ease(Math.min(1, Math.max(0, (t - from) / dur)));
const sceneAt = (t: number) => scenes.reduce((idx, s, i) => (t >= s.start ? i : idx), 0);

type Variant = "section" | "reel";

export function ProductTour({ variant = "section" }: { variant?: Variant }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tRef = useRef(0);
  const seekRef = useRef<((ms: number) => void) | null>(null);

  const seek = useCallback((ms: number) => {
    tRef.current = Math.max(0, Math.min(TOUR_LENGTH, ms));
    setT(tRef.current);
  }, []);
  seekRef.current = seek;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setPlaying(false);
      seek(scenes[1].start + 3_000);
    }
    // Used by the recording script to render exact frames.
    (window as unknown as { __maaOneTour?: object }).__maaOneTour = {
      seek: (ms: number) => {
        setPlaying(false);
        seekRef.current?.(ms);
      },
      length: TOUR_LENGTH,
    };
  }, [seek]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Loop, holding the end card for 1.5 s before starting again.
      let next = tRef.current + (now - last);
      last = now;
      if (next > TOUR_LENGTH + 1_500) next = 0;
      tRef.current = next;
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, visible, seek]);

  const tt = Math.min(t, TOUR_LENGTH);
  const active = sceneAt(tt);
  const goTo = (i: number) => {
    seek(scenes[i].start + (reduced ? 3_000 : 0));
    if (!reduced) setPlaying(true);
  };

  if (variant === "reel") {
    return (
      <div ref={rootRef} className="flex h-full w-full flex-col items-center justify-between bg-[linear-gradient(165deg,#1e1b4b_0%,#2a2580_50%,#3730a3_100%)] px-[6%] pt-[9%] pb-[7%] text-white">
        <Caption active={active} t={tt} big />
        <div className="my-[3%] flex min-h-0 w-full flex-1 items-center justify-center">
          <div className="aspect-[9/19] h-full max-w-full">
            <PhoneScreen t={tt} />
          </div>
        </div>
        <SceneDots active={active} t={tt} />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,320px)] lg:gap-16">
      {/* Steps: a list on desktop, the current one on phones */}
      <div className="lg:order-1">
        <ol className="hidden space-y-2 lg:block">
          {scenes.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => goTo(i)}
                className={clsx(
                  "group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-colors",
                  i === active ? "border-white/25 bg-white/10" : "border-transparent hover:bg-white/5",
                )}
              >
                <span className="flex items-baseline gap-3">
                  <span className={clsx("text-sm font-bold tabular-nums", i === active ? "text-amber-300" : "text-indigo-300/70")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={clsx("block font-semibold", i === active ? "text-white" : "text-indigo-100/80")}>{s.title}</span>
                    {i === active && <span className="mt-1 block animate-fade-in text-sm text-indigo-100">{s.body}</span>}
                  </span>
                </span>
                {i === active && (
                  <span
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-300 to-amber-500"
                    style={{ width: `${sceneProgress(tt, i) * 100}%` }}
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          ))}
        </ol>
        <div className="lg:hidden">
          <Caption active={active} t={tt} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[290px] lg:order-2 lg:max-w-none">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-8 rounded-full bg-amber-400/20 blur-3xl" aria-hidden="true" />
          <PhoneScreen t={tt} />
        </div>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (tt >= TOUR_LENGTH) seek(0);
              setPlaying((p) => !p);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-indigo-900 shadow-lg transition-transform hover:scale-105"
            aria-label={playing && visible ? "Pause the demo" : "Play the demo"}
          >
            {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={() => goTo(0)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Restart the demo"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <SceneDots active={active} t={tt} onSelect={goTo} />
      </div>
    </div>
  );
}

function sceneProgress(t: number, i: number) {
  const end = scenes[i + 1]?.start ?? TOUR_LENGTH;
  return Math.min(1, Math.max(0, (t - scenes[i].start) / (end - scenes[i].start)));
}

function Caption({ active, t, big = false }: { active: number; t: number; big?: boolean }) {
  const s = scenes[active];
  const fade = prog(t, s.start, 400);
  return (
    <div className="text-center" aria-live="polite" style={{ opacity: fade, transform: `translateY(${(1 - fade) * 8}px)` }}>
      <p className={clsx("font-bold tracking-wide text-amber-300 uppercase", big ? "text-[2.2vh]" : "text-xs")}>
        Step {active + 1} of {scenes.length}
      </p>
      <p className={clsx("font-bold", big ? "mt-[1vh] text-[3.6vh] leading-tight" : "mt-1 text-xl")}>{s.title}</p>
      <p className={clsx("text-indigo-100", big ? "mt-[0.8vh] text-[2.2vh]" : "mt-1 text-sm")}>{s.body}</p>
    </div>
  );
}

function SceneDots({ active, t, onSelect }: { active: number; t: number; onSelect?: (i: number) => void }) {
  return (
    <div className="mt-5 flex w-full max-w-[320px] gap-1.5 justify-self-center" role={onSelect ? "tablist" : undefined} aria-label="Demo steps">
      {scenes.map((s, i) => {
        const fill = i < active ? 1 : i === active ? sceneProgress(t, i) : 0;
        const bar = (
          <span className="block h-1 overflow-hidden rounded-full bg-white/20">
            <span className="block h-full rounded-full bg-amber-300" style={{ width: `${fill * 100}%` }} />
          </span>
        );
        return onSelect ? (
          <button key={s.title} type="button" role="tab" aria-selected={i === active} aria-label={s.title} onClick={() => onSelect(i)} className="flex-1 py-2">
            {bar}
          </button>
        ) : (
          <span key={s.title} className="flex-1 py-2">
            {bar}
          </span>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The phone and its screens                                           */
/* ------------------------------------------------------------------ */

const inbox = [
  { name: "Rahul Sharma", msg: "Site visit kal 11 baje theek hai", score: "Warm", time: "10:12" },
  { name: "Neha Gupta", msg: "Please share AMC price for 2 ACs", score: "Hot", time: "09:47" },
  { name: "Amit Verma", msg: "Thank you, payment done 🙏", score: "Won", time: "Yesterday" },
  { name: "Simran Kaur", msg: "Kitne din mein install ho jayega?", score: "Warm", time: "Yesterday" },
  { name: "Vikram Singh", msg: "Quotation bhej do please", score: "Hot", time: "Mon" },
  { name: "Anjali Mehta", msg: "Sunday ko khule ho?", score: "Cold", time: "Mon" },
];

function PhoneScreen({ t }: { t: number }) {
  const s = sceneAt(t);
  // Screen 1 (inbox) until the chat opens at 4s; chat until the pipeline at 17.5s; end card from 22s.
  const chatIn = prog(t, scenes[1].start - 300, 500);
  const pipeIn = prog(t, scenes[4].start - 200, 500);
  const endIn = prog(t, scenes[5].start, 600);

  return (
    <div className="relative mx-auto aspect-[9/19] w-full rounded-[2.6rem] border-[7px] border-slate-900 bg-slate-900 shadow-2xl shadow-black/40 ring-1 ring-white/10">
      <div className="absolute top-2 left-1/2 z-30 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" aria-hidden="true" />
      <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-[#f6f6fb] text-slate-900" aria-hidden="true">
        <StatusBar />
        <div className="absolute inset-0 top-7">
          <InboxScreen t={t} style={{ transform: `translateX(${-30 * chatIn}%)`, opacity: 1 - chatIn * 0.6 }} />
          {chatIn > 0 && <ChatScreen t={t} style={{ transform: `translateX(${(1 - chatIn) * 100}%)` }} />}
          {pipeIn > 0 && <PipelineScreen t={t} style={{ transform: `translateY(${(1 - pipeIn) * 100}%)` }} />}
        </div>
        <Notification t={t} />
        {endIn > 0 && <EndCard t={t} style={{ opacity: endIn }} />}
        {s === 3 && <Toast t={t} />}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-7 items-center justify-between px-6 text-[11px] font-semibold text-slate-900">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[2px] border border-slate-900" />
      </span>
    </div>
  );
}

function AppHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="bg-[#3730A3] px-4 pt-2 pb-3 text-white">
      <p className="text-[14px] font-bold">{title}</p>
      {sub && <p className="text-[11px] text-indigo-200">{sub}</p>}
    </div>
  );
}

function BottomNav({ active }: { active: "Home" | "Inbox" | "Leads" | "Jobs" }) {
  const items = [
    { label: "Home", Icon: Home },
    { label: "Inbox", Icon: InboxIcon },
    { label: "Leads", Icon: KanbanSquare },
    { label: "Jobs", Icon: Briefcase },
  ] as const;
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-slate-200 bg-white px-2 pt-1.5 pb-3">
      {items.map(({ label, Icon }) => (
        <span key={label} className={clsx("flex flex-col items-center gap-0.5 text-[9.5px] font-semibold", label === active ? "text-[#3730A3]" : "text-slate-400")}>
          <Icon className="h-4 w-4" />
          {label}
        </span>
      ))}
    </div>
  );
}

function ScoreChip({ score, pop = 1 }: { score: string; pop?: number }) {
  const tone =
    score === "Hot"
      ? "bg-rose-100 text-rose-700"
      : score === "Warm"
        ? "bg-amber-100 text-amber-800"
        : "bg-emerald-100 text-emerald-700";
  return (
    <span
      className={clsx("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold", tone)}
      style={{ transform: `scale(${0.6 + 0.4 * pop})`, opacity: pop }}
    >
      {score === "Hot" && <Flame className="h-2.5 w-2.5" />}
      {score}
    </span>
  );
}

function InboxScreen({ t, style }: { t: number; style: React.CSSProperties }) {
  const rowIn = prog(t, 1_700, 500);
  const pressed = t > 3_300 && t < 3_800;
  return (
    <div className="absolute inset-0 bg-[#f6f6fb]" style={style}>
      <AppHeader title="Inbox" sub="5 new today · 2 waiting for reply" />
      <div className="flex gap-1.5 px-3 py-2 text-[10px] font-semibold">
        {["All", "Hot", "Warm", "Cold"].map((f, i) => (
          <span key={f} className={clsx("rounded-full px-2 py-1", i === 0 ? "bg-[#3730A3] text-white" : "bg-white text-slate-600 shadow-sm")}>
            {f}
          </span>
        ))}
      </div>
      <ul className="space-y-1.5 px-2.5">
        <li
          className={clsx("overflow-hidden rounded-xl bg-white shadow-sm ring-2 transition-transform", pressed ? "scale-[0.97] ring-amber-400" : "ring-amber-300/70")}
          style={{ maxHeight: `${rowIn * 60}px`, opacity: rowIn }}
        >
          <InboxRow name="Priya Kaur" msg="CCTV installation ka kitna kharcha aayega?" score="Hot" time="now" unread />
        </li>
        {inbox.map((r) => (
          <li key={r.name} className="rounded-xl bg-white shadow-sm">
            <InboxRow {...r} />
          </li>
        ))}
      </ul>
      <BottomNav active="Inbox" />
    </div>
  );
}

function InboxRow({ name, msg, score, time, unread = false }: { name: string; msg: string; score: string; time: string; unread?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-300 text-[10px] font-bold text-white">
        {name
          .split(" ")
          .map((p) => p[0])
          .join("")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="truncate text-[11.5px] font-semibold">{name}</span>
          <WhatsAppIcon className="h-2.5 w-2.5 shrink-0 text-emerald-600" />
        </span>
        <span className={clsx("block truncate text-[10.5px]", unread ? "font-semibold text-slate-800" : "text-slate-500")}>{msg}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[9.5px] text-slate-400">{time}</span>
        <ScoreChip score={score} />
      </span>
    </div>
  );
}

function Notification({ t }: { t: number }) {
  const down = prog(t, 500, 450);
  const up = prog(t, 2_900, 400);
  const y = -110 + 118 * down - 118 * up;
  if (down === 0 || up === 1) return null;
  return (
    <div className="absolute inset-x-2 top-0 z-30 rounded-2xl bg-white/95 p-2.5 shadow-xl ring-1 ring-black/5 backdrop-blur" style={{ transform: `translateY(${y}%)`, top: 28 }}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/maa-labs-mark-96.webp" alt="" className="h-4 w-4 rounded-md bg-[#1e1b4b] object-contain p-px" />
        MAA ONE · now
      </div>
      <p className="mt-1 text-[11.5px] font-bold">New WhatsApp lead · Priya Kaur</p>
      <p className="text-[11px] text-slate-600">&ldquo;CCTV installation ka kitna kharcha aayega? 4 camera chahiye.&rdquo;</p>
    </div>
  );
}

function ChatScreen({ t, style }: { t: number; style: React.CSSProperties }) {
  const chipIn = prog(t, 4_700, 400);
  const reasonIn = prog(t, 5_300, 500);
  const draftIn = prog(t, 8_100, 500);
  const typed = Math.round(draft.length * Math.min(1, Math.max(0, (t - 8_700) / 3_800)));
  const pressed = t > 13_700 && t < 14_100;
  const sent = prog(t, 14_100, 450);
  const ticksBlue = t > 15_400;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#efeae2]" style={style}>
      <div className="flex items-center gap-2 bg-[#3730A3] px-3 pt-2 pb-2.5 text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-300 text-[10px] font-bold">PK</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-bold">Priya Kaur</span>
          <span className="flex items-center gap-1 text-[10px] text-indigo-200">
            <WhatsAppIcon className="h-2.5 w-2.5" /> WhatsApp · +91 98•••• 4521
          </span>
        </span>
        <Phone className="h-3.5 w-3.5" />
      </div>

      <div className="relative flex-1 space-y-2 overflow-hidden px-2.5 py-2.5">
        {/* Lead summary with the AI score */}
        <div className="rounded-xl bg-white/95 p-2.5 shadow-sm" style={{ opacity: chipIn, transform: `translateY(${(1 - chipIn) * -6}px)` }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10.5px] font-bold text-slate-700">
              <Sparkles className="h-3 w-3 text-amber-500" /> AI lead score
            </span>
            <ScoreChip score="Hot" pop={chipIn} />
          </div>
          <p className="mt-1 text-[10.5px] text-slate-700" style={{ opacity: reasonIn }}>
            Wants 4 cameras for her home and asked the price today.
          </p>
          <div className="mt-1.5 grid grid-cols-3 gap-1 text-[9.5px]" style={{ opacity: reasonIn }}>
            {[
              ["Service", "CCTV install"],
              ["Area", "Ludhiana"],
              ["Value", "~₹18,000"],
            ].map(([k, v]) => (
              <span key={k} className="rounded-md bg-slate-100 px-1.5 py-1">
                <span className="block text-slate-400">{k}</span>
                <span className="font-semibold text-slate-800">{v}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-[82%] rounded-xl rounded-tl-sm bg-white px-2.5 py-1.5 text-[11.5px] shadow-sm">
          CCTV installation ka kitna kharcha aayega? 4 camera chahiye ghar ke liye.
          <span className="mt-0.5 block text-right text-[9px] text-slate-400">10:24</span>
        </div>

        {/* Sent reply */}
        {sent > 0 && (
          <div
            className="ml-auto max-w-[86%] rounded-xl rounded-tr-sm bg-[#d9fdd3] px-2.5 py-1.5 text-[11.5px] shadow-sm"
            style={{ opacity: sent, transform: `translateY(${(1 - sent) * 14}px) scale(${0.96 + 0.04 * sent})` }}
          >
            {draft}
            <span className="mt-0.5 flex items-center justify-end gap-0.5 text-[9px] text-slate-500">
              10:25 <CheckCheck className={clsx("h-3 w-3", ticksBlue ? "text-sky-500" : "text-slate-400")} />
            </span>
          </div>
        )}
      </div>

      {/* AI draft card, then the normal reply bar once it's sent */}
      {sent < 1 ? (
        <div
          className="m-2 rounded-2xl border border-amber-300 bg-amber-50 p-2.5 shadow-lg"
          style={{ opacity: draftIn * (1 - sent), transform: `translateY(${(1 - draftIn) * 40 + sent * 30}px)` }}
        >
          <div className="flex items-center justify-between">
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold whitespace-nowrap text-amber-800">
              <Sparkles className="h-3 w-3" /> AI draft
            </span>
            <span className="flex gap-0.5 text-[9.5px] font-semibold">
              {["Hinglish", "Hindi", "Punjabi", "English"].map((l, i) => (
                <span key={l} className={clsx("rounded-full px-1 py-0.5", i === 0 ? "bg-amber-500 text-white" : "bg-white text-slate-500")}>
                  {l}
                </span>
              ))}
            </span>
          </div>
          <p className="mt-1.5 min-h-[4.6em] text-[11.5px] leading-snug text-slate-800">
            {draft.slice(0, typed)}
            {typed < draft.length && draftIn > 0 && <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-slate-700 align-middle" />}
          </p>
          <div className="mt-2 flex gap-1.5">
            <span
              className={clsx(
                "flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#3730A3] py-1.5 text-[11px] font-semibold text-white transition-transform",
                pressed && "scale-95 bg-indigo-800",
                t > 12_800 && t < 13_700 && "ring-4 ring-amber-300/60",
              )}
            >
              <Send className="h-3 w-3" /> Approve &amp; send
            </span>
            <span className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">Edit</span>
          </div>
        </div>
      ) : (
        <div className="m-2 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] text-slate-400 shadow-sm">
          Type a message…
        </div>
      )}
    </div>
  );
}

function Toast({ t }: { t: number }) {
  const inn = prog(t, 14_600, 400);
  const out = prog(t, 16_900, 300);
  return (
    <div
      className="absolute inset-x-6 top-20 z-30 flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white shadow-xl"
      style={{ opacity: inn * (1 - out), transform: `translateY(${(1 - inn) * -10}px)` }}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
        <Check className="h-3 w-3" />
      </span>
      Replied in 1 min 40 sec · Lead moved to Contacted
    </div>
  );
}

const stages = ["New", "Contacted", "Quote sent", "Won"] as const;

/** Other leads already on the board, by stage. */
const board: { name: string; value: string }[][] = [
  [
    { name: "Anjali M.", value: "₹6,000" },
    { name: "Rohit K.", value: "₹9,500" },
  ],
  [{ name: "Rahul S.", value: "₹12,000" }],
  [
    { name: "Neha G.", value: "₹7,200" },
    { name: "Vikram S.", value: "₹22,000" },
  ],
  [{ name: "Amit V.", value: "₹14,800" }],
];

function PipelineScreen({ t, style }: { t: number; style: React.CSSProperties }) {
  // Priya's card hops Contacted → Quote sent → Won, then the invoice slides up and gets paid.
  const hop1 = prog(t, 18_300, 500);
  const hop2 = prog(t, 19_100, 500);
  const pos = 1 + hop1 + hop2; // index in stages
  const won = pos >= 2.95;
  const invoiceIn = prog(t, 19_900, 500);
  const paid = t > 21_000;
  const paidPop = prog(t, 21_000, 350);

  return (
    <div className="absolute inset-0 bg-[#f6f6fb]" style={style}>
      <AppHeader title="Leads pipeline" sub={won ? "This week · 2 won · ₹33,300" : "This week · 1 won · ₹14,800"} />
      <div className="relative mx-1.5 mt-2 grid grid-cols-4 gap-1">
        {stages.map((st, i) => (
          <div key={st} className="min-w-0">
            <div className={clsx("truncate rounded-md px-0.5 py-1 text-center text-[9.5px] font-bold", i === 3 ? "bg-emerald-600 text-white" : "bg-[#3730A3] text-white")}>
              {st}
            </div>
            {/* room for Priya's moving card */}
            <div className="h-[54px]" />
            <div className="space-y-1">
              {board[i].map((c) => (
                <div key={c.name} className="rounded-md bg-white p-1 shadow-sm">
                  <p className="truncate text-[9.5px] font-semibold">{c.name}</p>
                  <p className="text-[9px] text-slate-500">{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div
          className="absolute top-[26px] w-[calc(25%-3px)] rounded-md bg-white p-1 shadow-lg ring-2 ring-amber-300"
          style={{ left: `calc(${pos} * (25% + 1px))` }}
        >
          <p className="truncate text-[9.5px] font-bold">Priya Kaur</p>
          <p className="text-[9px] text-slate-500">₹18,500</p>
          <span className="mt-0.5 inline-block">
            <ScoreChip score={won ? "Won" : "Hot"} />
          </span>
        </div>
      </div>

      <div
        className="absolute inset-x-2 bottom-16 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5"
        style={{ opacity: invoiceIn, transform: `translateY(${(1 - invoiceIn) * 30}px)` }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11.5px] font-bold">
            <FileText className="h-3.5 w-3.5 text-[#3730A3]" /> Tax invoice INV-0042
          </span>
          <span
            className={clsx("rounded-full px-1.5 py-0.5 text-[10px] font-bold", paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800")}
            style={paid ? { transform: `scale(${0.7 + 0.3 * paidPop})` } : undefined}
          >
            {paid ? "Paid ✓" : "Sent"}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-500">Priya Kaur · GST invoice · 28 Oct</p>
        <div className="mt-2 space-y-1 text-[10.5px] text-slate-600">
          <Row label="4 HD cameras + DVR, installed" value="₹15,678" />
          <Row label="CGST 9% + SGST 9%" value="₹2,822" />
          <div className="border-t border-dashed border-slate-200 pt-1">
            <Row label={<b className="text-slate-900">Total</b>} value={<b className="text-slate-900">₹18,500</b>} />
          </div>
        </div>
        <div className="mt-2.5 flex gap-1.5 text-[10.5px] font-semibold">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-white">
            <WhatsAppIcon className="h-3 w-3" /> Sent on WhatsApp
          </span>
          <span className={clsx("flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5", paid ? "bg-emerald-50 text-emerald-700" : "bg-[#3730A3] text-white")}>
            <IndianRupee className="h-3 w-3" /> {paid ? "Paid by UPI" : "UPI link"}
          </span>
        </div>
      </div>
      <BottomNav active="Leads" />
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function EndCard({ t, style }: { t: number; style: React.CSSProperties }) {
  const rise = prog(t, scenes[5].start + 200, 700);
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[linear-gradient(165deg,#1e1b4b_0%,#3730a3_100%)] px-6 text-center text-white" style={style}>
      <div style={{ transform: `translateY(${(1 - rise) * 16}px)`, opacity: rise }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/maa-one-logo-560.webp" alt="Maa One" className="mx-auto w-[85%] max-w-[220px] rounded-xl bg-white/95 px-3 py-2" />
        <p className="mt-4 text-[14px] font-semibold text-amber-300">Poora business, ek app mein.</p>
        <p className="mt-3 text-[11.5px] text-indigo-100">Lead → reply → invoice → paid. On WhatsApp, in your language.</p>
        <p className="mt-5 inline-flex rounded-full bg-amber-400 px-4 py-1.5 text-[12px] font-bold text-slate-950">one.maalabs.in</p>
      </div>
    </div>
  );
}
