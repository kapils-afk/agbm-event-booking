import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getBookings, updateBooking, type Booking } from "@/lib/bookingStore";
import { generateBookingPDF } from "@/lib/pdfGenerator";
import { toast } from "sonner";

const proofIdTypes = ["Aadhaar", "PAN", "Driving License"] as const;
const functionTypes = ["Marriage", "Reception", "Other"];

function validatePhone(phone: string) { return /^\d{10}$/.test(phone.replace(/\s/g, "")); }
function validateProofId(type: string, value: string) {
  if (type === "Aadhaar") return /^\d{12}$/.test(value);
  if (type === "PAN") return /^[A-Z]{5}\d{4}[A-Z]$/.test(value.toUpperCase());
  if (type === "Driving License") return /^[A-Za-z0-9]{1,16}$/.test(value);
  return false;
}

export default function BookingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    const booking = getBookings().find((b) => b.id === id);
    if (!booking) { toast.error("Booking not found"); navigate("/bookings"); return; }
    setForm({
      ...booking,
      advancePayment: booking.advancePayment?.toString() || "",
      utilityCharges: booking.utilityCharges.toString(),
    });
  }, [id]);

  if (!form) return null;

  const set = (key: string, value: string | boolean) => {
    setForm((p: any) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.occupation.trim()) e.occupation = "Required";
    if (!validatePhone(form.phone)) e.phone = "Valid 10-digit number required";
    if (form.alternatePhone && !validatePhone(form.alternatePhone)) e.alternatePhone = "Invalid";
    if (!form.proofIdType) e.proofIdType = "Required";
    if (!form.proofIdNumber) e.proofIdNumber = "Required";
    else if (form.proofIdType && !validateProofId(form.proofIdType, form.proofIdNumber)) e.proofIdNumber = `Invalid ${form.proofIdType} format`;
    if (!form.functionType) e.functionType = "Required";
    if (!form.fromDateTime) e.fromDateTime = "Required";
    if (!form.toDateTime) e.toDateTime = "Required";
    if (form.fromDateTime && form.toDateTime && new Date(form.fromDateTime) >= new Date(form.toDateTime)) e.toDateTime = "Must be after From date";
    if (!form.allottedSlot) e.allottedSlot = "Required";
    if (!form.hallType) e.hallType = "Required";
    if (!form.utilityCharges || Number(form.utilityCharges) <= 0) e.utilityCharges = "Required";
    if (!form.receiptNumber.trim()) e.receiptNumber = "Required";
    if (!form.bookingDate) e.bookingDate = "Required";
    if (!form.termsAccepted) e.termsAccepted = "Required";
    if (!form.signature.trim()) e.signature = "Required";
    if (!form.functionName.trim()) e.functionName = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) { toast.error("Please fix the errors"); return; }
    const booking: Booking = {
      ...form,
      advancePayment: form.advancePayment ? Number(form.advancePayment) : undefined,
      utilityCharges: Number(form.utilityCharges),
    };
    const result = updateBooking(booking);
    if (!result.success) {
      toast.error(`Conflict with ${result.conflict?.name} (${result.conflict?.id})`);
      return;
    }
    toast.success("Booking updated");
    navigate("/bookings");
  };

  const handleDownloadPDF = () => {
    const booking: Booking = {
      ...form,
      advancePayment: form.advancePayment ? Number(form.advancePayment) : undefined,
      utilityCharges: Number(form.utilityCharges),
    };
    generateBookingPDF(booking);
  };

  const Field = ({ label, field, type = "text", required = true, placeholder = "", children }: any) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label} {required && <span className="text-destructive">*</span>}</Label>
      {children || (
        type === "textarea" ? (
          <Textarea value={form[field] || ""} onChange={(e) => set(field, e.target.value)} placeholder={placeholder} className={errors[field] ? "border-destructive" : ""} />
        ) : (
          <Input type={type} value={form[field] || ""} onChange={(e) => set(field, e.target.value)} placeholder={placeholder} className={errors[field] ? "border-destructive" : ""} />
        )
      )}
      {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Edit Booking — {form.id}</h2>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Applicant Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name" field="name" />
          <Field label="Occupation" field="occupation" />
          <div className="md:col-span-2"><Field label="Address" field="address" type="textarea" /></div>
          <Field label="Phone" field="phone" />
          <Field label="Alternate Phone" field="alternatePhone" required={false} />
          <Field label="Proof ID Type" field="proofIdType">
            <Select value={form.proofIdType} onValueChange={(v) => { set("proofIdType", v); set("proofIdNumber", ""); }}>
              <SelectTrigger className={errors.proofIdType ? "border-destructive" : ""}><SelectValue /></SelectTrigger>
              <SelectContent>{proofIdTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={`${form.proofIdType || "Proof ID"} Number`} field="proofIdNumber" />
          <Field label="Advance Payment (Rs)" field="advancePayment" type="number" required={false} />
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Booking Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Function Type" field="functionType">
            <Select value={form.functionType} onValueChange={(v) => set("functionType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{functionTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Function Name" field="functionName" />
          <div className="md:col-span-2"><Field label="Purpose" field="purposeDescription" type="textarea" required={false} /></div>
          <Field label="From Date & Time" field="fromDateTime" type="datetime-local" />
          <Field label="To Date & Time" field="toDateTime" type="datetime-local" />
          <Field label="Allotted Slot" field="allottedSlot">
            <div className="flex gap-4 pt-1">
              {["AM", "PM"].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="slot" checked={form.allottedSlot === s} onChange={() => set("allottedSlot", s)} className="accent-primary" /><span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Hall Type" field="hallType">
            <div className="flex gap-4 pt-1">
              {["Single", "Double"].map((h) => (
                <label key={h} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="hall" checked={form.hallType === h} onChange={() => set("hallType", h)} className="accent-primary" /><span className="text-sm">{h}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Utility Charges (Rs)" field="utilityCharges" type="number" />
          <Field label="Receipt Number" field="receiptNumber" />
          <Field label="Booking Date" field="bookingDate" type="date" />
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Declaration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2">
            <Checkbox checked={form.termsAccepted} onCheckedChange={(v) => set("termsAccepted", !!v)} id="terms" />
            <Label htmlFor="terms" className="text-sm cursor-pointer">I accept the Terms & Conditions</Label>
          </div>
          <Field label="Digital Signature" field="signature" />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/bookings")}>Cancel</Button>
        <Button variant="outline" onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
