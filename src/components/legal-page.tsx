import type { ReactNode } from "react";
import { site } from "@/site.config";

export const LEGAL_UPDATED = "27 October 2026";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="container-page max-w-3xl py-14 sm:py-20">
      <p className="inline-block rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent-ink">
        [To be reviewed by a lawyer]
      </p>
      <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LEGAL_UPDATED}</p>
      <div className="prose-legal mt-8">
        {children}
        <GrievanceOfficer />
      </div>
    </article>
  );
}

export function GrievanceOfficer() {
  return (
    <>
      <h2>Grievance officer</h2>
      <p>
        In line with the Information Technology Act, 2000, the Digital Personal Data Protection
        Act, 2023 and the Consumer Protection (E-Commerce) Rules, 2020, the grievance officer for{" "}
        {site.name} is:
      </p>
      <p>
        <strong className="text-ink">{site.founder}</strong>, {site.founderTitle}, {site.company}
        <br />
        Email: <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
      </p>
      <p>
        We acknowledge complaints within 48 hours and aim to resolve them within 30 days of
        receipt.
      </p>
    </>
  );
}
