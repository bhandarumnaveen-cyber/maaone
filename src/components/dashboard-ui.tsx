import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

/* Building blocks for the admin and account dashboards. Server-safe. */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const tones = {
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
} as const;
export type Tone = keyof typeof tones;

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "indigo",
  href,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  href?: string;
}) {
  const body = (
    <>
      <span className={clsx("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", tones[tone])}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </div>
    </>
  );
  const cls = "card flex items-center gap-4 p-5 shadow-sm shadow-slate-900/[0.03]";
  return href ? (
    <Link href={href} className={clsx(cls, "transition-colors hover:border-brand-ink/40")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: { href: string; label: string } | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const isLink = action && typeof action === "object" && "href" in (action as object);
  return (
    <section className={clsx("card shadow-sm shadow-slate-900/[0.03]", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {isLink ? (
            <Link
              href={(action as { href: string }).href}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-ink hover:underline"
            >
              {(action as { label: string }).label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            (action as React.ReactNode)
          )}
        </div>
      )}
      <div className={clsx("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Pill({ tone = "slate", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", tones[tone], className)}>
      {children}
    </span>
  );
}

const avatarTones = ["bg-indigo-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500", "bg-rose-500", "bg-violet-500"];

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";
  const tone = avatarTones[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", tone, className)}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>}
    </div>
  );
}

/** Vertical bar chart. Values are plain numbers; `format` turns them into labels. */
export function BarChart({
  data,
  format = (n) => n.toLocaleString("en-IN"),
  highlightLast = true,
  height = 160,
  label,
}: {
  data: { key: string; label: string; value: number }[];
  format?: (n: number) => string;
  highlightLast?: boolean;
  height?: number;
  label: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const every = Math.ceil(data.length / 8);
  return (
    <figure>
      <div className="flex items-end gap-1 sm:gap-1.5" style={{ height }} role="img" aria-label={label}>
        {data.map((d, i) => {
          const last = highlightLast && i === data.length - 1;
          return (
            <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
              <span
                className={clsx(
                  "block w-full rounded-t-md transition-colors",
                  d.value === 0 ? "bg-line" : last ? "bg-accent" : "bg-brand/80 group-hover:bg-brand",
                )}
                style={{ height: d.value === 0 ? 3 : `${Math.max(4, (d.value / max) * 100)}%` }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 rounded-md bg-slate-900 px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-white group-hover:block">
                {d.label}: {format(d.value)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1 text-[10px] text-muted sm:gap-1.5 sm:text-[11px]" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.key} className="flex-1 truncate text-center">
            {i % every === 0 || i === data.length - 1 ? d.label : ""}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.label}</th>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const donutColors = ["#4f46e5", "#f59e0b", "#10b981", "#0ea5e9", "#f43f5e", "#8b5cf6", "#94a3b8"];

export function Donut({
  data,
  centerLabel,
  label,
}: {
  data: { label: string; value: number }[];
  centerLabel: string;
  label: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  let acc = 0;
  const stops = total
    ? data
        .map((d, i) => {
          const start = (acc / total) * 360;
          acc += d.value;
          return `${donutColors[i % donutColors.length]} ${start}deg ${(acc / total) * 360}deg`;
        })
        .join(", ")
    : "var(--line) 0deg 360deg";
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
        role="img"
        aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value}`).join(", ") || "no data"}`}
      >
        <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-surface">
          <span className="text-2xl font-bold text-ink">{total.toLocaleString("en-IN")}</span>
          <span className="text-[11px] text-muted">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.length === 0 && <li className="text-muted">No data yet</li>}
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: donutColors[i % donutColors.length] }} />
            <span className="flex-1 truncate text-ink">{d.label}</span>
            <span className="text-muted">{total ? Math.round((d.value / total) * 100) : 0}%</span>
            <span className="w-8 text-right font-semibold text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal bars for "top N" lists. */
export function RankBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="text-sm text-muted">No data yet</p>;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate text-ink">{d.label}</span>
            <span className="font-semibold text-ink">{d.value}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-surface-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-brand to-indigo-400" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export const istDateTime = (v: string | null | undefined) =>
  v
    ? new Date(v).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : "—";

export const istDate = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "—";

export function timeAgo(v: string) {
  const s = Math.max(0, (Date.now() - new Date(v).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return istDate(v);
}
