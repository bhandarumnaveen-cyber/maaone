"use client";

import { useId } from "react";

const PETALS = [
  "M24 14.5c4.6 4.4 5.8 10.4 0 18-5.8-7.6-4.6-13.6 0-18z",
  "M24 32.5c-.6-7-4.6-12.3-12-14.6-1 7.6 3.6 13 12 14.6z",
  "M24 32.5c.6-7 4.6-12.3 12-14.6 1 7.6-3.6 13-12 14.6z",
  "M21.5 33.5c-6 .9-11.4-1.4-15.5-6.5 5.4-1 10.6 1 15.5 6.5z",
  "M26.5 33.5c6 .9 11.4-1.4 15.5-6.5-5.4-1-10.6 1-15.5 6.5z",
  "M10 38c9.2 2 18.8 2 28 0",
];

/** The Maa One lotus: gold petals under a red diamond, as in the brand logo. */
export function LotusMark({ className = "h-9 w-9", strokeWidth = 2.6 }: { className?: string; strokeWidth?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`lotus-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCD34D" />
          <stop offset=".55" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#C77D0A" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#lotus-${id})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {PETALS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d="M24 4.2l3.6 3.6-3.6 3.6-3.6-3.6z" fill="#DC2626" />
    </svg>
  );
}
