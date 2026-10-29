import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { OtpLogin } from "@/components/forms/otp-login";
import { AppImage } from "@/components/app-image";
import { BrandLogo } from "@/components/logos";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

/** Only allow same-site relative redirects. */
/** Only same-site paths: no "//host", no backslashes ("/\\host" is read as "//host"), no control characters. */
function safeNext(next?: string) {
  return next && /^\/(?![/\\])[^\\\s]*$/.test(next) ? next : "/auth/continue";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; signedout?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next);

  return (
    <section className="bg-[linear-gradient(135deg,#f6f4ff_0%,#eef0ff_45%,#fff6ea_100%)] dark:bg-[linear-gradient(135deg,#0d0c1d_0%,#141235_55%,#1d1408_100%)]">
      <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
        <div className="mx-auto w-full max-w-md">
          {params.signedout && (
            <p role="status" className="mb-6 flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> You&rsquo;re logged out. See you soon!
            </p>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Log in to Maa One</h1>
          <p className="mt-2 mb-8 text-muted">We&rsquo;ll send you a one-time code. No password needed.</p>
          <OtpLogin next={next} />
          <p className="mt-6 flex items-center gap-2 text-xs text-muted">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Secure login by email or phone OTP.
          </p>
        </div>
        <div className="relative hidden overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#1e1b4b_0%,#2a2580_55%,#3730a3_100%)] p-10 text-white shadow-2xl shadow-indigo-900/30 lg:block">
          <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" aria-hidden="true" />
          <BrandLogo className="relative h-16" />
          <p className="relative mt-8 text-3xl leading-tight font-extrabold">
            Poora business,
            <br />
            <span className="text-amber-300">ek app mein.</span>
          </p>
          <p className="relative mt-3 max-w-sm text-indigo-100">Leads, replies, invoices and payments — one app for your business.</p>
          <AppImage name="phone-ai-draft" sizes="240px" className="relative mx-auto mt-8 -mb-40 w-60 drop-shadow-2xl" />
        </div>
      </div>
    </section>
  );
}
