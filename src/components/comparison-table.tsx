import { Check, Minus } from "lucide-react";
import { comparison } from "@/site.config";
import type { Plan } from "@/lib/types";

export function ComparisonTable({ plans }: { plans: Plan[] }) {
  const rows = [
    {
      label: "Users",
      values: Object.fromEntries(plans.map((p) => [p.code, p.maxUsers === null ? "No fixed limit" : String(p.maxUsers)])),
    },
    {
      label: "Businesses",
      values: Object.fromEntries(plans.map((p) => [p.code, p.maxBusinesses > 1 ? `Up to ${p.maxBusinesses}` : "1"])),
    },
    ...comparison,
  ];
  return (
    <div className="relative overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Feature comparison across Maa One plans</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="sticky left-0 bg-surface px-4 py-4 font-semibold text-ink">
              Feature
            </th>
            {plans.map((p) => (
              <th key={p.code} scope="col" className="px-4 py-4 text-center font-semibold text-ink">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="sticky left-0 bg-surface px-4 py-3 font-medium text-ink">
                {row.label}
              </th>
              {plans.map((p) => {
                const v = row.values[p.code] ?? false;
                return (
                  <td key={p.code} className="px-4 py-3 text-center text-muted">
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
