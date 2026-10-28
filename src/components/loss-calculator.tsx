"use client";

import { useId, useState } from "react";
import { TrendingDown } from "lucide-react";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Share of late replies that end up lost to a competitor (stated on the page). */
const LOSS_RATE = 0.5;

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (n: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="text-lg font-bold text-brand-ink">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full cursor-pointer accent-[var(--brand)]"
      />
    </div>
  );
}

/** "How much are slow replies costing you?" — a simple, clearly-labelled estimate. */
export function LossCalculator({ planPrice }: { planPrice: number }) {
  const [leads, setLeads] = useState(60);
  const [value, setValue] = useState(2000);
  const [late, setLate] = useState(30);

  const lost = leads * (late / 100) * LOSS_RATE;
  const monthly = lost * value;

  return (
    <div className="grid overflow-hidden rounded-3xl border border-line bg-surface shadow-xl shadow-indigo-900/5 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-7 p-6 sm:p-8">
        <Slider label="Enquiries you get per month" value={leads} min={10} max={500} step={10} format={(n) => String(n)} onChange={setLeads} />
        <Slider label="Average value of a job" value={value} min={200} max={50000} step={100} format={inr} onChange={setValue} />
        <Slider label="Enquiries you reply to late or miss" value={late} min={5} max={80} step={5} format={(n) => `${n}%`} onChange={setLate} />
        <p className="text-xs text-muted">
          Estimate assumes half of late replies go to a competitor. Your numbers will differ — move the sliders to match your business.
        </p>
      </div>
      <div className="flex flex-col justify-center bg-[linear-gradient(160deg,#1e1b4b,#3730a3)] p-6 text-white sm:p-8">
        <TrendingDown className="h-8 w-8 text-amber-300" aria-hidden="true" />
        <p className="mt-4 text-sm text-indigo-100">You could be losing about</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl" aria-live="polite">
          {inr(monthly)}
          <span className="text-lg font-semibold text-indigo-200"> / month</span>
        </p>
        <p className="mt-2 text-indigo-100">
          ≈ {Math.round(lost)} customers a month · {inr(monthly * 12)} a year
        </p>
        <p className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm">
          Maa One Growth is <strong className="text-amber-300">{inr(planPrice / 100)}/month</strong>. Winning back even one customer usually pays for it.
        </p>
      </div>
    </div>
  );
}
