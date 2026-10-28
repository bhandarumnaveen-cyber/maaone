import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import clsx from "clsx";
import { buttonClass } from "../ui";
import { statusLabel } from "@/lib/status-label";

/** Search box, status filter chips and CSV export for an admin list (plain GET form). */
export function ListToolbar({
  base,
  q,
  status,
  statuses,
  count,
  exportKey,
  placeholder,
}: {
  base: string;
  q: string;
  status?: string;
  statuses: readonly string[];
  count: number;
  exportKey: string;
  placeholder: string;
}) {
  const href = (s?: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (s) p.set("status", s);
    const qs = p.toString();
    return qs ? `${base}?${qs}` : base;
  };
  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form action={base} method="get" role="search" className="relative flex-1">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <label htmlFor="list-q" className="sr-only">
            Search
          </label>
          <input id="list-q" name="q" defaultValue={q} placeholder={placeholder} className="input pl-10" type="search" />
        </form>
        <a href={`/admin/export/${exportKey}`} download className={buttonClass("secondary")}>
          <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {statuses.length > 0 && (
          <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
            {[undefined, ...statuses].map((s) => (
              <Link
                key={s ?? "all"}
                href={href(s)}
                aria-current={status === s ? "page" : undefined}
                className={clsx(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  status === s ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted hover:text-ink",
                )}
              >
                {s ? statusLabel(s) : "All"}
              </Link>
            ))}
          </nav>
        )}
        <span className="ml-auto text-sm text-muted">
          {count.toLocaleString("en-IN")} {count === 1 ? "result" : "results"}
          {q && (
            <>
              {" "}
              for “{q}” ·{" "}
              <Link href={href(status)} className="font-medium text-brand-ink hover:underline">
                clear
              </Link>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export function Pager({ base, page, pages, params }: { base: string; page: number; pages: number; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const btn = "inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:border-brand-ink/40";
  return (
    <nav aria-label="Pages" className="mt-5 flex items-center justify-between">
      {page > 1 ? (
        <Link href={href(page - 1)} className={btn}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className={btn}>
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
