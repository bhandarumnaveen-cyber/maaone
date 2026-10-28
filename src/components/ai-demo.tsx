"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Flame, Globe, Send, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "./icons";
import { demoLangs, homeDemo, type DemoEnquiry, type DemoLang } from "@/data/demo-replies";

/**
 * Types the text out when it changes. The first text shows complete (no work during page load);
 * reduced-motion users always see it at once.
 */
function useTypewriter(text: string) {
  const [shown, setShown] = useState(text);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(text);
      return;
    }
    const chars = Array.from(text);
    let i = 0;
    setShown("");
    const id = setInterval(() => {
      i = Math.min(chars.length, i + 3);
      setShown(chars.slice(0, i).join(""));
      if (i >= chars.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [text]);
  return shown;
}

/** Pick a sample enquiry and a language, and watch the AI draft appear. Illustrative replies, not live AI. */
export function AiDemo({ enquiries = homeDemo }: { enquiries?: DemoEnquiry[] }) {
  const [active, setActive] = useState(enquiries[0].id);
  const [lang, setLang] = useState<DemoLang>("hi");
  const e = enquiries.find((x) => x.id === active) ?? enquiries[0];
  const reply = useTypewriter(e.replies[lang]);
  const done = reply.length >= e.replies[lang].length;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        {enquiries.length > 1 && (
          <>
            <p className="text-sm font-semibold text-ink">1. Pick an enquiry</p>
            <div role="radiogroup" aria-label="Sample enquiry" className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {enquiries.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={x.id === active}
                  onClick={() => setActive(x.id)}
                  className={clsx(
                    "rounded-xl border px-4 py-3 text-left transition-colors",
                    x.id === active ? "border-brand-ink bg-brand-soft ring-2 ring-brand-ink/20" : "border-line bg-surface hover:border-brand-ink/40",
                  )}
                >
                  <span className="text-xs font-semibold text-muted">{x.industry}</span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">“{x.message}”</span>
                </button>
              ))}
            </div>
          </>
        )}
        <p className={clsx("text-sm font-semibold text-ink", enquiries.length > 1 && "mt-6")}>
          {enquiries.length > 1 ? "2. " : ""}Reply in
        </p>
        <div role="radiogroup" aria-label="Reply language" className="mt-3 inline-flex rounded-xl border border-line bg-surface p-1">
          {demoLangs.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={lang === l.id}
              onClick={() => setLang(l.id)}
              className={clsx(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                lang === l.id ? "bg-brand text-white" : "text-muted hover:text-ink",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-[#f2efe9] p-4 shadow-xl shadow-indigo-900/10 sm:p-6 dark:bg-[#12131c]">
        <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-indigo-400 text-sm font-bold text-white">
            {e.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{e.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted">
              {e.channel === "WhatsApp" ? <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600" /> : <Globe className="h-3.5 w-3.5 text-brand-ink" />}
              {e.channel}
            </p>
          </div>
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
              e.score === "Hot" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
            )}
          >
            <Flame className="h-3.5 w-3.5" aria-hidden="true" /> {e.score} lead
          </span>
        </div>

        <div className="mt-4 max-w-[85%] rounded-2xl rounded-tl-sm bg-surface px-4 py-3 text-ink shadow-sm">{e.message}</div>

        <div className="mt-4 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 dark:border-amber-400/30 dark:bg-amber-500/10">
          <p className="flex items-center gap-1.5 text-sm font-bold text-amber-800 dark:text-amber-300">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> AI draft
          </p>
          <p className="mt-2 min-h-[7.5rem] leading-relaxed text-ink" aria-live="polite" lang={lang === "en" ? "en" : lang}>
            {reply}
            {!done && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-ink align-middle" aria-hidden="true" />}
          </p>
          <div className="mt-3 flex gap-2">
            <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white">
              <Send className="h-4 w-4" aria-hidden="true" /> Approve &amp; send
            </span>
            <span className="inline-flex items-center rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink">Edit</span>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted">Sample replies to show how Maa One works. Real drafts use your own prices and details.</p>
      </div>
    </div>
  );
}
