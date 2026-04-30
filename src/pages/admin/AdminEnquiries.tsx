import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Trash2, Eye, MessageSquare, CheckCircle2 } from "lucide-react";
import { DataTableSearchBar, DataTablePagination, usePaginatedFilter } from "@/components/admin/DataTableToolbar";
import { format } from "date-fns";

interface Enquiry {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewing, setViewing] = useState<Enquiry | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!localStorage.getItem("admin_session")) { navigate("/admin/login"); return; }
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    const { data, error } = await supabase
      .from("contact_enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast({ title: "Failed to load", description: error.message, variant: "destructive" }); return; }
    setEnquiries((data || []) as Enquiry[]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    const { error } = await supabase.from("contact_enquiries").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    fetchEnquiries();
  };

  const handleView = async (e: Enquiry) => {
    setViewing(e);
    if (!e.is_read) {
      await supabase.from("contact_enquiries").update({ is_read: true }).eq("id", e.id);
      fetchEnquiries();
    }
  };

  const { paged, total } = useMemo(
    () => usePaginatedFilter(enquiries, search, pageSize, page, (e, q) =>
      e.name.toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.mobile || "").includes(q) ||
      e.message.toLowerCase().includes(q)
    ),
    [enquiries, search, pageSize, page]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-fuchsia-500" />
              <h1 className="font-bold">Contact Enquiries</h1>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {enquiries.filter(e => !e.is_read).length} unread
          </span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <DataTableSearchBar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name, mobile, email or message..."
          pageSize={pageSize}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
        />
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No enquiries found</TableCell></TableRow>
                ) : paged.map((e) => (
                  <TableRow key={e.id} className={!e.is_read ? "bg-amber-50/50" : ""}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(e.created_at), "dd MMM yyyy, HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.mobile || "—"}</TableCell>
                    <TableCell>{e.email || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">{e.message}</TableCell>
                    <TableCell>
                      {e.is_read ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Read
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">New</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleView(e)}><Eye size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DataTablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </main>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Enquiry Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2"><span className="text-muted-foreground">Name</span><span className="col-span-2 font-medium">{viewing.name}</span></div>
              <div className="grid grid-cols-3 gap-2"><span className="text-muted-foreground">Mobile</span><span className="col-span-2">{viewing.mobile || "—"}</span></div>
              <div className="grid grid-cols-3 gap-2"><span className="text-muted-foreground">Email</span><span className="col-span-2">{viewing.email || "—"}</span></div>
              <div className="grid grid-cols-3 gap-2"><span className="text-muted-foreground">Date</span><span className="col-span-2">{format(new Date(viewing.created_at), "dd MMM yyyy, HH:mm")}</span></div>
              <div>
                <p className="text-muted-foreground mb-1">Message</p>
                <div className="bg-slate-50 border rounded p-3 whitespace-pre-wrap">{viewing.message}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
