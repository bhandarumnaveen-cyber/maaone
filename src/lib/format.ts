export type Currency = "INR" | "USD";
export type Billing = "monthly" | "yearly";

export function formatMoney(amount: number, currency: Currency): string {
  return currency === "INR"
    ? `₹${amount.toLocaleString("en-IN")}`
    : `$${amount.toLocaleString("en-US")}`;
}
