import { Check, Minus } from "lucide-react";
import { comparison, paidPlans } from "@/site.config";

export function ComparisonTable() {
  return (
    <div className="relative overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Feature comparison across Maa One plans</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="sticky left-0 bg-surface px-4 py-4 font-semibold text-ink">
              Feature
            </th>
            {paidPlans.map((p) => (
              <th key={p.id} scope="col" className="px-4 py-4 text-center font-semibold text-ink">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {comparison.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="sticky left-0 bg-surface px-4 py-3 font-medium text-ink">
                {row.label}
              </th>
              {paidPlans.map((p) => {
                const v = row.values[p.id as keyof typeof row.values];
                return (
                  <td key={p.id} className="px-4 py-3 text-center text-muted">
                    {v === true ? (
                      <>
                        <Check className="mx-auto h-5 w-5 text-success" aria-hidden="true" />
                        <span className="sr-only">Included</span>
                      </>
                    ) : v === false ? (
                      <>
                        <Minus className="mx-auto h-5 w-5 text-muted/50" aria-hidden="true" />
                        <span className="sr-only">Not included</span>
                      </>
                    ) : (
                      <span className="font-medium text-ink">{v}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
