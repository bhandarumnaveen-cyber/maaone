"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  BadgeIndianRupee,
  CreditCard,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  LogOut,
  Menu,
  MessageSquareText,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "./logos";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu, type UserMenuLink } from "./user-menu";

const icons = {
  dashboard: LayoutDashboard,
  waitlist: Users,
  ideas: Lightbulb,
  messages: MessageSquareText,
  subscribers: BadgeIndianRupee,
  support: LifeBuoy,
  invoices: FileText,
  billing: CreditCard,
  inbox: Inbox,
  profile: UserRound,
};

export type ShellNavItem = { href: string; label: string; icon: keyof typeof icons; badge?: number };

/** Dashboard layout shared by /admin and /account: indigo sidebar, light content area. */
export function AppShell({
  area,
  nav,
  user,
  primaryLink,
  menuLinks,
  children,
}: {
  area: string;
  nav: ShellNavItem[];
  user: { name: string; detail: string };
  primaryLink: { href: string; label: string };
  menuLinks: UserMenuLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === nav[0]?.href ? pathname === href : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#1e1b4b_0%,#2a2580_55%,#312e81_100%)] text-white">
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <Link href="/" className="flex flex-col rounded-lg" aria-label="Maa One website">
          <BrandLogo className="h-12" />
          <span className="mt-2 text-[11px] font-semibold tracking-[0.14em] text-indigo-200 uppercase">{area}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-2 text-indigo-200 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav aria-label={area} className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {nav.map((item) => {
            const Icon = icons[item.icon];
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#4f46e5] text-white shadow-lg shadow-black/20"
                      : "text-indigo-100/90 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {!!item.badge && (
                    <span className="min-w-5 rounded-full bg-rose-500 px-1.5 text-center text-[11px] leading-5 font-bold text-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="m-3 rounded-2xl bg-white/10 p-4">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="truncate text-xs text-indigo-200">{user.detail}</p>
        <div className="mt-3 flex gap-2">
          <a
            href={primaryLink.href}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-2 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300"
          >
            {primaryLink.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex h-full items-center justify-center rounded-lg bg-white/10 px-2.5 text-indigo-100 hover:bg-white/20 hover:text-white"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-bg lg:pl-64">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-slate-950/60" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-ml-1 rounded-lg p-2 text-ink hover:bg-surface-2 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="lg:hidden" aria-label="Maa One website">
          <BrandLogo className="h-9" />
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <UserMenu name={user.name} detail={user.detail} links={menuLinks} />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
