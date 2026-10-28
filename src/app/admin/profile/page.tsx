import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/profile-settings";
import { PageHeader } from "@/components/dashboard-ui";
import { loadProfile } from "@/lib/profile";

export const metadata = { title: "My profile" };

export default async function AdminProfile() {
  const data = await loadProfile();
  if (!data) redirect("/login?next=/admin/profile");
  return (
    <>
      <PageHeader title="My profile" description="Your details, login email and sessions." />
      <ProfileSettings
        fullName={data.profile?.full_name ?? ""}
        phone={data.profile?.phone ?? ""}
        email={data.user.email ?? null}
        loginPhone={data.user.phone ?? null}
      />
    </>
  );
}
