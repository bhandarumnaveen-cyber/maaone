import { redirect } from "next/navigation";
import { loadAccount } from "@/lib/account";
import { BillingForm, type Billing } from "@/components/forms/billing-form";
import { PageHeader } from "@/components/dashboard-ui";

export const metadata = { title: "Billing details" };

export default async function BillingPage() {
  const acct = await loadAccount();
  if (!acct) redirect("/login?next=/account/billing");
  const { data: billing } = await acct.supabase
    .from("billing_details")
    .select("business_name, gstin, address_line1, address_line2, city, state, pincode")
    .eq("user_id", acct.user.id)
    .maybeSingle();
  return (
    <>
      <PageHeader title="Billing details" description="Printed on your GST invoices. Add your GSTIN to claim input tax credit. Changes apply to future invoices." />
      <section className="card max-w-3xl p-5 shadow-sm sm:p-6">
        <BillingForm initial={billing as Billing | null} />
      </section>
    </>
  );
}
