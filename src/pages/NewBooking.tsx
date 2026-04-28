import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { saveBooking, generateBookingId, type Booking } from "@/lib/bookingStore";
import { generateBookingPDF } from "@/lib/pdfGenerator";
import { toast } from "sonner";

const proofIdTypes = ["Aadhaar", "PAN", "Driving License"] as const;
const functionTypes = ["Marriage", "Reception", "Other"];
const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  const value = `${hour.toString().padStart(2, "0")}:${minute}`;
  const displayHour = hour % 12 || 12;
  const period = hour < 12 ? "AM" : "PM";
  return { value, label: `${displayHour}:${minute} ${period}` };
});

function validatePhone(phone: string) { return /^\d{10}$/.test(phone.replace(/\s/g, "")); }
function validateProofId(type: string, value: string) {
  if (type === "Aadhaar") return /^\d{12}$/.test(value);
  if (type === "PAN") return /^[A-Z]{5}\d{4}[A-Z]$/.test(value.toUpperCase());
  if (type === "Driving License") return /^[A-Za-z0-9]{1,16}$/.test(value);
  return false;
}
function getProofIdPlaceholder(type: string) {
  if (type === "Aadhaar") return "Enter 12-digit Aadhaar number";
  if (type === "PAN") return "Enter PAN (e.g., AAAAA9999A)";
  if (type === "Driving License") return "Enter Driving License number";
  return "Select ID type first";
}
function combineDateTime(date: string, time: string) { return date && time ? `${date}T${time}` : ""; }

export default function NewBooking() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", address: "", occupation: "", phone: "", alternatePhone: "",
    proofIdType: "" as string, proofIdNumber: "", advancePayment: "", tariffAmount: "",
    functionType: "", purposeDescription: "",
    fromDate: "", fromTime: "", toDate: "", toTime: "", allottedSlot: "" as string, hallType: "" as string,
    utilityCharges: "", receiptNumber: "", bookingDate: "",
    termsAccepted: false, signature: "", functionName: "",
  });

  const set = (key: string, value: string | boolean, errorKeys: string[] = [key]) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; errorKeys.forEach(k => delete n[k]); return n; });
  };

  const validate = () => {
    const fromDateTime = combineDateTime(form.fromDate, form.fromTime);
    const toDateTime = combineDateTime(form.toDate, form.toTime);
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.occupation.trim()) e.occupation = "Required";
    if (!validatePhone(form.phone)) e.phone = "Valid 10-digit number required";
    if (form.alternatePhone && !validatePhone(form.alternatePhone)) e.alternatePhone = "Valid 10-digit number required";
    if (!form.proofIdType) e.proofIdType = "Required";
    if (!form.proofIdNumber) e.proofIdNumber = "Required";
    else if (form.proofIdType && !validateProofId(form.proofIdType, form.proofIdNumber)) e.proofIdNumber = `Invalid ${form.proofIdType} format`;
    if (!form.functionType) e.functionType = "Required";
    if (!fromDateTime) e.fromDateTime = "Required";
    if (!toDateTime) e.toDateTime = "Required";
    if (fromDateTime && toDateTime && new Date(fromDateTime) >= new Date(toDateTime)) e.toDateTime = "Must be after From date";
    if (!form.allottedSlot) e.allottedSlot = "Required";
    if (!form.hallType) e.hallType = "Required";
    if (!form.utilityCharges || Number(form.utilityCharges) <= 0) e.utilityCharges = "Required";
    if (!form.receiptNumber.trim()) e.receiptNumber = "Required";
    if (!form.bookingDate) e.bookingDate = "Required";
    if (!form.termsAccepted) e.termsAccepted = "You must accept the terms";
    if (!form.signature.trim()) e.signature = "Required";
    if (!form.functionName.trim()) e.functionName = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { toast.error("Please fix the errors in the form"); return; }
    setSubmitting(true);
    try {
      const fromDateTime = combineDateTime(form.fromDate, form.fromTime);
      const toDateTime = combineDateTime(form.toDate, form.toTime);
      const booking: Booking = {
        id: generateBookingId(),
        name: form.name, address: form.address, occupation: form.occupation,
        phone: form.phone, alternatePhone: form.alternatePhone || undefined,
        proofIdType: form.proofIdType as Booking["proofIdType"],
        proofIdNumber: form.proofIdNumber,
        advancePayment: form.advancePayment ? Number(form.advancePayment) : undefined,
        tariffAmount: form.tariffAmount ? Number(form.tariffAmount) : undefined,
        functionType: form.functionType,
        purposeDescription: form.purposeDescription || undefined,
        fromDateTime, toDateTime,
        allottedSlot: form.allottedSlot as Booking["allottedSlot"],
        hallType: form.hallType as Booking["hallType"],
        utilityCharges: Number(form.utilityCharges),
        receiptNumber: form.receiptNumber,
        bookingDate: form.bookingDate,
        termsAccepted: form.termsAccepted,
        signature: form.signature,
        functionName: form.functionName,
        createdAt: new Date().toISOString(),
      };
      const result = await saveBooking(booking);
      if (!result.success) {
        toast.error(`Booking conflict with ${result.conflict?.name} (${result.conflict?.id}) on the same hall and overlapping time.`);
        return;
      }
      toast.success("Booking saved successfully!");
      generateBookingPDF(booking);
      navigate("/booking/manage");
    } catch (err: any) {
      toast.error(err.message || "Failed to save booking");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (label: string, field: string, type = "text", required = true, placeholder = "") => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label} {required && <span className="text-destructive">*</span>}</Label>
      {type === "textarea" ? (
        <Textarea value={(form as any)[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder} className={errors[field] ? "border-destructive" : ""} />
      ) : (
        <Input type={type} value={(form as any)[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder} className={errors[field] ? "border-destructive" : ""} />
      )}
      {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
    </div>
  );

  const renderDateTimeField = (label: string, dateField: "fromDate" | "toDate", timeField: "fromTime" | "toTime", errorField: "fromDateTime" | "toDateTime") => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label} <span className="text-destructive">*</span></Label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_148px]">
        <Input aria-label={`${label} date`} type="date" value={form[dateField]} onChange={e => set(dateField, e.target.value, [errorField])} className={errors[errorField] ? "border-destructive" : ""} />
        <Select value={form[timeField]} onValueChange={v => set(timeField, v, [errorField])}>
          <SelectTrigger aria-label={`${label} time`} className={errors[errorField] ? "border-destructive" : ""}><SelectValue placeholder="Select time" /></SelectTrigger>
          <SelectContent className="max-h-72">{timeOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {errors[errorField] && <p className="text-xs text-destructive">{errors[errorField]}</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">New Booking</h2>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Section A — Applicant Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField("Name", "name", "text", true, "Full name")}
          {renderField("Occupation", "occupation", "text", true, "Occupation")}
          <div className="md:col-span-2">{renderField("Address", "address", "textarea", true, "Full address")}</div>
          {renderField("Phone / Mobile", "phone", "text", true, "10-digit number")}
          {renderField("Alternate Phone", "alternatePhone", "text", false, "Optional")}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Proof ID Type <span className="text-destructive">*</span></Label>
            <Select value={form.proofIdType} onValueChange={v => { set("proofIdType", v); set("proofIdNumber", ""); }}>
              <SelectTrigger className={errors.proofIdType ? "border-destructive" : ""}><SelectValue placeholder="Select ID type" /></SelectTrigger>
              <SelectContent>{proofIdTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            {errors.proofIdType && <p className="text-xs text-destructive">{errors.proofIdType}</p>}
          </div>
          {renderField(form.proofIdType ? `${form.proofIdType} Number` : "Proof ID Number", "proofIdNumber", "text", true, getProofIdPlaceholder(form.proofIdType))}
          {renderField("Tariff Amount (Rs)", "tariffAmount", "number", false, "Optional")}
          {renderField("Advance Payment (Rs)", "advancePayment", "number", false, "Optional")}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Section B — Booking Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Function Type <span className="text-destructive">*</span></Label>
            <Select value={form.functionType} onValueChange={v => set("functionType", v)}>
              <SelectTrigger className={errors.functionType ? "border-destructive" : ""}><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{functionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            {errors.functionType && <p className="text-xs text-destructive">{errors.functionType}</p>}
          </div>
          {renderField("Function Name", "functionName", "text", true, "e.g., Kumar Wedding")}
          <div className="md:col-span-2">{renderField("Purpose Description", "purposeDescription", "textarea", false, "Optional description")}</div>
          {renderDateTimeField("From Date & Time", "fromDate", "fromTime", "fromDateTime")}
          {renderDateTimeField("To Date & Time", "toDate", "toTime", "toDateTime")}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Allotted Slot <span className="text-destructive">*</span></Label>
            <div className="flex gap-4 pt-1">
              {["AM", "PM"].map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="slot" checked={form.allottedSlot === s} onChange={() => set("allottedSlot", s)} className="accent-primary" /><span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
            {errors.allottedSlot && <p className="text-xs text-destructive">{errors.allottedSlot}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Hall Type <span className="text-destructive">*</span></Label>
            <div className="flex gap-4 pt-1">
              {["Single", "Double"].map(h => (
                <label key={h} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="hall" checked={form.hallType === h} onChange={() => set("hallType", h)} className="accent-primary" /><span className="text-sm">{h}</span>
                </label>
              ))}
            </div>
            {errors.hallType && <p className="text-xs text-destructive">{errors.hallType}</p>}
          </div>
          {renderField("Utility Charges (Rs)", "utilityCharges", "number", true, "Amount")}
          {renderField("Receipt Number", "receiptNumber", "text", true, "Receipt #")}
          {renderField("Booking Date", "bookingDate", "date")}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Section C — Declaration & Agreement</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto text-xs space-y-1.5 text-muted-foreground">
            {["The hall is allotted only for the purpose mentioned in the application.", "The applicant shall not sub-let the hall to any other person.", "The applicant is responsible for any damage caused to the property.", "Decoration items must be removed within 4 hours after the event.", "No crackers or fireworks are allowed inside the premises.", "Alcohol and non-vegetarian food are strictly prohibited.", "Music/DJ must be stopped by 10:00 PM as per local regulations.", "The management is not responsible for any theft or loss of valuables.", "The applicant must ensure cleanliness of the hall after the event.", "Parking is at the owner's risk.", "The hall must be vacated within the allotted time period.", "Extra hours will be charged as per prevailing rates.", "The advance amount is non-refundable in case of cancellation.", "The management reserves the right to cancel with prior notice.", "Electricity charges for extra equipment will be borne by the applicant.", "The applicant must follow all government guidelines.", "Children must be supervised by parents/guardians at all times.", "The management is not liable for any accidents.", "The applicant agrees to indemnify the trust against all claims.", "All disputes are subject to Chennai jurisdiction only."].map((t, i) => <p key={i}>{i + 1}. {t}</p>)}
          </div>
          <div className="flex items-start gap-2">
            <Checkbox checked={form.termsAccepted} onCheckedChange={v => set("termsAccepted", !!v)} id="terms" className={errors.termsAccepted ? "border-destructive" : ""} />
            <Label htmlFor="terms" className="text-sm cursor-pointer">I accept the Terms & Conditions</Label>
          </div>
          {errors.termsAccepted && <p className="text-xs text-destructive">{errors.termsAccepted}</p>}
          {renderField("Digital Signature (Type your name)", "signature", "text", true, "Your full name as signature")}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/booking/dashboard")}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Saving..." : "Submit Booking & Download PDF"}</Button>
      </div>
    </div>
  );
}
