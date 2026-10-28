"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const START_EVENT = "maaone:navigation-start";

/** Show the top progress bar before a router.push / router.replace that isn't started by a link click. */
export function startNavigationProgress() {
  window.dispatchEvent(new Event(START_EVENT));
}

/** True for a click on an internal link that will load a different page. */
function isNavigatingClick(e: MouseEvent) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  const a = (e.target as Element | null)?.closest?.("a");
  if (!a || !a.href || a.hasAttribute("download") || (a.target && a.target !== "_self")) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  return url.pathname !== location.pathname || url.search !== location.search;
}

/**
 * Thin indigo-to-saffron bar at the top of the window while a page loads: after a link click,
 * a regular form post (log out, admin forms) or startNavigationProgress(). It creeps towards 90%
 * and completes when the new page's URL is in place.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState<number | null>(null);
  const timers = useRef<{ trickle?: ReturnType<typeof setInterval>; hide?: ReturnType<typeof setTimeout>; safety?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    const t = timers.current;
    const clear = () => {
      clearInterval(t.trickle);
      clearTimeout(t.hide);
      clearTimeout(t.safety);
    };
    const finish = () => {
      clear();
      setProgress((p) => (p === null ? null : 100));
      t.hide = setTimeout(() => setProgress(null), 300);
    };
    const start = () => {
      clear();
      setProgress(8);
      t.trickle = setInterval(() => setProgress((p) => (p === null ? p : p + (90 - p) * 0.08)), 200);
      // A page that never changes the URL (same-page link, failed post) shouldn't leave the bar stuck.
      t.safety = setTimeout(finish, 15_000);
    };
    const onClick = (e: MouseEvent) => isNavigatingClick(e) && start();
    // Bubble phase on window runs after React's handlers, so forms handled in JS are already preventDefault-ed.
    const onSubmit = (e: SubmitEvent) => !e.defaultPrevented && start();
    // Back/forward cache restores the page as it was left: hide a bar that was showing.
    const onPageShow = (e: PageTransitionEvent) => e.persisted && finish();

    document.addEventListener("click", onClick, true);
    window.addEventListener("submit", onSubmit);
    window.addEventListener(START_EVENT, start);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("maaone:navigation-done", finish);
    return () => {
      clear();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("submit", onSubmit);
      window.removeEventListener(START_EVENT, start);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("maaone:navigation-done", finish);
    };
  }, []);

  // The new page is in place: complete the bar.
  useEffect(() => {
    window.dispatchEvent(new Event("maaone:navigation-done"));
  }, [pathname, searchParams]);

  if (progress === null) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-brand via-indigo-400 to-accent shadow-[0_0_10px_rgba(245,158,11,0.6)] transition-[width,opacity] duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  );
}
