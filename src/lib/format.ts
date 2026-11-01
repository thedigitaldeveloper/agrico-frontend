/**
 * Value formatting shared across server and client components.
 *
 * `formatFee` lived on the program card until the course finder needed it: that
 * section recomputes a "from ₹X" line as its filters change, so the function has
 * to run in the browser — and importing it from a card module would have pulled
 * next/image, Badge and the rating stars into the client bundle behind it.
 */

/** Formats an annual fee as compact Indian currency — "₹2.5 L", "₹1.2 Cr". */
export function formatFee(fee: number | null): string | null {
  if (fee === null || fee === undefined || !Number.isFinite(Number(fee))) return null;
  // Strapi decimal values can arrive as strings from SQL drivers.
  fee = Number(fee);
  if (fee >= 10_000_000) return `₹${(fee / 10_000_000).toFixed(1)} Cr`;
  if (fee >= 100_000) return `₹${(fee / 100_000).toFixed(1)} L`;
  return `₹${fee.toLocaleString('en-IN')}`;
}
