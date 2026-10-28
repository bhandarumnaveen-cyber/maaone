import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireAdmin, type DashboardStats } from "@/lib/admin";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Maa One" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();
  if (auth.status === "anonymous") redirect("/login?next=/admin");
  if (auth.status === "forbidden") notFound();

  const [{ data: profile }, { data: stats }, settings] = await Promise.all([
    auth.supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle(),
    auth.supabase.rpc("admin_dashboard_stats"),
    getSettings(),
  ]);
  const s = stats as DashboardStats | null;
  const name = profile?.full_name || auth.user.email?.split("@")[0] || "Admin";

  return (
    <AppShell
      area="Admin console"
      user={{ name, detail: auth.user.email ?? auth.user.phone ?? "" }}
      primaryLink={{ href: "/", label: "View website" }}
      menuLinks={[
        { href: "/admin/profile", label: "My profile", icon: "profile" },
        { href: "/account", label: "My account", icon: "account" },
        { href: "/", label: "View website", icon: "site" },
        ...(settings.appReady ? [{ href: settings.appUrl, label: "Open Maa One app", icon: "app" as const, external: true }] : []),
      ]}
      nav={[
        { href: "/admin", label: "Overview", icon: "dashboard" },
        { href: "/admin/waitlist", label: "Waitlist", icon: "waitlist" },
        { href: "/admin/feature-requests", label: "Feature requests", icon: "ideas", badge: s?.feature_requests_new },
        { href: "/admin/contact", label: "Contact messages", icon: "messages", badge: s?.contact_messages_new },
        { href: "/admin/subscribers", label: "Subscribers", icon: "subscribers" },
        { href: "/admin/support", label: "Support tickets", icon: "support", badge: s?.support_tickets_open },
        { href: "/admin/profile", label: "My profile", icon: "profile" },
      ]}
    >
      {children}
    </AppShell>
  );
}
