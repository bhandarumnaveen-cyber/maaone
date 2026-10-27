import clsx from "clsx";
import { Flame, IndianRupee, MessageCircle, Sparkles, Globe, Check, CalendarDays, Send } from "lucide-react";
import { WhatsAppIcon } from "./icons";

/* Illustrative Maa One app screens, built in HTML so they stay crisp and light. */

const leads = [
  { name: "Rahul Sharma", src: "web", msg: "AC service chahiye, Sector 22", time: "2m", hot: true },
  { name: "Simran Kaur", src: "wa", msg: "Kal salon booking mil sakti hai?", time: "9m", hot: true },
  { name: "Amit Verma", src: "wa", msg: "Price list bhej do please", time: "24m" },
  { name: "Neha Gupta", src: "web", msg: "Need RO service this week", time: "1h" },
];

function SourceIcon({ src }: { src: string }) {
  return src === "wa" ? (
    <WhatsAppIcon className="h-3 w-3 text-[#25D366]" />
  ) : (
    <Globe className="h-3 w-3 text-brand-ink" />
  );
}

export function PhoneInboxMockup({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Maa One inbox on a phone, with an AI reply drafted in Hindi"
      className={clsx(
        "rounded-[2rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl shadow-brand/30 dark:border-slate-700",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[1.6rem] bg-surface">
        <div className="flex items-center justify-between bg-brand px-3.5 pt-3 pb-2.5 text-white">
          <span className="text-[11px] font-semibold">Inbox</span>
          <span className="rounded-full bg-white/20 px-1.5 text-[9px] font-semibold">4 new</span>
        </div>
        <ul className="divide-y divide-line">
          {leads.slice(0, 2).map((l) => (
            <li key={l.name} className="flex items-start gap-2 px-3 py-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[9px] font-bold text-brand-ink">
                {l.name.split(" ").map((p) => p[0]).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-ink">
                  {l.name}
                  <SourceIcon src={l.src} />
                  {l.hot && <Flame className="h-3 w-3 text-accent" />}
                </span>
                <span className="block truncate text-[9px] text-muted">{l.msg}</span>
              </span>
              <span className="text-[8px] text-muted">{l.time}</span>
            </li>
          ))}
        </ul>
        <div className="m-2.5 rounded-xl border border-accent/50 bg-accent-soft p-2.5">
          <p className="flex items-center gap-1 text-[9px] font-semibold text-accent-ink">
            <Sparkles className="h-3 w-3" /> AI draft · Hindi
          </p>
          <p className="mt-1 text-[10px] leading-snug text-ink">
            नमस्ते राहुल जी! कल सुबह 11 बजे AC सर्विस के लिए टेक्नीशियन आ सकता है। चार्ज ₹499 है। कन्फर्म करें?
          </p>
          <div className="mt-2 flex gap-1.5">
            <span className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand py-1 text-[9px] font-semibold text-white">
              <Send className="h-2.5 w-2.5" /> Approve & send
            </span>
            <span className="rounded-lg border border-line bg-surface px-2 py-1 text-[9px] font-medium text-ink">
              Edit
            </span>
          </div>
        </div>
        <ul className="divide-y divide-line border-t border-line">
          {leads.slice(2).map((l) => (
            <li key={l.name} className="flex items-center gap-2 px-3 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[9px] font-bold text-muted">
                {l.name.split(" ").map((p) => p[0]).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-ink">
                  {l.name} <SourceIcon src={l.src} />
                </span>
                <span className="block truncate text-[9px] text-muted">{l.msg}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="h-3" />
      </div>
    </div>
  );
}

export function LaptopDashboardMockup({ className }: { className?: string }) {
  const bars = [38, 52, 44, 66, 58, 80, 72];
  return (
    <div
      role="img"
      aria-label="Maa One dashboard on a laptop showing leads, reply time and revenue"
      className={clsx("w-full", className)}
    >
      <div className="rounded-t-xl border-[6px] border-b-0 border-slate-900 bg-slate-900 dark:border-slate-700">
        <div className="flex aspect-[16/10] overflow-hidden rounded-t-md bg-bg">
          <div className="hidden w-[22%] flex-col gap-1.5 border-r border-line bg-surface p-2.5 sm:flex">
            <span className="mb-1 h-2.5 w-14 rounded bg-brand/80" />
            {["Inbox", "Leads", "Customers", "Invoices", "Reports"].map((item, i) => (
              <span
                key={item}
                className={clsx(
                  "rounded-md px-1.5 py-1 text-[9px] font-medium",
                  i === 0 ? "bg-brand-soft text-brand-ink" : "text-muted",
                )}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-ink">Good morning, Gurpreet</span>
              <span className="rounded-md bg-brand px-1.5 py-0.5 text-[8px] font-semibold text-white">This week</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { k: "New leads", v: "48", icon: MessageCircle },
                { k: "Hot leads", v: "12", icon: Flame },
                { k: "Won", v: "₹86k", icon: IndianRupee },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-line bg-surface p-1.5">
                  <s.icon className="h-2.5 w-2.5 text-accent-ink" />
                  <p className="mt-0.5 text-[11px] font-bold text-ink">{s.v}</p>
                  <p className="text-[7px] text-muted">{s.k}</p>
                </div>
              ))}
            </div>
            <div className="grid flex-1 grid-cols-5 gap-1.5">
              <div className="col-span-3 flex flex-col rounded-lg border border-line bg-surface p-1.5">
                <p className="text-[8px] font-semibold text-ink">Leads by day</p>
                <div className="mt-1 flex flex-1 items-end gap-1">
                  {bars.map((h, i) => (
                    <span
                      key={i}
                      className={clsx("flex-1 rounded-t-sm", i === 5 ? "bg-accent" : "bg-brand/70")}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-2 rounded-lg border border-line bg-surface p-1.5">
                <p className="text-[8px] font-semibold text-ink">Avg. reply time</p>
                <p className="mt-1 text-sm font-bold text-success">4 min</p>
                <p className="text-[7px] text-muted">was 3 hrs</p>
                <div className="mt-1.5 space-y-1">
                  {[80, 55, 30].map((w, i) => (
                    <span key={i} className="block h-1 rounded bg-surface-2">
                      <span className="block h-1 rounded bg-brand/70" style={{ width: `${w}%` }} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-[-4%] h-3 rounded-b-xl bg-gradient-to-b from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700" />
    </div>
  );
}

export function InvoiceMockup({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="A GST invoice created in Maa One with a UPI payment link"
      className={clsx("w-full max-w-xs rounded-xl border border-line bg-surface p-4 shadow-xl shadow-brand/10", className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-ink">Tax Invoice</p>
          <p className="text-[10px] text-muted">INV-0142 · 12 May 2027</p>
        </div>
        <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">Paid via UPI</span>
      </div>
      <div className="mt-3 space-y-1.5 border-y border-line py-3 text-[11px]">
        {[
          ["AC service (split, 1.5 ton)", "₹499"],
          ["Gas top-up", "₹1,800"],
          ["CGST 9% + SGST 9%", "₹414"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <span className="text-muted">{k}</span>
            <span className="font-medium text-ink">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-sm font-bold text-ink">
        <span>Total</span>
        <span>₹2,713</span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand-soft px-2.5 py-1.5 text-[10px] font-medium text-brand-ink">
        <Check className="h-3 w-3" /> Reminder stopped automatically
      </div>
    </div>
  );
}

const placeholderIcons = {
  win: MessageCircle,
  work: CalendarDays,
  paid: IndianRupee,
  grow: Sparkles,
  platform: Globe,
} as const;

/** Placeholder until real screenshots of each module are ready. */
export function ScreenshotPlaceholder({
  group,
  label,
}: {
  group: keyof typeof placeholderIcons;
  label: string;
}) {
  const Icon = placeholderIcons[group];
  return (
    <div
      role="img"
      aria-label={`Screenshot of ${label} coming soon`}
      className="flex aspect-[16/9] flex-col overflow-hidden rounded-lg border border-line bg-surface-2"
    >
      <div className="flex gap-1 border-b border-line px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-muted">
        <Icon className="h-5 w-5 text-brand-ink/70" aria-hidden="true" />
        <span className="text-[11px] font-medium">Screenshot coming soon</span>
      </div>
    </div>
  );
}
