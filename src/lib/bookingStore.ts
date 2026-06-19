import { api } from "./api";
import { decodeExtras, type UtilityItem, type AdvanceItem } from "./bookingExtras";

export interface Booking {
  utilityItems?: UtilityItem[];
  advanceItems?: AdvanceItem[];
  id: string;
  name: string;
  address: string;
  occupation: string;
  phone: string;
  alternatePhone?: string;
  proofIdType: string;
  proofIdNumber: string;
  advancePayment?: number;
  tariffAmount?: number;
  functionType: string;
  purposeDescription?: string;
  fromDateTime: string;
  toDateTime: string;
  allottedSlot: "AM" | "PM";
  hallType: string;
  regularRooms?: number;
  deluxeRooms?: number;
  utilityCharges: number;
  receiptNumber: string;
  bookingDate: string;
  termsAccepted: boolean;
  signature: string;
  functionName: string;
  createdAt: string;
}

export type BookingStatus = "Upcoming" | "Ongoing" | "Completed";

export function getBookingStatus(booking: Booking): BookingStatus {
  const now = new Date();
  const from = new Date(booking.fromDateTime);
  const to = new Date(booking.toDateTime);
  if (now < from) return "Upcoming";
  if (now > to) return "Completed";
  return "Ongoing";
}

function toApiPayload(booking: Booking) {
  return {
    id: booking.id,
    name: booking.name,
    address: booking.address,
    occupation: booking.occupation,
    phone: booking.phone,
    alternate_phone: booking.alternatePhone ?? null,
    proof_id_type: booking.proofIdType,
    proof_id_number: booking.proofIdNumber,
    advance_payment: booking.advancePayment ?? null,
    tariff_amount: booking.tariffAmount ?? null,
    function_type: booking.functionType,
    function_name: booking.functionName,
    purpose_description: booking.purposeDescription ?? null,
    from_date_time: booking.fromDateTime,
    to_date_time: booking.toDateTime,
    allotted_slot: booking.allottedSlot,
    hall_type: booking.hallType,
    regular_rooms: booking.regularRooms ?? null,
    deluxe_rooms: booking.deluxeRooms ?? null,
    utility_charges: booking.utilityCharges,
    utility_items: booking.utilityItems ?? decodeExtras(booking.purposeDescription).utilities,
    advance_items: booking.advanceItems ?? decodeExtras(booking.purposeDescription).advances,
    receipt_number: booking.receiptNumber,
    booking_date: booking.bookingDate,
    terms_accepted: booking.termsAccepted,
    signature: booking.signature,
  };
}

function normalizeDateTime(value: string | null | undefined): string {
  return (value || "").replace(" ", "T");
}

function toBooking(raw: any): Booking {
  return {
    ...raw,
    fromDateTime: normalizeDateTime(raw.fromDateTime ?? raw.from_date_time),
    toDateTime: normalizeDateTime(raw.toDateTime ?? raw.to_date_time),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    utilityItems: raw.utilityItems ?? raw.utility_items,
    advanceItems: raw.advanceItems ?? raw.advance_items,
  } as Booking;
}

// Kept for Dashboard (synchronous reads from cache)
let _cache: Booking[] = [];

export function getBookings(): Booking[] {
  return _cache;
}

export async function loadBookings(): Promise<Booking[]> {
  _cache = (await api.getBookings()).map(toBooking);
  return _cache;
}

export async function saveBooking(booking: Booking): Promise<{ success: boolean; conflict?: Booking }> {
  try {
    const saved = await api.createBooking(toApiPayload(booking));
    const normalized = toBooking(saved);
    _cache = [..._cache, normalized];
    return { success: true };
  } catch (err: any) {
    if (err.status === 409 && err.data?.conflict) {
      return { success: false, conflict: err.data.conflict };
    }
    throw err;
  }
}

export async function updateBooking(booking: Booking): Promise<{ success: boolean; conflict?: Booking }> {
  try {
    const updated = await api.updateBooking(booking.id, toApiPayload(booking));
    const normalized = toBooking(updated);
    _cache = _cache.map(b => b.id === booking.id ? normalized : b);
    return { success: true };
  } catch (err: any) {
    if (err.status === 409 && err.data?.conflict) {
      return { success: false, conflict: err.data.conflict };
    }
    throw err;
  }
}

export async function deleteBooking(id: string): Promise<void> {
  await api.deleteBooking(id);
  _cache = _cache.filter(b => b.id !== id);
}

export function generateBookingId(): string {
  const num = _cache.length + 1;
  return `BK-${String(num).padStart(4, "0")}`;
}
