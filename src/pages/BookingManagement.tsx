import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getBookings, deleteBooking, getBookingStatus } from "@/lib/bookingStore";
import { generateBookingPDF } from "@/lib/pdfGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Download, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Upcoming: "bg-info text-info-foreground",
  Ongoing: "bg-warning text-warning-foreground",
  Completed: "bg-success text-success-foreground",
};

export default function BookingManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const bookings = useMemo(() => getBookings(), [refreshKey]);
  const [search, setSearch] = useState("");
  const [filterFunction, setFilterFunction] = useState("all");
  const [filterHall, setFilterHall] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState<string>("fromDateTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let list = bookings.map((b) => ({ ...b, status: getBookingStatus(b) }));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.phone.includes(q) || b.id.toLowerCase().includes(q));
    }
    if (filterFunction !== "all") list = list.filter((b) => b.functionType === filterFunction);
    if (filterHall !== "all") list = list.filter((b) => b.hallType === filterHall);
    if (filterStatus !== "all") list = list.filter((b) => b.status === filterStatus);
    list.sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [bookings, search, filterFunction, filterHall, filterStatus, sortField, sortDir]);

  const handleDelete = (id: string) => {
    deleteBooking(id);
    setRefreshKey((k) => k + 1);
    toast.success("Booking deleted");
  };

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">{children} <ArrowUpDown size={14} className="text-muted-foreground" /></div>
    </TableHead>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold">Manage Bookings</h2>
        <Button asChild><Link to="/new-booking">+ New Booking</Link></Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <Input placeholder="Search name, phone, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="md:max-w-xs" />
            <Select value={filterFunction} onValueChange={setFilterFunction}>
              <SelectTrigger className="md:w-40"><SelectValue placeholder="Function" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Functions</SelectItem>
                <SelectItem value="Marriage">Marriage</SelectItem>
                <SelectItem value="Reception">Reception</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterHall} onValueChange={setFilterHall}>
              <SelectTrigger className="md:w-36"><SelectValue placeholder="Hall" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Halls</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Double">Double</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="md:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader field="id">Booking ID</SortHeader>
                <SortHeader field="name">Name</SortHeader>
                <TableHead>Mobile</TableHead>
                <SortHeader field="functionType">Function</SortHeader>
                <SortHeader field="fromDateTime">From</SortHeader>
                <SortHeader field="toDateTime">To</SortHeader>
                <TableHead>Hall</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No bookings found</TableCell></TableRow>
              ) : (
                filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.phone}</TableCell>
                    <TableCell>{b.functionType}</TableCell>
                    <TableCell className="text-xs">{format(new Date(b.fromDateTime), "dd/MM/yy hh:mm a")}</TableCell>
                    <TableCell className="text-xs">{format(new Date(b.toDateTime), "dd/MM/yy hh:mm a")}</TableCell>
                    <TableCell>{b.hallType}</TableCell>
                    <TableCell><Badge className={`${statusColors[b.status]} border-none text-xs`}>{b.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild><Link to={`/booking/${b.id}`}><Pencil size={15} /></Link></Button>
                        <Button variant="ghost" size="icon" onClick={() => generateBookingPDF(b)}><Download size={15} /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 size={15} className="text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete booking?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone. Booking {b.id} for {b.name} will be permanently deleted.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(b.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
