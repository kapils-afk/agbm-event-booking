import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Edit, UserCheck } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DataTableSearchBar, DataTablePagination, usePaginatedFilter, filterByDateRange } from "@/components/admin/DataTableToolbar";

export default function AdminTrustCommittee() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const emptyForm = { name: "", designation: "", photo_url: "", display_order: "0" };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!localStorage.getItem("admin_session")) { navigate("/admin/login"); return; }
    fetchData();
  }, []);

  const fetchData = () => api.getTrustCommittee().then(setItems).catch(() => {});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.designation) { toast({ title: "Error", description: "Name and designation required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const payload = { name: form.name, designation: form.designation, photo_url: form.photo_url || null, display_order: parseInt(form.display_order) || 0 };
      if (editId) await api.updateTrustCommitteeMember(editId, payload);
      else await api.createTrustCommitteeMember(payload);
      toast({ title: "Saved" }); setShowForm(false); setEditId(null); setForm({ name: "", designation: "", photo_url: "", display_order: "0" }); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await api.deleteTrustCommitteeMember(id);
    toast({ title: "Deleted" }); fetchData();
  };

  const { paged, total } = useMemo(
    () => usePaginatedFilter(items, search, pageSize, page, (i, q) =>
      i.name.toLowerCase().includes(q) || i.designation.toLowerCase().includes(q)
    ),
    [items, search, pageSize, page]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
            <div className="flex items-center gap-2"><UserCheck size={18} className="text-teal-500" /><h1 className="font-bold">Trust Committee</h1></div>
          </div>
          <Button size="sm" onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white"><Plus size={14} className="mr-1" /> Add</Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <DataTableSearchBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or designation..." pageSize={pageSize} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Order</TableHead><TableHead>Name</TableHead><TableHead>Designation</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {paged.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No trust committee members found</TableCell></TableRow> :
              paged.map(i => (
                <TableRow key={i.id}>
                  <TableCell>{i.photo_url ? <img src={i.photo_url} alt={i.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} /> : <div className="w-10 h-10 rounded-full bg-muted" />}</TableCell>
                  <TableCell>{i.display_order}</TableCell>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell>{i.designation}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(i.id); setForm({ name: i.name, designation: i.designation, photo_url: i.photo_url || "", display_order: String(i.display_order) }); setShowForm(true); }}><Edit size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}><Trash2 size={14} className="text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
        <DataTablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </main>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} Trust Committee Member</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Designation *</Label><Input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} /></div>
            <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} /></div>
            <div><Label>Photo</Label><ImageUploader value={form.photo_url} onChange={(url) => setForm(f => ({ ...f, photo_url: url }))} folder="trust-committee" maxSizeMB={5} /></div>
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
