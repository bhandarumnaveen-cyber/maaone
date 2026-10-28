"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { ChevronDown, Loader2 } from "lucide-react";
import { statusLabel } from "@/lib/status-label";

type Tone = { pill: string; dot: string };

const tone = (pill: string, dot: string): Tone => ({ pill, dot });
const slate = tone("border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-500/10 dark:text-slate-200", "bg-slate-400");
const rose = tone("border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200", "bg-rose-500");
const sky = tone("border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200", "bg-sky-500");
const amber = tone("border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200", "bg-amber-500");
const green = tone("border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200", "bg-emerald-500");
const muted = tone("border-line bg-surface-2 text-muted hover:border-slate-300", "bg-slate-300 dark:bg-slate-600");

const tones: Record<string, Tone> = {
  waiting: amber,
  new: rose,
  open: rose,
  invited: sky,
  planned: sky,
  in_progress: amber,
  replied: green,
  answered: green,
  converted: green,
  done: green,
  removed: muted,
  declined: muted,
  closed: slate,
  spam: muted,
};

/**
 * Status pill (dot, label, chevron) that saves as soon as a new value is picked.
 * Without JavaScript a Save button appears instead.
 */
export function StatusSelect({
  list,
  id,
  status,
  options,
  back,
}: {
  list: string;
  id: string;
  status: string;
  options: readonly string[];
  back: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const t = tones[value] ?? slate;

  return (
    <form ref={form} action="/api/admin/status" method="post" className="inline-flex items-center gap-2">
      <input type="hidden" name="list" value={list} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="back" value={back} />
      <label className="sr-only" htmlFor={`st-${id}`}>
        Status
      </label>
      <span
        className={clsx(
          "relative inline-flex items-center rounded-full border shadow-sm transition-colors focus-within:ring-2 focus-within:ring-brand-ink/40",
          t.pill,
          saving && "opacity-70",
        )}
      >
        <span className={clsx("pointer-events-none absolute left-3 h-2 w-2 rounded-full", t.dot)} aria-hidden="true" />
        <select
          id={`st-${id}`}
          name="status"
          value={value}
          aria-busy={saving}
          onChange={(e) => {
            setValue(e.target.value);
            setSaving(true);
            form.current?.requestSubmit();
          }}
          className="cursor-pointer appearance-none rounded-full bg-transparent py-1.5 pr-8 pl-7 text-xs font-semibold text-inherit focus:outline-none aria-busy:cursor-wait"
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-surface text-ink">
              {statusLabel(o)}
            </option>
          ))}
        </select>
        {saving ? (
          <Loader2 className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 opacity-70" aria-hidden="true" />
        )}
      </span>
      <noscript>
        <button type="submit" className="text-xs font-semibold text-brand-ink">
          Save
        </button>
      </noscript>
    </form>
  );
}
