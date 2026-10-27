"use client";

import { useEffect, useState } from "react";

function partsUntil(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [parts, setParts] = useState<ReturnType<typeof partsUntil> | null>(null);

  useEffect(() => {
    const tick = () => setParts(partsUntil(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "days", value: parts?.days },
    { label: "hrs", value: parts?.hours },
    { label: "min", value: parts?.minutes },
    { label: "sec", value: parts?.seconds },
  ];

  return (
    <div className="flex gap-2" role="timer" aria-label="Time until launch">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-[3.25rem] flex-col items-center rounded-lg bg-white/10 px-2 py-1.5"
        >
          <span className="text-xl font-bold tabular-nums text-white">
            {u.value === undefined ? "–" : String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-medium tracking-wide text-indigo-100 uppercase">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
