import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { loadBookings, updateBooking, type Booking } from "@/lib/bookingStore";
import { generateBookingPDF } from "@/lib/pdfGenerator";
import { encodeExtras, decodeExtras, stripExtras, sumUtilities, sumAdvances, type UtilityItem, type AdvanceItem } from "@/lib/bookingExtras";
import { UtilityChargesEditor, AdvancePaymentsEditor } from "@/components/booking/ChargesEditors";
import { toast } from "sonner";

const proofIdTypes = ["Aadhaar", "PAN", "Driving License"] as const;
type ProofType = typeof proofIdTypes[number];
const hallOptions = ["Mini Hall", "Convention Hall", "Rooms", "Dining Hall"] as const;
type HallOption = typeof hallOptions[number];
const MAX_REGULAR_ROOMS = 14;
const MAX_DELUXE_ROOMS = 2;

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
  return "";
}
function combineDateTime(date: string, time: string) { return date && time ? `${date}T${time}` : ""; }
function splitDateTime(dt: string): { date: string; time: string } {
  if (!dt) return { date: "", time: "" };
  const [date, timeFull = ""] = dt.split("T");
  const time = timeFull.slice(0, 5);
  return { date: date || "", time };
}

function parseProof(typeStr: string, numberStr: string): { types: ProofType[]; values: Record<ProofType, string> } {
  const values: Record<ProofType, string> = { Aadhaar: "", PAN: "", "Driving License": "" };
  const types = (typeStr || "")
    .split(",")
    .map(s => s.trim())
    .filter((t): t is ProofType => (proofIdTypes as readonly string[]).includes(t));

  // Parse "Aadhaar: xxx | PAN: yyy" format; fallback to single value
  if (numberStr.includes(":")) {
    numberStr.split("|").forEach(part => {
      const [k, ...rest] = part.split(":");
      const key = k.trim() as ProofType;
      if ((proofIdTypes as readonly string[]).includes(key)) {
        values[key] = rest.join(":").trim();
      }
    });
  } else if (types.length === 1) {
    values[types[0]] = numberStr;
  }
  return { types, values };
}

function parseHalls(hallStr: string): HallOption[] {
  return (hallStr || "")
    .split(",")
    .map(s => s.trim())
    .filter((h): h is HallOption => (hallOptions as readonly string[]).includes(h));
}

export default function BookingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [proofTypes, setProofTypes] = useState<ProofType[]>([]);
  const [proofValues, setProofValues] = useState<Record<ProofType, string>>({ Aadhaar: "", PAN: "", "Driving License": "" });
  const [halls, setHalls] = useState<HallOption[]>([]);
  const [regularRooms, setRegularRooms] = useState("");
  const [deluxeRooms, setDeluxeRooms] = useState("");
  const [utilityItems, setUtilityItems] = useState<UtilityItem[]>([]);
  const [advanceItems, setAdvanceItems] = useState<AdvanceItem[]>([]);

  const [form, setForm] = useState({
    name: "", address: "", occupation: "", phone: "", alternatePhone: "",
    functionType: "", purposeDescription: "",
    fromDate: "", fromTime: "", toDate: "", toTime: "", allottedSlot: "" as string,
    receiptNumber: "", bookingDate: "",
    termsAccepted: false, signature: "", functionName: "",
  });

  const tariffAmount = sumUtilities(utilityItems);
  const totalAdvance = sumAdvances(advanceItems);

  useEffect(() => {
    loadBookings().then(bookings => {
      const booking = bookings.find(b => b.id === id);
      if (!booking) { toast.error("Booking not found"); navigate("/booking/manage"); return; }

      const { date: fromDate, time: fromTime } = splitDateTime(booking.fromDateTime);
      const { date: toDate, time: toTime } = splitDateTime(booking.toDateTime);
      const { types, values } = parseProof(booking.proofIdType, booking.proofIdNumber);
      const parsedHalls = parseHalls(booking.hallType);

      setProofTypes(types);
      setProofValues(values);
      setHalls(parsedHalls);
      setRegularRooms(booking.regularRooms ? String(booking.regularRooms) : "");
      setDeluxeRooms(booking.deluxeRooms ? String(booking.deluxeRooms) : "");

      // Hydrate dynamic charges/advances from purposeDescription marker, or fall back to legacy scalars
      const extras = decodeExtras(booking.purposeDescription);
      const cleanPurpose = stripExtras(booking.purposeDescription || "");
      if (extras.utilities.length > 0) {
        setUtilityItems(extras.utilities);
      } else if (Number(booking.utilityCharges) > 0) {
        setUtilityItems([{ description: "Utility Charges", amount: Number(booking.utilityCharges) }]);
      }
      if (extras.advances.length > 0) {
        setAdvanceItems(extras.advances);
      } else if (booking.advancePayment && Number(booking.advancePayment) > 0) {
        setAdvanceItems([{ date: booking.bookingDate || new Date().toISOString().slice(0, 10), amount: Number(booking.advancePayment), note: "" }]);
      }

      setForm({
        name: booking.name,
        address: booking.address,
        occupation: booking.occupation,
        phone: booking.phone,
        alternatePhone: booking.alternatePhone || "",
        functionType: booking.functionType,
        purposeDescription: cleanPurpose,
        fromDate, fromTime, toDate, toTime,
        allottedSlot: booking.allottedSlot,
        receiptNumber: booking.receiptNumber,
        bookingDate: booking.bookingDate,
        termsAccepted: booking.termsAccepted,
        signature: booking.signature,
        functionName: booking.functionName,
      });
      setLoaded(true);
    }).catch(() => { toast.error("Failed to load booking"); navigate("/booking/manage"); });
  }, [id]);

  const set = (key: string, value: string | boolean, errorKeys: string[] = [key]) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; errorKeys.forEach(k => delete n[k]); return n; });
  };

  const toggleProof = (t: ProofType) => {
    setProofTypes(prev => prev.includes(t) ? prev.filter(p => p !== t) : [...prev, t]);
    setErrors(p => { const n = { ...p }; delete n.proofIdType; delete n[`proof_${t}`]; return n; });
  };
  const toggleHall = (h: HallOption) => {
    setHalls(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);
    setErrors(p => { const n = { ...p }; delete n.hallType; return n; });
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
    if (proofTypes.length === 0) e.proofIdType = "Select at least one";
    proofTypes.forEach(t => {
      const v = proofValues[t];
      if (!v) e[`proof_${t}`] = "Required";
      else if (!validateProofId(t, v)) e[`proof_${t}`] = `Invalid ${t} format`;
    });
    if (!form.functionType) e.functionType = "Required";
    if (!fromDateTime) e.fromDateTime = "Required";
    if (!toDateTime) e.toDateTime = "Required";
    if (fromDateTime && toDateTime && new Date(fromDateTime) >= new Date(toDateTime)) e.toDateTime = "Must be after From date";
    if (!form.allottedSlot) e.allottedSlot = "Required";
    if (halls.length === 0) e.hallType = "Select at least one";
    if (halls.includes("Rooms")) {
      const reg = Number(regularRooms || 0);
      const dlx = Number(deluxeRooms || 0);
      if (reg + dlx <= 0) e.rooms = "Enter at least one room";
      if (reg < 0 || reg > MAX_REGULAR_ROOMS) e.rooms = `Regular rooms 0-${MAX_REGULAR_ROOMS}`;
      if (dlx < 0 || dlx > MAX_DELUXE_ROOMS) e.rooms = `Deluxe rooms 0-${MAX_DELUXE_ROOMS}`;
    }
    if (utilityItems.length === 0) e.utilityCharges = "Add at least one charge";
    else if (utilityItems.some(u => !u.description.trim())) e.utilityCharges = "Each charge needs a description";
    else if (tariffAmount <= 0) e.utilityCharges = "Total tariff must be greater than 0";
    if (!form.receiptNumber.trim()) e.receiptNumber = "Required";
    if (!form.bookingDate) e.bookingDate = "Required";
    if (!form.termsAccepted) e.termsAccepted = "You must accept the terms";
    if (!form.signature.trim()) e.signature = "Required";
    if (!form.functionName.trim()) e.functionName = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildBooking = (): Booking => {
    const fromDateTime = combineDateTime(form.fromDate, form.fromTime);
    const toDateTime = combineDateTime(form.toDate, form.toTime);
    const proofIdType = proofTypes.join(", ");
    const proofIdNumber = proofTypes.map(t => `${t}: ${proofValues[t]}`).join(" | ");
    const hallType = halls.join(", ");
    let purpose = form.purposeDescription || "";
    if (halls.includes("Rooms")) {
      const parts: string[] = [];
      if (Number(regularRooms) > 0) parts.push(`Regular AC Rooms: ${regularRooms}`);
      if (Number(deluxeRooms) > 0) parts.push(`Deluxe AC Rooms: ${deluxeRooms}`);
      // Strip prior auto-appended room line if present
      purpose = purpose.replace(/\n?(Regular AC Rooms:[^\n]*|Deluxe AC Rooms:[^\n]*)/g, "").trim();
      if (parts.length) purpose = `${purpose ? purpose + "\n" : ""}${parts.join(", ")}`;
    }
    purpose = encodeExtras(purpose, { utilities: utilityItems, advances: advanceItems });
    return {
      id: id!,
      name: form.name, address: form.address, occupation: form.occupation,
      phone: form.phone, alternatePhone: form.alternatePhone || undefined,
      proofIdType, proofIdNumber,
      advancePayment: totalAdvance > 0 ? totalAdvance : undefined,
      tariffAmount: tariffAmount > 0 ? tariffAmount : undefined,
      functionType: form.functionType,
      purposeDescription: purpose || undefined,
      fromDateTime, toDateTime,
      allottedSlot: form.allottedSlot as Booking["allottedSlot"],
      hallType,
      regularRooms: halls.includes("Rooms") && Number(regularRooms) > 0 ? Number(regularRooms) : undefined,
      deluxeRooms: halls.includes("Rooms") && Number(deluxeRooms) > 0 ? Number(deluxeRooms) : undefined,
      utilityCharges: tariffAmount,
      receiptNumber: form.receiptNumber,
      bookingDate: form.bookingDate,
      termsAccepted: form.termsAccepted,
      signature: form.signature,
      functionName: form.functionName,
      createdAt: new Date().toISOString(),
    };
  };

  const handleSave = async () => {
    if (!validate()) { toast.error("Please fix the errors in the form"); return; }
    setSubmitting(true);
    try {
      const result = await updateBooking(buildBooking());
      if (!result.success) {
        toast.error(`Conflict with ${result.conflict?.name} (${result.conflict?.id})`);
        return;
      }
      toast.success("Booking updated");
      navigate("/booking/manage");
    } catch (err: any) {
      toast.error(err.message || "Failed to update booking");
    } finally { setSubmitting(false); }
  };

  const handleDownloadPDF = () => {
    generateBookingPDF(buildBooking());
  };

  if (!loaded) return null;

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
      <h2 className="text-2xl font-bold">Edit Booking — {id}</h2>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Section A — Applicant Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField("Name", "name", "text", true, "Full name")}
          {renderField("Occupation", "occupation", "text", true, "Occupation")}
          <div className="md:col-span-2">{renderField("Address", "address", "textarea", true, "Full address")}</div>
          {renderField("Phone / Mobile", "phone", "text", true, "10-digit number")}
          {renderField("Alternate Phone", "alternatePhone", "text", false, "Optional")}

          <div className="md:col-span-2 space-y-2">
            <Label className="text-sm font-medium">Proof ID Type <span className="text-destructive">*</span> <span className="text-xs text-muted-foreground font-normal">(select one or more)</span></Label>
            <div className="flex flex-wrap gap-4 pt-1">
              {proofIdTypes.map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={proofTypes.includes(t)} onCheckedChange={() => toggleProof(t)} />
                  <span className="text-sm">{t}</span>
                </label>
              ))}
            </div>
            {errors.proofIdType && <p className="text-xs text-destructive">{errors.proofIdType}</p>}
            {proofTypes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {proofTypes.map(t => (
                  <div key={t} className="space-y-1.5">
                    <Label className="text-xs font-medium">{t} Number <span className="text-destructive">*</span></Label>
                    <Input
                      value={proofValues[t]}
                      onChange={e => {
                        setProofValues(p => ({ ...p, [t]: e.target.value }));
                        setErrors(p => { const n = { ...p }; delete n[`proof_${t}`]; return n; });
                      }}
                      placeholder={getProofIdPlaceholder(t)}
                      className={errors[`proof_${t}`] ? "border-destructive" : ""}
                    />
                    {errors[`proof_${t}`] && <p className="text-xs text-destructive">{errors[`proof_${t}`]}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Section A2 — Charges & Payments</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UtilityChargesEditor items={utilityItems} onChange={setUtilityItems} error={errors.utilityCharges} />
          <AdvancePaymentsEditor items={advanceItems} onChange={setAdvanceItems} tariff={tariffAmount} />
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

          <div className="md:col-span-2 space-y-2">
            <Label className="text-sm font-medium">Hall / Facility <span className="text-destructive">*</span> <span className="text-xs text-muted-foreground font-normal">(select one or more)</span></Label>
            <div className="flex flex-wrap gap-4 pt-1">
              {hallOptions.map(h => (
                <label key={h} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={halls.includes(h)} onCheckedChange={() => toggleHall(h)} />
                  <span className="text-sm">{h}</span>
                </label>
              ))}
            </div>
            {errors.hallType && <p className="text-xs text-destructive">{errors.hallType}</p>}

            {halls.includes("Rooms") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 p-3 rounded-md bg-muted/40">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Regular AC Rooms (max {MAX_REGULAR_ROOMS})</Label>
                  <Input type="number" min={0} max={MAX_REGULAR_ROOMS} value={regularRooms}
                    onChange={e => { setRegularRooms(e.target.value); setErrors(p => { const n = { ...p }; delete n.rooms; return n; }); }}
                    placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Deluxe AC Rooms (max {MAX_DELUXE_ROOMS})</Label>
                  <Input type="number" min={0} max={MAX_DELUXE_ROOMS} value={deluxeRooms}
                    onChange={e => { setDeluxeRooms(e.target.value); setErrors(p => { const n = { ...p }; delete n.rooms; return n; }); }}
                    placeholder="0" />
                </div>
                {errors.rooms && <p className="md:col-span-2 text-xs text-destructive">{errors.rooms}</p>}
              </div>
            )}
          </div>

          
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
        <Button variant="outline" onClick={() => navigate("/booking/manage")}>Cancel</Button>
        <Button variant="outline" onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleSave} disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
      </div>
    </div>
  );
}
