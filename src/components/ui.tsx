import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
  isAvailable,
  statusLabel,
  versionById,
  type VersionId,
  type VersionStatus,
} from "@/site.config";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover shadow-sm shadow-brand/20",
  accent: "bg-accent text-slate-950 hover:brightness-95 shadow-sm",
  secondary: "border border-line bg-surface text-ink hover:border-brand-ink/40 hover:text-brand-ink",
  ghost: "text-brand-ink hover:bg-brand-soft",
};

export function buttonClass(variant: ButtonVariant = "primary", size: "md" | "lg" = "md") {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 disabled:has-[[data-busy]]:cursor-wait disabled:has-[[data-busy]]:opacity-85",
    size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm",
    buttonStyles[variant],
  );
}

/** Small spinning ring that takes the current text colour. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={clsx("h-4 w-4 shrink-0 animate-spin", className)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Button text that swaps to a spinner and a "working" label while busy. Screen readers hear the
 * new label through aria-live; the label fades in so the swap doesn't jump.
 */
export function BusyLabel({ busy, busyText, children }: { busy: boolean; busyText: string; children: ReactNode }) {
  return (
    <span aria-live="polite" className="inline-flex items-center justify-center gap-2">
      {busy ? (
        <span key="busy" data-busy className="inline-flex animate-fade-in items-center gap-2">
          <Spinner />
          {busyText}
        </span>
      ) : (
        children
      )}
    </span>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: "md" | "lg" }) {
  return <Link className={clsx(buttonClass(variant, size), className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={clsx("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h2 mt-2">{title}</h2>
      {children && <p className="lead mt-4">{children}</p>}
    </div>
  );
}

/** "Available now" or "Coming in vX" for a module. */
export function ReleaseBadge({ version, className }: { version: VersionId; className?: string }) {
  const live = isAvailable(version);
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        live ? "bg-success-soft text-success" : "bg-brand-soft text-brand-ink",
        className,
      )}
      title={live ? undefined : `Planned: ${versionById[version].when}`}
    >
      {live ? (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          Available now
        </>
      ) : (
        <>Coming in {version}</>
      )}
    </span>
  );
}

export function StatusBadge({ status }: { status: VersionStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        status === "released" && "bg-success-soft text-success",
        status === "in-progress" && "bg-accent-soft text-accent-ink",
        status === "planned" && "bg-surface-2 text-muted",
      )}
    >
      {status === "in-progress" && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
      )}
      {statusLabel[status]}
    </span>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(ellipse_at_center,var(--brand-soft),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="container-page relative py-14 sm:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {children && <div className="lead mt-4 max-w-2xl">{children}</div>}
      </div>
    </section>
  );
}
