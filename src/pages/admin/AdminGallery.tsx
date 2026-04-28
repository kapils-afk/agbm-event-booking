import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Edit, Image } from "lucide-react";

export default function AdminGallery() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", category: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!localStorage.getItem("admin_session")) { navigate("/admin/login"); return; }
    fetchData();
  }, []);

  const fetchData = () => api.getGallery().then(setItems).catch(() => {});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url) { toast({ title: "Error", description: "Title and image URL required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      if (editId) await api.updateGallery(editId, form);
      else await api.createGallery(form);
      toast({ title: "Saved" }); setShowForm(false); setEditId(null); setForm({ title: "", description: "", image_url: "", category: "" }); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await api.deleteGallery(id);
    toast({ title: "Deleted" }); fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
            <div className="flex items-center gap-2"><Image size={18} className="text-purple-500" /><h1 className="font-bold">Gallery</h1></div>
          </div>
          <Button size="sm" onClick={() => { setEditId(null); setForm({ title: "", description: "", image_url: "", category: "" }); setShowForm(true); }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white"><Plus size={14} className="mr-1" /> Add</Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No gallery items yet</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(i => (
              <Card key={i.id} className="overflow-hidden group">
                <div className="aspect-video bg-muted">
                  <img src={i.image_url} alt={i.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm">{i.title}</h3>
                  {i.category && <span className="text-xs text-muted-foreground">{i.category}</span>}
                  <div className="flex gap-1 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditId(i.id); setForm({ title: i.title, description: i.description || "", image_url: i.image_url, category: i.category || "" }); setShowForm(true); }}><Edit size={12} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 size={12} className="text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent><DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} Gallery Item</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Image URL *</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
