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

const STORAGE_KEY = "hall_bookings";

export function getBookings(): Booking[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBooking(booking: Booking): { success: boolean; conflict?: Booking } {
  const bookings = getBookings();
  const conflict = checkDoubleBooking(bookings, booking);
  if (conflict) return { success: false, conflict };
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return { success: true };
}

export function updateBooking(booking: Booking): { success: boolean; conflict?: Booking } {
  const bookings = getBookings();
  const others = bookings.filter((b) => b.id !== booking.id);
  const conflict = checkDoubleBooking(others, booking);
  if (conflict) return { success: false, conflict };
  const idx = bookings.findIndex((b) => b.id === booking.id);
  if (idx >= 0) bookings[idx] = booking;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return { success: true };
}

export function deleteBooking(id: string) {
  const bookings = getBookings().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function getBookingStatus(booking: Booking): BookingStatus {
  const now = new Date();
  const from = new Date(booking.fromDateTime);
  const to = new Date(booking.toDateTime);
  if (now < from) return "Upcoming";
  if (now > to) return "Completed";
  return "Ongoing";
}

function checkDoubleBooking(existing: Booking[], newBooking: Booking): Booking | undefined {
  const newFrom = new Date(newBooking.fromDateTime).getTime();
  const newTo = new Date(newBooking.toDateTime).getTime();
  return existing.find((b) => {
    if (b.hallType !== newBooking.hallType) return false;
    const bFrom = new Date(b.fromDateTime).getTime();
    const bTo = new Date(b.toDateTime).getTime();
    return newFrom < bTo && newTo > bFrom;
  });
}

export function generateBookingId(): string {
  const bookings = getBookings();
  const num = bookings.length + 1;
  return `BK-${String(num).padStart(4, "0")}`;
}
