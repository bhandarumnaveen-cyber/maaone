import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { MaaLabsLogo, MaaOneLogo, NaveenCodesLogo } from "./logos";
import { ButtonLink } from "./ui";
import { site } from "@/site.config";
import { getSettings } from "@/lib/settings";
import { primaryCta } from "@/lib/cta";
import { industries } from "@/data/industries";

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
    title: "Solutions",
    links: [
      ...industries.map((i) => ({ href: `/for/${i.slug}`, label: i.short })),
      { href: "/for", label: "All businesses" },
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
  const support = [
    { href: "/contact", label: "Contact us" },
    { href: "/#faq", label: "FAQ" },
    { href: `mailto:${s.supportEmail}`, label: "Email us" },
    { href: s.whatsappLink, label: "WhatsApp us", external: true },
  ];
  return (
    <footer className="dark border-t border-white/10 bg-[linear-gradient(180deg,#14123a_0%,#0e0d26_100%)] text-ink">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-9 py-10 sm:py-12 md:grid-cols-4 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-x-8 lg:py-14">
        {/* Brand: full width on phones and tablets (side by side with the button on tablets), first column on desktop */}
        <div className="col-span-2 md:col-span-4 md:flex md:items-center md:justify-between md:gap-8 lg:col-span-1 lg:block">
          <div>
            <MaaOneLogo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {site.tagline}. {site.taglineEnglish}.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 md:mt-0 md:shrink-0 md:flex-col md:items-end lg:mt-5 lg:items-start">
            {!s.salesOpen && (
              <p className="text-sm font-semibold text-accent-ink">Launching {s.launchYear}</p>
            )}
            <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
          </div>
        </div>

        <FooterColumn title={columns[0].title} links={columns[0].links} />
        <FooterColumn title="Support" links={support} />
        <FooterColumn title={columns[1].title} links={columns[1].links} />
        <FooterColumn title={columns[2].title} links={columns[2].links} />
      </div>

      {/* Brand strip */}
      <div className="border-t border-white/10">
        <div className="container-page grid gap-3 py-6 sm:gap-4 md:grid-cols-2 md:py-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Maa One is a product of</p>
            <a
              href={site.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Maa Labs — maalabs.in"
              className="mt-2.5 flex h-8 w-fit items-center rounded-lg transition-opacity hover:opacity-85"
            >
              <MaaLabsLogo className="text-xl" />
            </a>
            <p className="mt-1 text-sm text-muted">{site.company}</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
              <li>
                <a href={site.companyUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-1.5`}>
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  maalabs.in
                </a>
              </li>
              <li>
                <a href={`mailto:${s.supportEmail}`} className={`${linkClass} inline-flex items-center gap-1.5`}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {s.supportEmail}
                </a>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Designed &amp; built by</p>
            <a
              href={site.developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 flex h-8 w-fit items-center rounded-lg text-xl transition-opacity hover:opacity-85"
              aria-label="NaveenCodes — naveencodes.com"
            >
              <NaveenCodesLogo />
            </a>
            <p className="mt-1 text-sm text-muted">Built by {site.founder}</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
              <li>
                <a href={site.developer.url} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-1.5`}>
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  naveencodes.com
                </a>
              </li>
              <li>
                <a href={`mailto:${s.naveencodesEmail}`} className={`${linkClass} inline-flex items-center gap-1.5`}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {s.naveencodesEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col-reverse items-center gap-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs leading-relaxed text-muted">
            © {site.copyrightYear}{" "}
            <a href={site.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-ink">
              {site.company}
            </a>
            . All rights reserved.
            <span className="block sm:inline"> {site.founderTitle}: {site.founder}.</span>
          </p>
          <ul className="flex gap-2" aria-label="Social links">
            <li>
              <a
                href={s.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${s.instagramHandle}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-muted transition-colors hover:border-white/25 hover:text-ink"
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-muted transition-colors hover:border-white/25 hover:text-ink"
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

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold tracking-[0.12em] text-ink uppercase">{title}</h2>
      <ul className="mt-3.5 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            {l.external || l.href.startsWith("mailto:") ? (
              <a href={l.href} className={linkClass} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className={linkClass}>
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
