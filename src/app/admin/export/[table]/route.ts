import { NextResponse } from "next/server";
import { adminTables, isAdminTable, requireAdmin, toCsv } from "@/lib/admin";

const PAGE = 1000;

export async function GET(_req: Request, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  if (!isAdminTable(table)) return new NextResponse("Not found", { status: 404 });

  const auth = await requireAdmin();
  if (auth.status !== "ok") return new NextResponse("Not found", { status: 404 });

  const def = adminTables[table];
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await auth.supabase
      .from(def.table)
      .select(def.columns.join(","))
      .order(def.order, { ascending: def.ascending })
      .range(from, from + PAGE - 1);
    if (error) {
      console.error("[admin export]", error);
      return new NextResponse("Export failed", { status: 500 });
    }
    rows.push(...((data ?? []) as unknown as Record<string, unknown>[]));
    if (!data || data.length < PAGE) break;
  }

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(def.columns, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="maaone-${table}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
