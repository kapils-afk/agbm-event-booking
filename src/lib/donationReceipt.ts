import jsPDF from "jspdf";

const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
}
function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return (h ? ones[h] + " Hundred" + (r ? " and " : "") : "") + (r ? twoDigits(r) : "");
}
export function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const n = Math.floor(num);
  let result = "";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) result += twoDigits(crore) + " Crore ";
  if (lakh) result += twoDigits(lakh) + " Lakh ";
  if (thousand) result += twoDigits(thousand) + " Thousand ";
  if (rest) result += threeDigits(rest);
  return result.trim() + " Only";
}

export interface DonationReceipt {
  receipt_no: string;
  donation_date: string;
  donor_name: string;
  pan?: string | null;
  amount: number;
  amount_in_words?: string | null;
  purpose: string;
  payment_method: string;
  transaction_id?: string | null;
  collected_by?: string | null;
}

export function generateDonationReceiptPDF(d: DonationReceipt): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 36;

  // Header box
  doc.setLineWidth(0.8);
  doc.rect(M, 40, W - 2 * M, 70);

  doc.setTextColor(31, 41, 140);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ADI GOUD BRAHMIN MAHASABHA CHARITABLE TRUST", W / 2, 62, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("(REGD.)", W / 2, 78, { align: "center" });

  doc.setFontSize(9);
  doc.text("417, Vegetarian Village, Puzhal, Chennai, Tamil Nadu 600060", W / 2, 92, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("Ph:", W / 2 - 130, 105);
  doc.setFont("helvetica", "normal");
  doc.text("+91 7603951126, 9444412706", W / 2 - 115, 105);
  doc.setFont("helvetica", "bold");
  doc.text("E-Mail:", W / 2 + 50, 105);
  doc.setFont("helvetica", "normal");
  doc.text("adigoudtrust@gmail.com", W / 2 + 85, 105);

  // Body box
  const bodyTop = 120;
  const bodyHeight = 380;
  doc.rect(M, bodyTop, W - 2 * M, bodyHeight);

  let y = bodyTop + 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`No. ${d.receipt_no}`, M + 12, y);
  const dateStr = new Date(d.donation_date).toLocaleDateString("en-GB").replace(/\//g, ".");
  doc.text(`Date: ${dateStr}`, W - M - 12, y, { align: "right" });

  // Received from
  y += 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Received with thanks from Sri / Smt / M/s.", M + 12, y);
  doc.setFont("helvetica", "bold");
  doc.text(d.donor_name, M + 220, y);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(M + 12, y + 6, W - M - 12, y + 6);

  // PAN
  y += 28;
  doc.setFont("helvetica", "normal");
  doc.text("PAN", M + 12, y);
  doc.setFont("helvetica", "bold");
  doc.text(d.pan || "—", M + 80, y);
  doc.line(M + 12, y + 6, W - M - 12, y + 6);

  // Amount in words
  y += 28;
  doc.setFont("helvetica", "normal");
  doc.text("a sum of Rupees", M + 12, y);
  doc.setFont("helvetica", "bold");
  const words = d.amount_in_words || numberToWords(d.amount);
  doc.text(words, M + 110, y);
  doc.line(M + 12, y + 6, W - M - 12, y + 6);

  // Amount figure
  y += 28;
  doc.setFont("helvetica", "normal");
  doc.text(`( Rupees  Rs ${d.amount.toLocaleString("en-IN")} )`, M + 12, y);
  doc.line(M + 12, y + 6, W - M - 12, y + 6);
  doc.setLineDashPattern([], 0);

  // Purpose
  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("as MEMBERSHIP FEE / SUBSCRIPTION / DONATION / CORPUS FUND", M + 12, y);

  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Selected: ${d.purpose}`, M + 12, y);

  y += 22;
  doc.text(`by ${d.payment_method}${d.transaction_id ? ` (Txn: ${d.transaction_id})` : ""}`, M + 12, y);

  if (d.collected_by) {
    y += 22;
    doc.text(`Collected by: ${d.collected_by}`, M + 12, y);
  }

  // Footer 80G note inside body
  doc.setFontSize(9);
  doc.text("Donations are exempted under Sec. 80G of Income Tax Act, 1961",
    M + 12, bodyTop + bodyHeight - 32);
  doc.text("vide Memo No. URNO. AAFTA0542E/05/16-17/T-0863/80G dt. 12.12.2018",
    M + 12, bodyTop + bodyHeight - 18);

  return doc;
}
