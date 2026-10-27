export type Currency = "INR" | "USD";
export type Billing = "monthly" | "yearly";

/** Formats an amount in paise/cents, dropping ".00". */
export function formatMoney(minor: number, currency: Currency): string {
  const major = minor / 100;
  const opts = { minimumFractionDigits: major % 1 ? 2 : 0, maximumFractionDigits: 2 };
  return currency === "INR"
    ? `₹${major.toLocaleString("en-IN", opts)}`
    : `$${major.toLocaleString("en-US", opts)}`;
}
