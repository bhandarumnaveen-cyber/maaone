import { Spinner } from "./ui";

/** Placeholder shown in the dashboard while an /admin or /account page loads. */
export function PageSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="animate-fade-in">
      <span className="sr-only">{label}</span>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-4 w-72 max-w-[70vw]" />
        </div>
        <span className="hidden items-center gap-2 text-sm font-medium text-muted sm:inline-flex" aria-hidden="true">
          <Spinner className="text-brand-ink" /> {label}
        </span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4 sm:p-5">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton mt-3 h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="card mt-6 space-y-3 p-5">
        <div className="skeleton h-5 w-40" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-10 w-full" style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </div>
    </div>
  );
}
