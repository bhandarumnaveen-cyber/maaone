import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { loadAccount } from "@/lib/account";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s · My account · Maa One" },
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const [acct, settings] = await Promise.all([loadAccount(), getSettings()]);
  if (!acct) redirect("/login?next=/account");
  const { user, profile } = acct;

  const { data: tickets } = await acct.supabase.from("support_tickets").select("id").eq("user_id", user.id).eq("status", "answered");
  const name = profile?.full_name || user.email?.split("@")[0] || "My account";

  return (
    <AppShell
      area="My account"
      user={{ name, detail: user.email ?? user.phone ?? "" }}
      primaryLink={{ href: settings.appUrl, label: "Open Maa One" }}
      menuLinks={[
        { href: "/account/profile", label: "My profile", icon: "profile" },
        { href: "/account/subscription", label: "My subscription", icon: "account" },
        ...(profile?.is_admin ? [{ href: "/admin", label: "Admin console", icon: "admin" as const }] : []),
        { href: "/", label: "View website", icon: "site" },
        { href: settings.appUrl, label: "Open Maa One app", icon: "app", external: true },
      ]}
      nav={[
        { href: "/account", label: "Overview", icon: "dashboard" },
        { href: "/account/subscription", label: "Subscription", icon: "subscribers" },
        { href: "/account/invoices", label: "Invoices", icon: "invoices" },
        { href: "/account/billing", label: "Billing details", icon: "billing" },
        { href: "/account/support", label: "Support", icon: "support", badge: tickets?.length },
        { href: "/account/profile", label: "My profile", icon: "profile" },
      ]}
    >
      {children}
    </AppShell>
  );
}
