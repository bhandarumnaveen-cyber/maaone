import { BadgeIndianRupee, Hammer, LayoutGrid, Magnet, TrendingUp } from "lucide-react";
import { moduleGroups, type ModuleGroup } from "@/site.config";
import { ReleaseBadge } from "./ui";

export const groupIcons: Record<ModuleGroup["id"], typeof Magnet> = {
  win: Magnet,
  work: Hammer,
  paid: BadgeIndianRupee,
  grow: TrendingUp,
  platform: LayoutGrid,
};

/** Compact grid of all five module groups, used on the home page. */
export function FeatureBlocks() {
  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-6">
      {moduleGroups.map((group, i) => {
        const Icon = groupIcons[group.id];
        return (
          <article
            key={group.id}
            className={`card reveal flex flex-col p-5 transition-shadow hover:shadow-lg hover:shadow-indigo-900/5 sm:p-6 ${i < 4 ? "md:col-span-3" : "md:col-span-6"} ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-ink">{group.title}</h3>
                <p className="text-sm text-muted">{group.blurb}</p>
              </div>
            </div>
            <ul className={`mt-5 space-y-2.5 ${i === 4 ? "md:grid md:grid-cols-2 md:gap-x-8 md:space-y-0 md:gap-y-2.5 lg:block lg:space-y-2.5" : ""}`}>
              {group.modules.map((m) => (
                <li key={m.name} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-ink">{m.name}</span>
                  <ReleaseBadge version={m.version} />
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
