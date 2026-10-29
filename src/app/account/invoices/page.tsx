import { redirect } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { loadAccount } from "@/lib/account";
import { formatMoney } from "@/lib/format";
import { EmptyState, PageHeader, Pill, istDate } from "@/components/dashboard-ui";
import { RefundRequest } from "@/components/account/refund-request";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const acct = await loadAccount();
  if (!acct) redirect("/login?next=/account/invoices");
  const { data: invoices } = await acct.supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, description, subtotal, total, currency, status, pdf_path")
    .eq("user_id", acct.user.id)
    .order("invoice_date", { ascending: false });
  const { data: refundTickets } = await acct.supabase
    .from("support_tickets")
    .select("subject")
    .eq("user_id", acct.user.id)
    .like("subject", "Refund request · %")
    .neq("status", "closed");
  const refundPending = new Set((refundTickets ?? []).map((t) => t.subject.replace("Refund request · ", "")));

  return (
    <>
      <PageHeader title="Invoices" description="GST invoices from Maa Labs Private Limited for every payment." />
      {!invoices?.length ? (
        <div className="card">
          <EmptyState icon={FileText} title="No invoices yet">
            A GST invoice is created automatically after each payment and appears here.
          </EmptyState>
        </div>
      ) : (
        <ul className="space-y-3">
          {invoices.map((inv) => (
            <li key={inv.id} className="card flex flex-wrap items-center gap-4 p-4 shadow-sm sm:p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                  {inv.invoice_number}
                  {inv.status === "cancelled" && <Pill tone="slate">Cancelled</Pill>}
                </p>
                <p className="truncate text-sm text-muted">
                  {istDate(inv.invoice_date)} · {inv.description}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-ink">{formatMoney(inv.total, inv.currency)}</p>
                <p className="text-xs text-muted">incl. GST</p>
              </div>
              {inv.pdf_path ? (
                <a
                  href={`/account/invoices/${inv.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink hover:border-brand-ink/40 hover:text-brand-ink"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> PDF
                </a>
              ) : (
                <span className="text-xs text-muted">Preparing PDF…</span>
              )}
              {inv.status !== "cancelled" && (
                <div className="w-full border-t border-line pt-3">
                  <RefundRequest invoiceId={inv.id} invoiceNumber={inv.invoice_number} pending={refundPending.has(inv.invoice_number)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
