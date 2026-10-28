import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { Attribution } from "@/components/attribution";
import { Analytics } from "@/components/analytics";
import { getSettings } from "@/lib/settings";

/** Marketing pages: site header and footer. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat href={settings.whatsappLink} />
      <Attribution />
      <Analytics />
    </>
  );
}
