import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, HeartHandshake } from "lucide-react";
import { numberToWords } from "@/lib/donationReceipt";

const PURPOSES = ["Membership Fee", "Subscription", "Donation", "Corpus Fund"];
const METHODS = ["Cash", "Cheque", "NEFT", "RTGS", "UPI"];

async function nextReceiptNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `AGBM/${year}/`;
  const { data } = await supabase.from("donations").select("receipt_no")
    .ilike("receipt_no", `${prefix}%`).order("receipt_no", { ascending: false }).limit(1);
  let next = 1;
  if (data && data.length) {
    const last = data[0].receipt_no.split("/").pop();
    next = (parseInt(last || "0") || 0) + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export default function AdminTrustEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    receipt_no: "",
    donation_date: new Date().toISOString().slice(0, 10),
    donor_name: "",
    mobile: "",
    pan: "",
    amount: "",
    amount_in_words: "",
    payment_method: "Cash",
    transaction_id: "",
    purpose: "Donation",
    collected_by: "",
    notes: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("admin_session")) { navigate("/admin/login"); return; }
    if (id) {
      supabase.from("donations").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({
          receipt_no: data.receipt_no, donation_date: data.donation_date,
          donor_name: data.donor_name, mobile: data.mobile || "", pan: data.pan || "",
          amount: String(data.amount), amount_in_words: data.amount_in_words || "",
          payment_method: data.payment_method, transaction_id: data.transaction_id || "",
          purpose: data.purpose, collected_by: data.collected_by || "", notes: data.notes || "",
        });
      });
    } else {
      nextReceiptNo().then(no => setForm(f => ({ ...f, receipt_no: no })));
    }
  }, [id]);

  const update = (k: string, v: string) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === "amount") {
        const n = parseFloat(v);
        if (!isNaN(n) && n > 0) next.amount_in_words = numberToWords(n);
      }
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.donor_name || !form.amount || !form.receipt_no) {
      toast({ title: "Missing fields", description: "Name, receipt no. and amount are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        receipt_no: form.receipt_no,
        donation_date: form.donation_date,
        donor_name: form.donor_name,
        mobile: form.mobile || null,
        pan: form.pan ? form.pan.toUpperCase() : null,
        amount: parseFloat(form.amount),
        amount_in_words: form.amount_in_words || numberToWords(parseFloat(form.amount)),
        payment_method: form.payment_method,
        transaction_id: form.transaction_id || null,
        purpose: form.purpose,
        collected_by: form.collected_by || null,
        notes: form.notes || null,
      };
      if (id) await supabase.from("donations").update(payload).eq("id", id);
      else await supabase.from("donations").insert(payload);
      toast({ title: "Saved", description: `Receipt ${form.receipt_no} saved` });
      navigate("/admin/trust/list");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/admin/trust"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
          <HeartHandshake size={18} className="text-rose-500" />
          <h1 className="font-bold">{id ? "Edit" : "New"} Donation Entry</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Donor Receipt Form</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Receipt No. *</Label>
                <Input value={form.receipt_no} onChange={e => update("receipt_no", e.target.value)} />
              </div>
              <div>
                <Label>Date *</Label>
                <Input type="date" value={form.donation_date} onChange={e => update("donation_date", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Received from (Sri/Smt/M/s) *</Label>
                <Input value={form.donor_name} onChange={e => update("donor_name", e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input value={form.mobile} onChange={e => update("mobile", e.target.value)} placeholder="10-digit mobile" maxLength={15} />
              </div>
              <div>
                <Label>PAN</Label>
                <Input value={form.pan} onChange={e => update("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
              </div>
              <div>
                <Label>Donation Amount (Rs) *</Label>
                <Input type="number" min={1} value={form.amount} onChange={e => update("amount", e.target.value)} />
              </div>
              <div>
                <Label>Amount in Words</Label>
                <Input value={form.amount_in_words} onChange={e => update("amount_in_words", e.target.value)} />
              </div>
              <div>
                <Label>Payment Method *</Label>
                <Select value={form.payment_method} onValueChange={v => update("payment_method", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transaction Id / Cheque No.</Label>
                <Input value={form.transaction_id} onChange={e => update("transaction_id", e.target.value)} />
              </div>
              <div>
                <Label>Purpose *</Label>
                <Select value={form.purpose} onValueChange={v => update("purpose", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Collected By</Label>
                <Input value={form.collected_by} onChange={e => update("collected_by", e.target.value)} placeholder="Collector name" />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Link to="/admin/trust/list"><Button type="button" variant="outline">Cancel</Button></Link>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Save size={14} className="mr-1" /> {loading ? "Saving…" : "Save Entry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
