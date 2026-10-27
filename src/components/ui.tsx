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
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm",
    buttonStyles[variant],
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
      title={live ? undefined : `Planned for ${versionById[version].month}`}
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
