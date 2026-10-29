import { after } from "next/server";
import { redirectTo } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBrand, sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";
import { getSettings } from "@/lib/settings";

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** Where to land after login when no page was requested: admins go to /admin, everyone else to /account. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirectTo("/login");
  const { data } = await supabase.from("profiles").select("is_admin, full_name").eq("id", user.id).maybeSingle();

  // Welcome email once, for accounts created in the last week. The flag lives in the
  // user's app metadata (only the service role can set it), so no table change is needed.
  if (user.email && !user.app_metadata?.welcome_sent && Date.now() - new Date(user.created_at).getTime() < WEEK) {
    after(async () => {
      try {
        const db = createAdminClient();
        await db.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, welcome_sent: true } });
        const s = await getSettings();
        await sendEmail(
          user.email,
          welcomeEmail(await getBrand(), { name: data?.full_name, salesOpen: s.salesOpen, launchYear: s.launchYear, trialDays: s.trialDays }),
        );
      } catch (e) {
        console.error("[welcome email]", e);
      }
    });
  }

  return redirectTo(data?.is_admin ? "/admin" : "/account");
}
