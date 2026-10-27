import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { site } from "@/site.config";

export type InvoiceRow = {
  id: string;
  invoice_number: string;
  user_id: string | null;
  invoice_date: string;
  period_start: string | null;
  period_end: string | null;
  description: string;
  buyer: {
    business_name?: string | null;
    gstin?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    country?: string | null;
    email?: string | null;
  };
  place_of_supply: string | null;
  currency: "INR" | "USD";
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  is_export: boolean;
  pdf_path: string | null;
};

/** Storage path inside the "invoices" bucket: <user_id>/<number with / → ->.pdf */
export function invoicePdfPath(inv: Pick<InvoiceRow, "user_id" | "invoice_number">) {
  return `${inv.user_id ?? "no-user"}/${inv.invoice_number.replace(/\//g, "-")}.pdf`;
}

// Standard PDF fonts have no ₹ glyph, so amounts are written as "INR 1,499.00".
function money(minor: number, currency: string) {
  const v = (minor / 100).toLocaleString(currency === "INR" ? "en-IN" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${v}`;
}

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(`${d}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** Standard fonts only cover WinAnsi; drop anything else (e.g. Devanagari) instead of crashing. */
const pdfSafe = (t: string) => t.replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u20AC]/g, "").trim();

const INDIGO = rgb(0x37 / 255, 0x30 / 255, 0xa3 / 255);
const SLATE = rgb(0.2, 0.25, 0.33);
const MUTED = rgb(0.4, 0.45, 0.53);
const LINE = rgb(0.88, 0.9, 0.93);

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderInvoicePdf(inv: InvoiceRow, opts: { supportEmail: string; gstRate: number }) {
  const doc = await PDFDocument.create();
  doc.setTitle(`Tax Invoice ${inv.invoice_number}`);
  doc.setAuthor(site.company);
  const page: PDFPage = doc.addPage([595.28, 841.89]); // A4
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const L = 48;
  const R = 595.28 - 48;
  let y = 790;

  const text = (t: string, x: number, yy: number, o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {}) =>
    page.drawText(pdfSafe(t), { x, y: yy, font: o.font ?? regular, size: o.size ?? 10, color: o.color ?? SLATE });
  const right = (t: string, xr: number, yy: number, o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {}) => {
    const f = o.font ?? regular;
    text(t, xr - f.widthOfTextAtSize(pdfSafe(t), o.size ?? 10), yy, o);
  };

  // Header
  text("Maa One", L, y, { font: bold, size: 20, color: INDIGO });
  right(inv.is_export ? "INVOICE" : "TAX INVOICE", R, y, { font: bold, size: 16 });
  y -= 18;
  text(site.creditLine, L, y, { size: 8, color: MUTED });
  right(`Invoice no. ${inv.invoice_number}`, R, y, { size: 10 });
  y -= 14;
  right(`Date ${fmtDate(inv.invoice_date)}`, R, y, { size: 10 });

  // Seller / buyer
  y -= 34;
  text("FROM", L, y, { font: bold, size: 8, color: MUTED });
  text("BILL TO", 310, y, { font: bold, size: 8, color: MUTED });
  y -= 14;
  const seller = [
    site.company,
    ...(process.env.INVOICE_SELLER_ADDRESS ? wrap(pdfSafe(process.env.INVOICE_SELLER_ADDRESS), regular, 9, 230) : []),
    process.env.INVOICE_SELLER_GSTIN ? `GSTIN: ${process.env.INVOICE_SELLER_GSTIN}` : "",
    opts.supportEmail,
  ].filter(Boolean);
  const b = inv.buyer ?? {};
  const buyer = [
    b.business_name || b.email || "Customer",
    b.address_line1 ?? "",
    b.address_line2 ?? "",
    [b.city, b.state, b.pincode].filter(Boolean).join(", "),
    b.country && b.country !== "IN" ? b.country : "",
    b.gstin ? `GSTIN: ${b.gstin}` : "",
    b.email && b.business_name ? b.email : "",
  ].filter(Boolean) as string[];
  const rows = Math.max(seller.length, buyer.length);
  for (let i = 0; i < rows; i++) {
    if (seller[i]) text(seller[i], L, y, { font: i === 0 ? bold : regular, size: 9 });
    if (buyer[i]) text(buyer[i], 310, y, { font: i === 0 ? bold : regular, size: 9 });
    y -= 13;
  }
  y -= 4;
  text(`Place of supply: ${inv.place_of_supply ?? ""}`, 310, y, { size: 9, color: MUTED });

  // Line items
  y -= 30;
  page.drawRectangle({ x: L, y: y - 6, width: R - L, height: 22, color: rgb(0.93, 0.95, 1) });
  text("Description", L + 8, y, { font: bold, size: 9 });
  text("SAC", 360, y, { font: bold, size: 9 });
  right("Amount", R - 8, y, { font: bold, size: 9 });
  y -= 26;
  const descLines = wrap(pdfSafe(inv.description), regular, 10, 290);
  descLines.forEach((line, i) => text(line, L + 8, y - i * 13, { size: 10 }));
  text(process.env.INVOICE_SAC || "997331", 360, y, { size: 10 });
  right(money(inv.subtotal, inv.currency), R - 8, y, { size: 10 });
  y -= descLines.length * 13;
  if (inv.period_start && inv.period_end) {
    text(`Service period: ${fmtDate(inv.period_start)} to ${fmtDate(inv.period_end)}`, L + 8, y, { size: 8, color: MUTED });
    y -= 13;
  }
  y -= 8;
  page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 1, color: LINE });

  // Totals
  const totals: [string, number][] = [["Taxable value", inv.subtotal]];
  const half = opts.gstRate / 2;
  if (inv.cgst) totals.push([`CGST @ ${half}%`, inv.cgst]);
  if (inv.sgst) totals.push([`SGST @ ${half}%`, inv.sgst]);
  if (inv.igst) totals.push([`IGST @ ${opts.gstRate}%`, inv.igst]);
  y -= 20;
  for (const [label, amount] of totals) {
    text(label, 340, y, { size: 10 });
    right(money(amount, inv.currency), R - 8, y, { size: 10 });
    y -= 16;
  }
  page.drawLine({ start: { x: 340, y: y + 6 }, end: { x: R, y: y + 6 }, thickness: 1, color: LINE });
  y -= 10;
  text("Total paid", 340, y, { font: bold, size: 12 });
  right(money(inv.total, inv.currency), R - 8, y, { font: bold, size: 12, color: INDIGO });

  // Notes
  y -= 46;
  const notes = [
    inv.is_export
      ? "Supply meant for export under LUT without payment of integrated tax."
      : "Tax is payable on reverse charge: No.",
    "Payment received via Razorpay. This is a computer-generated invoice and does not need a signature.",
  ];
  for (const n of notes) {
    for (const line of wrap(pdfSafe(n), regular, 8, R - L)) {
      text(line, L, y, { size: 8, color: MUTED });
      y -= 11;
    }
  }
  text(`${site.company} | Founder & Director: ${site.founder} | ${opts.supportEmail}`, L, 40, { size: 7, color: MUTED });

  return doc.save();
}
