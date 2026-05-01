// Helpers to embed/extract dynamic utility line items and advance payment
// installments inside Booking.purposeDescription, since the DB schema only has
// scalar `utility_charges` and `advance_payment` columns.

export interface UtilityItem {
  description: string;
  amount: number;
}

export interface AdvanceItem {
  date: string; // ISO yyyy-mm-dd
  amount: number;
  note?: string;
}

export interface BookingExtras {
  utilities: UtilityItem[];
  advances: AdvanceItem[];
}

const MARKER_START = "<!--BOOKING_EXTRAS:";
const MARKER_END = "-->";

export function encodeExtras(purpose: string | undefined, extras: BookingExtras): string {
  const clean = stripExtras(purpose || "");
  const payload = JSON.stringify(extras);
  return `${clean}${clean ? "\n" : ""}${MARKER_START}${payload}${MARKER_END}`;
}

export function stripExtras(purpose: string): string {
  const idx = purpose.indexOf(MARKER_START);
  if (idx === -1) return purpose.trim();
  return purpose.slice(0, idx).trim();
}

export function decodeExtras(purpose: string | undefined): BookingExtras {
  if (!purpose) return { utilities: [], advances: [] };
  const start = purpose.indexOf(MARKER_START);
  if (start === -1) return { utilities: [], advances: [] };
  const after = purpose.slice(start + MARKER_START.length);
  const end = after.indexOf(MARKER_END);
  if (end === -1) return { utilities: [], advances: [] };
  try {
    const data = JSON.parse(after.slice(0, end)) as Partial<BookingExtras>;
    return {
      utilities: Array.isArray(data.utilities) ? data.utilities : [],
      advances: Array.isArray(data.advances) ? data.advances : [],
    };
  } catch {
    return { utilities: [], advances: [] };
  }
}

export function sumUtilities(items: UtilityItem[]): number {
  return items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
}

export function sumAdvances(items: AdvanceItem[]): number {
  return items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
}
