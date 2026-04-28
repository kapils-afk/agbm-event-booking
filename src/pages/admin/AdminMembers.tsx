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
import { ArrowLeft, Plus, Trash2, Edit, Users } from "lucide-react";
import { DataTableSearchBar, DataTablePagination, usePaginatedFilter } from "@/components/admin/DataTableToolbar";


export default function AdminMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", mobile: "", password: "", email: "", aadhaar: "", address: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!localStorage.getItem("admin_session")) { navigate("/admin/login"); return; }
    fetchMembers();
  }, []);

  const fetchMembers = () => api.getMembers().then(setMembers).catch(() => {});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || (!editId && !form.password)) {
      toast({ title: "Error", description: "Name, mobile and password are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await api.updateMember(editId, { name: form.name, mobile: form.mobile, email: form.email || null, aadhaar: form.aadhaar || null, address: form.address || null, ...(form.password && { password: form.password }) });
        toast({ title: "Updated" });
      } else {
        await api.createMember({ name: form.name, mobile: form.mobile, password: form.password, email: form.email || null, aadhaar: form.aadhaar || null, address: form.address || null });
        toast({ title: "Added" });
      }
      setShowForm(false); setEditId(null); setForm({ name: "", mobile: "", password: "", email: "", aadhaar: "", address: "" });
      fetchMembers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    await api.deleteMember(id);
    toast({ title: "Deleted" });
    fetchMembers();
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { paged, total } = useMemo(
    () => usePaginatedFilter(members, search, pageSize, page, (m, q) =>
      m.name.toLowerCase().includes(q) || m.mobile.includes(q) || (m.email || "").toLowerCase().includes(q)
    ),
    [members, search, pageSize, page]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
            <div className="flex items-center gap-2"><Users size={18} className="text-blue-500" /><h1 className="font-bold">Registered Members</h1></div>
          </div>
          <Button size="sm" onClick={() => { setEditId(null); setForm({ name: "", mobile: "", password: "", email: "", aadhaar: "", address: "" }); setShowForm(true); }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Plus size={14} className="mr-1" /> Add Member
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <DataTableSearchBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, mobile or email..." pageSize={pageSize} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Aadhaar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No members found</TableCell></TableRow>
                ) : paged.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.mobile}</TableCell>
                    <TableCell>{m.email || "—"}</TableCell>
                    <TableCell>{m.aadhaar || "—"}</TableCell>
                    <TableCell><span className={`px-2 py-0.5 rounded-full text-xs ${m.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{m.is_active ? "Active" : "Inactive"}</span></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}><Edit size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DataTablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </main>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Edit Member" : "Add New Member"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Mobile *</Label><Input type="tel" maxLength={10} value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} /></div>
            <div><Label>Password {editId ? "(leave blank to keep)" : "*"}</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Aadhaar</Label><Input value={form.aadhaar} onChange={e => setForm(f => ({ ...f, aadhaar: e.target.value }))} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white" disabled={loading}>{loading ? "Saving..." : editId ? "Update Member" : "Register Member"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
