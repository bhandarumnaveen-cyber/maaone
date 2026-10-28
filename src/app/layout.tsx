import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { themeScript } from "@/lib/theme";
import { SettingsProvider } from "@/components/settings-provider";
import { JsonLd } from "@/components/json-ld";
import { getSettings } from "@/lib/settings";
import { site } from "@/site.config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B12" },
  ],
};

/** Re-read site_settings and plans from Supabase at most every 5 minutes. */
export const revalidate = 300;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  return (
    <html lang="en-IN" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.company,
            url: site.url,
            email: settings.supportEmail,
            founder: { "@type": "Person", name: site.founder, jobTitle: site.founderTitle },
            sameAs: [settings.instagramUrl],
            brand: { "@type": "Brand", name: site.name },
          }}
        />
        <SettingsProvider value={settings}>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
