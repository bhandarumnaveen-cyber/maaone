"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { MaaOneLogo } from "./logos";
import { ThemeToggle } from "./theme-toggle";
import { ButtonLink } from "./ui";
import { useSettings } from "./settings-provider";
import { primaryCta } from "@/lib/cta";
import { UserMenu, type UserMenuLink } from "./user-menu";
import { useSessionUser } from "./use-session-user";

const nav = [
  { href: "/features", label: "Features" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const settings = useSettings();
  const cta = primaryCta(settings);
  const user = useSessionUser();
  const menuLinks: UserMenuLink[] = [
    { href: "/account", label: "My account", icon: "account" },
    { href: "/account/profile", label: "My profile", icon: "profile" },
    ...(user?.isAdmin ? [{ href: "/admin", label: "Admin console", icon: "admin" as const }] : []),
    ...(settings.appReady ? [{ href: settings.appUrl, label: "Open Maa One app", icon: "app" as const, external: true }] : []),
  ];

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <MaaOneLogo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-brand-ink",
                    pathname === item.href ? "text-brand-ink" : "text-muted",
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <UserMenu name={user.name} detail={user.detail} links={menuLinks} compact />
          ) : (
            <>
              <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:text-brand-ink sm:block">
                Log in
              </Link>
              <span className="hidden sm:block">
                <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
              </span>
            </>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-surface-2 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-bg lg:hidden">
          <ul className="container-page flex flex-col py-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "block rounded-lg px-2 py-3 text-base font-medium",
                    pathname === item.href ? "text-brand-ink" : "text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
              {user ? (
                <>
                  <ButtonLink href="/account" size="lg" className="w-full">
                    My account
                  </ButtonLink>
                  {user.isAdmin && (
                    <ButtonLink href="/admin" variant="secondary" size="lg" className="w-full">
                      Admin console
                    </ButtonLink>
                  )}
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="w-full rounded-xl px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40">
                      Log out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <ButtonLink href={cta.href} size="lg" className="w-full">
                    {cta.label}
                  </ButtonLink>
                  <ButtonLink href="/login" variant="secondary" size="lg" className="w-full">
                    Log in
                  </ButtonLink>
                </>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
