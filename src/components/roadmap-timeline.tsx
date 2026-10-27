import clsx from "clsx";
import { Check } from "lucide-react";
import { modulesInVersion, versions } from "@/site.config";
import { StatusBadge } from "./ui";

export function RoadmapTimeline({ compact = false }: { compact?: boolean }) {
  return (
    <ol className="relative space-y-6 border-l-2 border-line pl-6 sm:pl-8">
      {versions.map((v) => {
        const current = v.status === "in-progress";
        const modules = modulesInVersion(v.id);
        return (
          <li key={v.id} className="relative">
            <span
              className={clsx(
                "absolute top-5 -left-[33px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-bg sm:-left-[41px]",
                v.status === "released" && "bg-success",
                current && "bg-accent",
                v.status === "planned" && "border-2 border-line bg-surface",
              )}
              aria-hidden="true"
            >
              {v.status === "released" && <Check className="h-2.5 w-2.5 text-white" />}
            </span>
            <div
              className={clsx(
                "card p-5 sm:p-6",
                current && "border-accent/60 shadow-lg shadow-accent/10 ring-1 ring-accent/40",
              )}
              aria-current={current ? "step" : undefined}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="rounded-lg bg-brand px-2 py-0.5 text-sm font-bold text-white">{v.id}</span>
                <span className="text-sm font-medium text-muted">{v.month}</span>
                <StatusBadge status={v.status} />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-ink">{v.name}</h3>
              <p className="mt-1 text-sm text-muted">{v.summary}</p>
              {!compact && modules.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {modules.map((m) => (
                    <li key={m} className="rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-ink">
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
