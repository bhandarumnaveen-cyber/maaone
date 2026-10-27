import { ChevronDown } from "lucide-react";
import { faqs } from "@/site.config";

export function Faq() {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-xl border border-line bg-surface">
      {faqs.map((f) => (
        <details key={f.q} className="group px-5 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown
              className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="pb-5 leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
