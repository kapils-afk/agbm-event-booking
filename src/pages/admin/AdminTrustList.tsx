import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Edit, Trash2, Download, MessageCircle, FileSpreadsheet, HeartHandshake, IndianRupee } from "lucide-react";
import { generateDonationReceiptPDF } from "@/lib/donationReceipt";
import * as XLSX from "xlsx";
import { DataTableSearchBar, DataTablePagination, usePaginatedFilter } from "@/components/admin/DataTableToolbar";

export default function AdminTrustList() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!localStorage.getItem("admin_session")) { navigate("/admin/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await api.getDonations();
    setItems(data);
  };

  const { filtered, paged, total } = useMemo(
    () => usePaginatedFilter(items, search, pageSize, page, (d, q) =>
      d.donor_name.toLowerCase().includes(q) || (d.mobile || "").toLowerCase().includes(q) || (d.receipt_no || "").toLowerCase().includes(q)
    ),
    [items, search, pageSize, page]
  );

  const total_amt = filtered.reduce((s, d) => s + Number(d.amount || 0), 0);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this donation entry?")) return;
    await api.deleteDonation(id);
    toast({ title: "Deleted" });
    fetchData();
  };

  const downloadReceipt = (d: any) => {
    const doc = generateDonationReceiptPDF(d);
    doc.save(`Receipt_${d.receipt_no.replace(/\//g, "_")}.pdf`);
  };

  const sendWhatsApp = (d: any) => {
    if (!d.mobile) { toast({ title: "No mobile number", variant: "destructive" }); return; }
    const num = d.mobile.replace(/\D/g, "");
    const phone = num.length === 10 ? `91${num}` : num;
    const msg = `Dear ${d.donor_name},%0AThank you for your generous contribution of Rs ${Number(d.amount).toLocaleString("en-IN")} to AGBM Charitable Trust.%0AReceipt No: ${d.receipt_no}%0ADate: ${new Date(d.donation_date).toLocaleDateString("en-GB")}%0APurpose: ${d.purpose}%0A%0APlease download your receipt from our office.%0A- AGBM Charitable Trust`;
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const exportExcel = () => {
    const rows = filtered.map(d => ({
      "Receipt No": d.receipt_no,
      "Date": new Date(d.donation_date).toLocaleDateString("en-GB"),
      "Donor Name": d.donor_name,
      "Mobile": d.mobile || "",
      "PAN": d.pan || "",
      "Amount (Rs)": Number(d.amount),
      "Amount in Words": d.amount_in_words || "",
      "Purpose": d.purpose,
      "Payment Method": d.payment_method,
      "Transaction Id": d.transaction_id || "",
      "Collected By": d.collected_by || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Donors");
    XLSX.writeFile(wb, `AGBM_Donors_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link to="/admin/trust"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
            <HeartHandshake size={18} className="text-rose-500" />
            <h1 className="font-bold">Donor List</h1>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportExcel}>
              <FileSpreadsheet size={14} className="mr-1" /> Export Excel
            </Button>
            <Link to="/admin/trust/new">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <Plus size={14} className="mr-1" /> New Entry
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-2">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="text-sm text-muted-foreground">
            Total{" "}
            <span className="inline-flex items-center font-bold text-emerald-600">
              <IndianRupee size={12} />{total_amt.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <DataTableSearchBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by donor, mobile or receipt no..." pageSize={pageSize} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No donations found</TableCell></TableRow>
                ) : paged.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.receipt_no}</TableCell>
                    <TableCell>{new Date(d.donation_date).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell className="font-medium">{d.donor_name}</TableCell>
                    <TableCell>{d.mobile || "—"}</TableCell>
                    <TableCell>{d.purpose}</TableCell>
                    <TableCell>{d.payment_method}</TableCell>
                    <TableCell className="text-right font-semibold">Rs {Number(d.amount).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => navigate(`/admin/trust/edit/${d.id}`)}><Edit size={14} /></Button>
                      <Button variant="ghost" size="icon" title="Download Receipt" onClick={() => downloadReceipt(d)}><Download size={14} /></Button>
                      <Button variant="ghost" size="icon" title="Send WhatsApp" onClick={() => sendWhatsApp(d)}><MessageCircle size={14} className="text-green-600" /></Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(d.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DataTablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </main>
    </div>
  );
}
