import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OtpLogin } from "@/components/forms/otp-login";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

/** Only allow same-site relative redirects. */
function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next);

  return (
    <section className="container-page max-w-md py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Log in to Maa One</h1>
      <p className="mt-2 mb-8 text-muted">We&rsquo;ll send you a one-time code. No password needed.</p>
      <OtpLogin next={next} />
    </section>
  );
}
