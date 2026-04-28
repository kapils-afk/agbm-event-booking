import { useState, useEffect } from "react";
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

export default function AdminEvents() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", venue: "" });
  const [loading, setLoading] = useState(false);
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
      if (editId) await api.updateEvent(editId, form);
      else await api.createEvent(form);
      toast({ title: "Saved" }); setShowForm(false); setEditId(null); setForm({ title: "", description: "", event_date: "", venue: "" }); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await api.deleteEvent(id);
    toast({ title: "Deleted" }); fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
            <div className="flex items-center gap-2"><CalendarDays size={18} className="text-green-500" /><h1 className="font-bold">Events</h1></div>
          </div>
          <Button size="sm" onClick={() => { setEditId(null); setForm({ title: "", description: "", event_date: "", venue: "" }); setShowForm(true); }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white"><Plus size={14} className="mr-1" /> Add</Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead>Venue</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No events</TableCell></TableRow> :
              items.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.title}</TableCell>
                  <TableCell>{new Date(i.event_date).toLocaleDateString()}</TableCell>
                  <TableCell>{i.venue || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(i.id); setForm({ title: i.title, description: i.description || "", event_date: i.event_date?.split("T")[0] || "", venue: i.venue || "" }); setShowForm(true); }}><Edit size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}><Trash2 size={14} className="text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </main>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent><DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Event</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Event Date *</Label><Input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} /></div>
            <div><Label>Venue</Label><Input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
