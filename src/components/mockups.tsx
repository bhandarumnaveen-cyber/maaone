import { CalendarDays, Globe, IndianRupee, MessageCircle, Sparkles } from "lucide-react";

/* Placeholder frame for module screenshots that don't exist yet. */

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
