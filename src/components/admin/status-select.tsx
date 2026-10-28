"use client";

import { useRef } from "react";
import clsx from "clsx";
import { statusLabel } from "@/lib/status-label";

const toneOf: Record<string, string> = {
  waiting: "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-500/10 dark:text-slate-200",
  new: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200",
  open: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200",
  invited: "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200",
  planned: "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200",
  in_progress: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
  replied: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  answered: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  converted: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  done: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
};


/** Status pill that saves as soon as a new value is picked (falls back to a Save button without JS). */
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
  return (
    <form ref={form} action="/api/admin/status" method="post" className="inline-flex">
      <input type="hidden" name="list" value={list} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="back" value={back} />
      <label className="sr-only" htmlFor={`st-${id}`}>
        Status
      </label>
      <select
        id={`st-${id}`}
        name="status"
        defaultValue={status}
        onChange={() => form.current?.requestSubmit()}
        className={clsx(
          "cursor-pointer appearance-none rounded-full border py-1 pr-7 pl-3 text-xs font-semibold",
          "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2364748b%22><path d=%22M5.5 7.5 10 12l4.5-4.5%22 stroke=%22%2364748b%22 stroke-width=%221.8%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')] bg-[length:14px] bg-[right_8px_center] bg-no-repeat",
          toneOf[status] ?? "border-line bg-surface text-muted",
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {statusLabel(o)}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="ml-2 text-xs font-semibold text-brand-ink">
          Save
        </button>
      </noscript>
    </form>
  );
}
