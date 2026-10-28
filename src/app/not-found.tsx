import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <section className="container-page py-24 text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-2 text-4xl font-bold text-ink">Page not found</h1>
          <p className="lead mt-3">The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
          <ButtonLink href="/" className="mt-8">
            Back to home
          </ButtonLink>
        </section>
      </main>
      <Footer />
    </>
  );
}
