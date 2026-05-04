import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Edit, Megaphone } from "lucide-react";
import { DataTableSearchBar, DataTablePagination, usePaginatedFilter, DateRangeFilter, filterByDateRange } from "@/components/admin/DataTableToolbar";

export default function AdminAnnouncements() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
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

  const fetchData = () => api.getAnnouncements().then(setItems).catch(() => {});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast({ title: "Error", description: "All fields required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      if (editId) await api.updateAnnouncement(editId, form);
      else await api.createAnnouncement(form);
      toast({ title: "Saved" });
      setShowForm(false); setEditId(null); setForm({ title: "", content: "" });
      fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await api.deleteAnnouncement(id);
    toast({ title: "Deleted" }); fetchData();
  };

  const { paged, total } = useMemo(
    () => usePaginatedFilter(items, search, pageSize, page, (i, q) =>
      i.title.toLowerCase().includes(q) || (i.content || "").toLowerCase().includes(q)
    ),
    [items, search, pageSize, page]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
            <div className="flex items-center gap-2"><Megaphone size={18} className="text-amber-500" /><h1 className="font-bold">Announcements</h1></div>
          </div>
          <Button size="sm" onClick={() => { setEditId(null); setForm({ title: "", content: "" }); setShowForm(true); }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white"><Plus size={14} className="mr-1" /> Add</Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <DataTableSearchBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search announcements..." pageSize={pageSize} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Content</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {paged.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No announcements found</TableCell></TableRow> :
              paged.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{i.content}</TableCell>
                  <TableCell>{new Date(i.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(i.id); setForm({ title: i.title, content: i.content }); setShowForm(true); }}><Edit size={14} /></Button>
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
        <DialogContent><DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Announcement</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Content *</Label><Textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
