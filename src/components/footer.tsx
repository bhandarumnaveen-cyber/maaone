import Link from "next/link";
import { Mail } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { MaaLabsLogo, MaaOneLogo, NaveenCodesLogo } from "./logos";
import { ButtonLink } from "./ui";
import { site } from "@/site.config";
import { getSettings } from "@/lib/settings";
import { primaryCta } from "@/lib/cta";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/changelog", label: "Changelog" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund-policy", label: "Refund" },
      { href: "/cancellation-policy", label: "Cancellation" },
      { href: "/cookie-policy", label: "Cookies" },
    ],
  },
];

const linkClass = "text-sm text-muted transition-colors hover:text-brand-ink";

export async function Footer() {
  const s = await getSettings();
  const cta = primaryCta(s);
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <MaaOneLogo />
          <p className="mt-3 text-sm text-muted">
            {site.tagline}.
            <br />
            {site.taglineEnglish}.
          </p>
          {!s.salesOpen && (
            <p className="mt-3 text-sm font-semibold text-accent-ink">
              Launching {s.launchDateLabel}
            </p>
          )}
          <ButtonLink href={cta.href} className="mt-4">
            {cta.label}
          </ButtonLink>
        </div>

        <FooterColumn title={columns[0].title} links={columns[0].links} />

        <div>
          <h2 className="text-sm font-semibold text-ink">Support</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link href="/contact" className={linkClass}>
                Contact
              </Link>
            </li>
            <li>
              <Link href="/#faq" className={linkClass}>
                FAQ
              </Link>
            </li>
            <li>
              <a href={`mailto:${s.supportEmail}`} className={`${linkClass} break-all`}>
                {s.supportEmail}
              </a>
            </li>
            <li>
              <a href={s.whatsappLink} className={linkClass} target="_blank" rel="noopener noreferrer">
                WhatsApp {s.whatsappDisplay}
              </a>
            </li>
          </ul>
        </div>

        <FooterColumn title={columns[1].title} links={columns[1].links} />
      </div>

      {/* Brand strip */}
      <div className="border-t border-line">
        <div className="container-page grid gap-6 py-8 md:grid-cols-2 md:items-start">
          <div>
            <p className="text-sm text-muted">Maa One is a product of</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2">
              <MaaLabsLogo className="text-lg" />
              <span className="text-sm font-medium text-ink">{site.company}</span>
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li>
                <a href={`mailto:${s.supportEmail}`} className={`${linkClass} inline-flex items-center gap-1.5`}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {s.supportEmail}
                </a>
              </li>
              <li>
                <a
                  href={s.whatsappLink}
                  className={`${linkClass} inline-flex items-center gap-1.5`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp {s.whatsappDisplay}
                </a>
              </li>
            </ul>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-muted">Built by</p>
            <a
              href={site.developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-lg hover:opacity-80"
              aria-label="NaveenCodes — naveencodes.com"
            >
              <NaveenCodesLogo />
            </a>
            <p className="mt-3 text-sm">
              <a href={`mailto:${s.naveencodesEmail}`} className={`${linkClass} inline-flex items-center gap-1.5`}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                {s.naveencodesEmail}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs leading-relaxed text-muted">
            <p>
              © {site.copyrightYear} {site.company}. All rights reserved. {site.founderTitle}:{" "}
              {site.founder}.
            </p>
            <p className="mt-1">{site.creditLine}</p>
          </div>
          <ul className="flex gap-2" aria-label="Social links">
            <li>
              <a
                href={s.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${s.instagramHandle}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:text-brand-ink"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </li>
            <li>
              <a
                href={s.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${s.whatsappDisplay}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:text-brand-ink"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={linkClass}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
