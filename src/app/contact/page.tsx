import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { PageHero, buttonClass } from "@/components/ui";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Talk to the Maa One team. Email ${site.supportEmail} or WhatsApp ${site.whatsappDisplay}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to us">
        Questions about Maa One, pricing or the pilot? We usually reply within one working day.
      </PageHero>
      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-5">
            <a
              href={site.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonClass("primary", "lg")} w-full !bg-[#0E7A3E] hover:!bg-[#0B6532]`}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chat on WhatsApp
            </a>
            <div className="card divide-y divide-line">
              <ContactRow icon={<Mail className="h-5 w-5" aria-hidden="true" />} label="Email" href={`mailto:${site.supportEmail}`}>
                {site.supportEmail}
              </ContactRow>
              <ContactRow icon={<WhatsAppIcon className="h-5 w-5" />} label="WhatsApp" href={site.whatsappLink} external>
                {site.whatsappDisplay}
              </ContactRow>
              <ContactRow icon={<InstagramIcon className="h-5 w-5" />} label="Instagram" href={site.instagramUrl} external>
                {site.instagramHandle}
              </ContactRow>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

function ContactRow({
  icon,
  label,
  href,
  external,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-4 p-5 transition-colors hover:bg-surface-2"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">{icon}</span>
      <span>
        <span className="block text-sm text-muted">{label}</span>
        <span className="block font-semibold break-all text-ink">{children}</span>
      </span>
    </a>
  );
}
