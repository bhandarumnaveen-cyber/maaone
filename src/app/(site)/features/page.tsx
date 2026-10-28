import type { Metadata } from "next";
import { groupIcons } from "@/components/feature-blocks";
import { FinalCta } from "@/components/final-cta";
import { InvoiceMockup, LaptopDashboardMockup, PhoneInboxMockup, ScreenshotPlaceholder } from "@/components/mockups";
import { PageHero, ReleaseBadge } from "@/components/ui";
import { moduleGroups, versionById } from "@/site.config";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every Maa One module — inbox, AI replies, CRM, bookings, GST invoices, UPI links, campaigns and more — with the version each one ships in.",
  alternates: { canonical: "/features" },
};

const showcase = {
  win: <PhoneInboxMockup className="mx-auto w-[220px]" />,
  paid: <InvoiceMockup className="mx-auto" />,
  platform: <LaptopDashboardMockup className="mx-auto max-w-md" />,
} as const;

export default function FeaturesPage() {
  return (
    <>
      <PageHero eyebrow="Features" title="Everything your service business needs, in one app">
        Maa One starts with the inbox in v1 and adds a new module every 2–3 months. Each feature
        below shows exactly when it ships.
      </PageHero>

      <nav aria-label="Feature groups" className="sticky top-16 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <ul className="container-page flex gap-2 overflow-x-auto py-3">
          {moduleGroups.map((g) => (
            <li key={g.id}>
              <a
                href={`#${g.id}`}
                className="block rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-ink hover:border-brand-ink/50 hover:text-brand-ink"
              >
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {moduleGroups.map((group, gi) => {
        const Icon = groupIcons[group.id];
        const visual = showcase[group.id as keyof typeof showcase];
        return (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-title`}
            className={gi % 2 ? "section border-y border-line bg-surface" : "section"}
          >
            <div className="container-page">
              <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h2 id={`${group.id}-title`} className="h2 mt-4">
                    {group.title}
                  </h2>
                  <p className="lead mt-2">{group.blurb}</p>
                </div>
                {visual && <div className="hidden lg:block">{visual}</div>}
              </div>
              <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.modules.map((m) => (
                  <li key={m.name} className={gi % 2 ? "rounded-xl border border-line bg-bg p-4" : "card p-4"}>
                    <ScreenshotPlaceholder group={group.id} label={m.name} />
                    <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold text-ink">{m.name}</h3>
                      <ReleaseBadge version={m.version} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{m.description}</p>
                    <p className="mt-3 text-xs font-medium text-muted">
                      {versionById[m.version].month}
                      {m.upgrade && (
                        <>
                          {" · "}
                          {m.upgrade.label} in {m.upgrade.version} ({versionById[m.upgrade.version].month})
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <div className="pt-16 sm:pt-24">
        <FinalCta />
      </div>
    </>
  );
}
