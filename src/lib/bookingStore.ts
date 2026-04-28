import { api } from "./api";

export interface Booking {
  id: string;
  name: string;
  address: string;
  occupation: string;
  phone: string;
  alternatePhone?: string;
  proofIdType: "Aadhaar" | "PAN" | "Driving License";
  proofIdNumber: string;
  advancePayment?: number;
  tariffAmount?: number;
  functionType: string;
  purposeDescription?: string;
  fromDateTime: string;
  toDateTime: string;
  allottedSlot: "AM" | "PM";
  hallType: "Single" | "Double";
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
    utility_charges: booking.utilityCharges,
    receipt_number: booking.receiptNumber,
    booking_date: booking.bookingDate,
    terms_accepted: booking.termsAccepted,
    signature: booking.signature,
  };
}

// Kept for Dashboard (synchronous reads from cache)
let _cache: Booking[] = [];

export function getBookings(): Booking[] {
  return _cache;
}

export async function loadBookings(): Promise<Booking[]> {
  _cache = await api.getBookings();
  return _cache;
}

export async function saveBooking(booking: Booking): Promise<{ success: boolean; conflict?: Booking }> {
  try {
    const saved = await api.createBooking(toApiPayload(booking));
    _cache = [..._cache, saved];
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
    _cache = _cache.map(b => b.id === booking.id ? updated : b);
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
