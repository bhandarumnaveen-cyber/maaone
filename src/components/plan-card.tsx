import clsx from "clsx";
import { Check } from "lucide-react";
import { ButtonLink } from "./ui";

/** One pricing card. Server-safe, so the home page preview needs no client JavaScript. */
export function CardShell({
  name,
  summary,
  popular,
  price,
  unit,
  note,
  cta,
  features,
  wide = false,
}: {
  /** Spans two columns on tablets (price on the left, features on the right); a normal card on desktop. */
  wide?: boolean;
  name: string;
  summary: string;
  popular?: boolean;
  price: string;
  unit: string;
  note: string;
  cta: { href: string; label: string };
  features: string[];
}) {
  return (
    <article
      className={clsx(
        "card relative flex flex-col p-5",
        wide && "sm:col-span-2 sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-8 lg:col-span-1 lg:flex lg:items-stretch",
        popular && "border-brand-ink/60 shadow-xl shadow-brand/10 ring-1 ring-brand-ink/40",
      )}
    >
      {popular && (
        <span className="absolute -top-3 left-5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-slate-950">
          Most popular
        </span>
      )}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-ink">{name}</h3>
        <p className="mt-1 min-h-[2.5rem] text-sm text-muted">{summary}</p>
        <p className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-ink">{price}</span>
          <span className="text-sm text-muted">{unit}</span>
        </p>
        <p className="mt-1 h-5 text-xs text-muted">{note}</p>
        <ButtonLink href={cta.href} variant={popular ? "primary" : "secondary"} className="mt-5 w-full">
          {cta.label}
        </ButtonLink>
      </div>
      <ul className={clsx("mt-5 space-y-2.5 text-sm", wide && "sm:mt-0 lg:mt-5")}>
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
    </article>
  );
}
