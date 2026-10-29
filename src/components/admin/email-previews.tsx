"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, Copy, Send } from "lucide-react";
import { buttonClass, BusyLabel } from "../ui";

type Preview = { key: string; label: string; when: string; subject: string; html: string };

/** List of emails on the left, a live preview on the right, and "send me a test". */
export function EmailPreviewList({ emails, canSend }: { emails: Preview[]; canSend: boolean }) {
  const [active, setActive] = useState(emails[0].key);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const e = emails.find((x) => x.key === active) ?? emails[0];

  async function sendTest() {
    setState("sending");
    const res = await fetch("/api/admin/test-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: e.key }) }).catch(() => null);
    const json = await res?.json().catch(() => null);
    setState(res?.ok && json?.ok ? "sent" : "error");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <ul className="card divide-y divide-line self-start overflow-hidden p-0">
        {emails.map((x) => (
          <li key={x.key}>
            <button
              type="button"
              onClick={() => {
                setActive(x.key);
                setState("idle");
              }}
              className={clsx("w-full px-4 py-3 text-left transition-colors", x.key === active ? "bg-brand-soft" : "hover:bg-surface-2")}
              aria-current={x.key === active}
            >
              <span className={clsx("block text-sm font-semibold", x.key === active ? "text-brand-ink" : "text-ink")}>{x.label}</span>
              <span className="mt-0.5 block text-xs text-muted">{x.when}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="card min-w-0 overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Subject</p>
            <p className="truncate font-semibold text-ink">{e.subject}</p>
          </div>
          <button type="button" onClick={sendTest} disabled={!canSend || state === "sending"} className={buttonClass("secondary")} title={canSend ? undefined : "Set up SMTP first"}>
            <BusyLabel busy={state === "sending"} busyText="Sending…">
              {state === "sent" ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {state === "sent" ? "Sent to your inbox" : state === "error" ? "Failed — try again" : "Send me a test"}
            </BusyLabel>
          </button>
        </div>
        <iframe title={`${e.label} preview`} srcDoc={e.html} sandbox="" className="h-[760px] w-full bg-[#F4F3F8]" />
      </div>
    </div>
  );
}

export function AuthTemplateCard({ name, subject, html }: { name: string; subject: string; html: string }) {
  const [copied, setCopied] = useState<"" | "subject" | "html">("");
  const copy = async (what: "subject" | "html") => {
    await navigator.clipboard.writeText(what === "subject" ? subject : html);
    setCopied(what);
    setTimeout(() => setCopied(""), 1500);
  };
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{name}</p>
          <p className="truncate text-xs text-muted">{subject}</p>
        </div>
        <button type="button" onClick={() => copy("subject")} className={buttonClass("ghost")}>
          {copied === "subject" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />} Subject
        </button>
        <button type="button" onClick={() => copy("html")} className={buttonClass("secondary")}>
          {copied === "html" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />} Copy HTML
        </button>
      </div>
      <iframe title={`${name} preview`} srcDoc={html} sandbox="" className="h-[460px] w-full bg-[#F4F3F8]" />
    </div>
  );
}
