import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

/** Marketing pages: site header and footer. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
