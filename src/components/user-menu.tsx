"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Globe, LayoutDashboard, LogOut, Shield, UserRound } from "lucide-react";
import clsx from "clsx";
import { PendingSubmit } from "@/components/pending-submit";

export type UserMenuLink = { href: string; label: string; icon: "profile" | "account" | "admin" | "site" | "app"; external?: boolean };

const icons = { profile: UserRound, account: LayoutDashboard, admin: Shield, site: Globe, app: ExternalLink };

function initials(name: string) {
  return (
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U"
  );
}

/** Avatar button with a dropdown: profile links and log out. Closes on outside click and Escape. */
export function UserMenu({ name, detail, links, compact }: { name: string; detail: string; links: UserMenuLink[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-surface-2"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-indigo-500 text-sm font-bold text-white">
          {initials(name)}
        </span>
        {!compact && (
          <span className="hidden max-w-[10rem] text-left leading-tight md:block">
            <span className="block truncate text-sm font-semibold text-ink">{name}</span>
            <span className="block truncate text-xs text-muted">{detail}</span>
          </span>
        )}
        <ChevronDown className={clsx("h-4 w-4 text-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
        <span className="sr-only">Account menu</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-slate-900/15">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="truncate text-xs text-muted">{detail}</p>
          </div>
          <div className="p-1.5">
            {links.map((l) => {
              const Icon = icons[l.icon];
              const cls = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-2";
              return l.external ? (
                <a key={l.href} href={l.href} role="menuitem" className={cls}>
                  <Icon className="h-4 w-4 text-muted" aria-hidden="true" /> {l.label}
                </a>
              ) : (
                <Link key={l.href} href={l.href} role="menuitem" className={cls} onClick={() => setOpen(false)}>
                  <Icon className="h-4 w-4 text-muted" aria-hidden="true" /> {l.label}
                </Link>
              );
            })}
          </div>
          <form action="/auth/signout" method="post" className="border-t border-line p-1.5">
            <PendingSubmit
              busyText="Logging out…"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-wait dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
            </PendingSubmit>
          </form>
        </div>
      )}
    </div>
  );
}
