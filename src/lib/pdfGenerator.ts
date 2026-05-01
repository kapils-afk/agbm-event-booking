import jsPDF from "jspdf";
import { Booking } from "./bookingStore";
import { decodeExtras, stripExtras, sumUtilities, sumAdvances } from "./bookingExtras";
import { format } from "date-fns";

export function generateBookingPDF(booking: Booking) {
  const doc = new jsPDF("p", "mm", "a4");
  const w = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  const addText = (text: string, x: number, yPos: number, opts?: { size?: number; bold?: boolean; align?: "left" | "center" | "right"; maxWidth?: number }) => {
    doc.setFontSize(opts?.size || 10);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    if (opts?.maxWidth) {
      const lines = doc.splitTextToSize(text, opts.maxWidth);
      doc.text(lines, x, yPos, { align: opts?.align });
      return lines.length * (opts?.size || 10) * 0.4;
    }
    doc.text(text, x, yPos, { align: opts?.align });
    return (opts?.size || 10) * 0.4;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > 280) { doc.addPage(); y = 15; }
  };

  // Header
  addText("ADI GOUD BRAHMIN MAHASHABA CHARITABLE TRUST", w / 2, y, { size: 14, bold: true, align: "center" });
  y += 5;
  addText("No. 417, Vegetarian Village, Puzhal, Chennai - 600 066", w / 2, y, { size: 9, align: "center" });
  y += 5;
  addText("Phone: 7603951126, 9444412706  |  Email: adigoudtrust@gmail.com", w / 2, y, { size: 9, align: "center" });
  y += 8;

  doc.setDrawColor(0);
  doc.line(margin, y, w - margin, y);
  y += 6;

  addText("BOOKING REGISTRATION FORM", w / 2, y, { size: 12, bold: true, align: "center" });
  y += 10;

  // Decode dynamic extras
  const extras = decodeExtras(booking.purposeDescription);
  const cleanPurpose = stripExtras(booking.purposeDescription || "");
  const tariffTotal = extras.utilities.length > 0 ? sumUtilities(extras.utilities) : Number(booking.tariffAmount || booking.utilityCharges || 0);
  const advanceTotal = extras.advances.length > 0 ? sumAdvances(extras.advances) : Number(booking.advancePayment || 0);
  const balance = tariffTotal - advanceTotal;

  // Section A — Applicant
  addText("Section A — Applicant Details", margin, y, { size: 11, bold: true });
  y += 7;

  const fields = [
    ["Name", booking.name],
    ["Address", booking.address],
    ["Occupation", booking.occupation],
    ["Phone / Mobile", booking.phone],
    ["Alternate Phone", booking.alternatePhone || "N/A"],
    [`${booking.proofIdType} Number`, booking.proofIdNumber],
  ];

  fields.forEach(([label, value]) => {
    addText(`${label}:`, margin, y, { bold: true });
    const h = addText(String(value), margin + 50, y, { maxWidth: w - margin - 55 });
    y += Math.max(6, h + 2);
  });

  y += 4;

  // Section B — Booking Details
  ensureSpace(40);
  addText("Section B — Booking Details", margin, y, { size: 11, bold: true });
  y += 7;

  const bookingFields = [
    ["Function Type", booking.functionType],
    ["Function Name", booking.functionName],
    ["Purpose", cleanPurpose || "N/A"],
    ["From", format(new Date(booking.fromDateTime), "dd/MM/yyyy hh:mm a")],
    ["To", format(new Date(booking.toDateTime), "dd/MM/yyyy hh:mm a")],
    ["Allotted Slot", booking.allottedSlot],
    ["Hall Type", booking.hallType],
    ["Receipt Number", booking.receiptNumber],
    ["Booking Date", format(new Date(booking.bookingDate), "dd/MM/yyyy")],
  ];

  bookingFields.forEach(([label, value]) => {
    ensureSpace(8);
    addText(`${label}:`, margin, y, { bold: true });
    const h = addText(String(value), margin + 50, y, { maxWidth: w - margin - 55 });
    y += Math.max(6, h + 2);
  });

  y += 4;

  // Section C — Utility Charges Table
  ensureSpace(40);
  addText("Section C — Utility Charges", margin, y, { size: 11, bold: true });
  y += 7;

  const utilityRows = extras.utilities.length > 0
    ? extras.utilities
    : (Number(booking.utilityCharges || 0) > 0 ? [{ description: "Utility Charges", amount: Number(booking.utilityCharges) }] : []);

  if (utilityRows.length === 0) {
    addText("No charges recorded.", margin, y);
    y += 6;
  } else {
    const col1 = margin;
    const col2 = margin + 15;
    const col3 = w - margin - 40;
    const tableWidth = w - 2 * margin;

    // Header
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y - 4, tableWidth, 7, "F");
    addText("S.No", col1 + 2, y, { bold: true, size: 10 });
    addText("Description", col2, y, { bold: true, size: 10 });
    addText("Amount (Rs)", col3, y, { bold: true, size: 10, align: "left" });
    y += 5;
    doc.line(margin, y, w - margin, y);
    y += 4;

    utilityRows.forEach((it, i) => {
      ensureSpace(8);
      addText(String(i + 1), col1 + 2, y);
      addText(it.description, col2, y, { maxWidth: col3 - col2 - 4 });
      addText(it.amount.toLocaleString("en-IN"), col3, y);
      y += 6;
      doc.setDrawColor(220);
      doc.line(margin, y - 2, w - margin, y - 2);
    });

    // Total row
    ensureSpace(8);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 4, tableWidth, 7, "F");
    addText("Total Tariff Amount", col2, y, { bold: true });
    addText(`Rs. ${tariffTotal.toLocaleString("en-IN")}`, col3, y, { bold: true });
    y += 8;
  }

  y += 4;

  // Section D — Advance Payments
  ensureSpace(40);
  addText("Section D — Advance Payments", margin, y, { size: 11, bold: true });
  y += 7;

  const advanceRows = extras.advances.length > 0
    ? extras.advances
    : (Number(booking.advancePayment || 0) > 0 ? [{ date: booking.bookingDate, amount: Number(booking.advancePayment), note: "" }] : []);

  if (advanceRows.length === 0) {
    addText("No advance payments recorded.", margin, y);
    y += 6;
  } else {
    const col1 = margin;
    const col2 = margin + 15;
    const col3 = margin + 55;
    const col4 = w - margin - 40;
    const tableWidth = w - 2 * margin;

    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y - 4, tableWidth, 7, "F");
    addText("S.No", col1 + 2, y, { bold: true, size: 10 });
    addText("Date", col2, y, { bold: true, size: 10 });
    addText("Note", col3, y, { bold: true, size: 10 });
    addText("Amount (Rs)", col4, y, { bold: true, size: 10 });
    y += 5;
    doc.line(margin, y, w - margin, y);
    y += 4;

    advanceRows.forEach((it, i) => {
      ensureSpace(8);
      addText(String(i + 1), col1 + 2, y);
      addText(it.date ? format(new Date(it.date), "dd/MM/yyyy") : "-", col2, y);
      addText(it.note || "-", col3, y, { maxWidth: col4 - col3 - 4 });
      addText(Number(it.amount).toLocaleString("en-IN"), col4, y);
      y += 6;
      doc.setDrawColor(220);
      doc.line(margin, y - 2, w - margin, y - 2);
    });

    ensureSpace(8);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 4, tableWidth, 7, "F");
    addText("Total Advance Paid", col3, y, { bold: true });
    addText(`Rs. ${advanceTotal.toLocaleString("en-IN")}`, col4, y, { bold: true });
    y += 8;
  }

  y += 2;
  ensureSpace(20);
  doc.setDrawColor(0);
  doc.line(margin, y, w - margin, y);
  y += 6;
  addText("Tariff Amount:", margin, y, { bold: true });
  addText(`Rs. ${tariffTotal.toLocaleString("en-IN")}`, w - margin, y, { align: "right" });
  y += 6;
  addText("Total Advance Paid:", margin, y, { bold: true });
  addText(`Rs. ${advanceTotal.toLocaleString("en-IN")}`, w - margin, y, { align: "right" });
  y += 6;
  addText("Balance Amount:", margin, y, { bold: true, size: 11 });
  addText(`Rs. ${balance.toLocaleString("en-IN")}`, w - margin, y, { align: "right", bold: true, size: 11 });
  y += 8;

  // Page 2 - Terms
  doc.addPage();
  y = 15;
  addText("Terms & Conditions", margin, y, { size: 12, bold: true });
  y += 8;

  const terms = [
    "The hall is allotted only for the purpose mentioned in the application.",
    "The applicant shall not sub-let the hall to any other person.",
    "The applicant is responsible for any damage caused to the property.",
    "Decoration items must be removed within 4 hours after the event.",
    "No crackers or fireworks are allowed inside the premises.",
    "Alcohol and non-vegetarian food are strictly prohibited.",
    "Music/DJ must be stopped by 10:00 PM as per local regulations.",
    "The management is not responsible for any theft or loss of valuables.",
    "The applicant must ensure cleanliness of the hall after the event.",
    "Parking is at the owner's risk. Management not responsible for vehicles.",
    "The hall must be vacated within the allotted time period.",
    "Extra hours will be charged as per the prevailing rates.",
    "The advance amount is non-refundable in case of cancellation.",
    "The management reserves the right to cancel the booking with prior notice.",
    "Electricity charges for extra equipment will be borne by the applicant.",
    "The applicant must follow all government guidelines and regulations.",
    "Children must be supervised by parents/guardians at all times.",
    "The management is not liable for any accidents within the premises.",
    "The applicant agrees to indemnify the trust against all claims.",
    "All disputes are subject to Chennai jurisdiction only.",
  ];

  terms.forEach((term, i) => {
    const h = addText(`${i + 1}. ${term}`, margin, y, { maxWidth: w - 2 * margin });
    y += Math.max(6, h + 2);
    if (y > 270) { doc.addPage(); y = 15; }
  });

  // Page 3 - Confirmation
  doc.addPage();
  y = 15;
  addText("CONFIRMATION LETTER", w / 2, y, { size: 12, bold: true, align: "center" });
  y += 10;

  addText(`Function Name: ${booking.functionName}`, margin, y, { bold: true });
  y += 8;

  addText("I hereby confirm that:", margin, y);
  y += 7;

  const confirmations = [
    "I have read and understood all the terms and conditions mentioned above.",
    "I agree to abide by all the rules and regulations of the trust.",
    "I confirm that all information provided in this form is true and correct.",
    "I understand that the advance amount is non-refundable.",
    "I agree to the COVID-19 safety protocols and guidelines.",
  ];

  confirmations.forEach((c, i) => {
    addText(`${i + 1}. ${c}`, margin + 5, y, { maxWidth: w - 2 * margin - 10 });
    y += 7;
  });

  y += 10;
  addText("Signature: " + booking.signature, margin, y);
  y += 8;
  addText(`Date: ${format(new Date(booking.bookingDate), "dd/MM/yyyy")}`, margin, y);

  doc.save(`Booking_${booking.id}.pdf`);
}
