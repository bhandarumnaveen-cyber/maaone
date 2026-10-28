"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Spinner } from "./ui";

/**
 * Submit button for a regular (non-JavaScript) form such as log out or the admin reply form:
 * once the form is sent it shows a spinner and the busy text and blocks a second click
 * until the next page loads.
 */
export function PendingSubmit({
  children,
  busyText,
  className,
  iconOnly = false,
  ...props
}: {
  children: ReactNode;
  busyText: string;
  className?: string;
  /** Replace the content with just the spinner (for icon buttons). */
  iconOnly?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children" | "className">) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const onSubmit = (e: SubmitEvent) => {
      if (e.defaultPrevented) return;
      // Disable after the browser has captured the form data; disabling first would drop this button's name/value.
      setTimeout(() => setPending(true), 0);
    };
    const onPageShow = (e: PageTransitionEvent) => e.persisted && setPending(false);
    form.addEventListener("submit", onSubmit);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      form.removeEventListener("submit", onSubmit);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return (
    <button
      {...props}
      ref={ref}
      type="submit"
      className={className}
      disabled={pending || props.disabled}
      aria-busy={pending}
      aria-label={pending ? busyText : props["aria-label"]}
    >
      {pending ? (
        <span data-busy className="inline-flex animate-fade-in items-center gap-2">
          <Spinner />
          {!iconOnly && busyText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
