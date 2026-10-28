/** wa.me link for an Indian or international number, or null if it can't be dialled. */
export function whatsappHref(phone: string | null | undefined, text?: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const n = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
