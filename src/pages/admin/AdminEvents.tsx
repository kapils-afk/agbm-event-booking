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
import { ArrowLeft, Plus, Trash2, Edit, CalendarDays } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DataTableSearchBar, DataTablePagination, usePaginatedFilter, DateRangeFilter, filterByDateRange } from "@/components/admin/DataTableToolbar";

export default function AdminEvents() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const emptyForm = { title: "", description: "", event_date: "", venue: "", image_url: "" };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!localStorage.getItem("admin_session")) { navigate("/admin/login"); return; }
    fetchData();
  }, []);

  const fetchData = () => api.getEvents().then(setItems).catch(() => {});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.event_date) { toast({ title: "Error", description: "Title and date required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const payload = { title: form.title, description: form.description || null, event_date: form.event_date, venue: form.venue || null, image_url: form.image_url || null };
      if (editId) await api.updateEvent(editId, form);
      else await api.createEvent(form);
      toast({ title: "Saved" }); setShowForm(false); setEditId(null); setForm(payload); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await api.deleteEvent(id);
    toast({ title: "Deleted" }); fetchData();
  };

  const { paged, total } = useMemo(
    () => usePaginatedFilter(items, search, pageSize, page, (i, q) =>
      i.title.toLowerCase().includes(q) || (i.venue || "").toLowerCase().includes(q)
    ),
    [items, search, pageSize, page]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
            <div className="flex items-center gap-2"><CalendarDays size={18} className="text-green-500" /><h1 className="font-bold">Events</h1></div>
          </div>
          <Button size="sm" onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white"><Plus size={14} className="mr-1" /> Add</Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <DataTableSearchBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by title or venue..." pageSize={pageSize} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead>Venue</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {paged.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No events found</TableCell></TableRow> :
              paged.map(i => (
                <TableRow key={i.id}>
                  <TableCell>
                    {i.image_url ? <img src={i.image_url} alt={i.title} className="w-12 h-12 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} /> : <div className="w-12 h-12 bg-muted rounded" />}
                  </TableCell>
                  <TableCell className="font-medium">{i.title}</TableCell>
                  <TableCell>{new Date(i.event_date).toLocaleDateString()}</TableCell>
                  <TableCell>{i.venue || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(i.id); setForm({ title: i.title, description: i.description || "", event_date: i.event_date?.split("T")[0] || "", venue: i.venue || "", image_url: i.image_url || "" }); setShowForm(true); }}><Edit size={14} /></Button>
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Event</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Event Date *</Label><Input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} /></div>
            <div><Label>Venue</Label><Input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Event Image</Label><ImageUploader value={form.image_url} onChange={(url) => setForm(f => ({ ...f, image_url: url }))} folder="events" maxSizeMB={5} /></div>
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
