import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Redirects to a short-lived signed link for the user's own invoice PDF (RLS + storage policy). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=/account`, req.url));

  const { data: invoice } = await supabase.from("invoices").select("pdf_path").eq("id", id).maybeSingle();
  if (!invoice?.pdf_path) return new NextResponse("Invoice not found", { status: 404 });

  const { data, error } = await supabase.storage.from("invoices").createSignedUrl(invoice.pdf_path, 60);
  if (error || !data) return new NextResponse("Invoice PDF is not available yet", { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
