import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { DataTableSearchBar, DataTablePagination, usePaginatedFilter } from "@/components/admin/DataTableToolbar";

export default function MemberMembersList() {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { api.getMembers().then(setMembers).catch(() => {}); }, []);

  const { paged, total } = useMemo(
    () => usePaginatedFilter(members, search, pageSize, page, (m, q) =>
      m.name?.toLowerCase().includes(q) || m.mobile?.includes(q) || (m.blood_group || "").toLowerCase().includes(q)
    ),
    [members, search, pageSize, page]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-orange-500" />
        <h1 className="text-xl font-bold">Members Directory</h1>
      </div>
      <DataTableSearchBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, mobile or blood group..." pageSize={pageSize} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Blood Group</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No members found</TableCell></TableRow>
            ) : paged.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={m.photo_url || undefined} alt={m.name} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">{(m.name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.mobile}</TableCell>
                <TableCell>{m.email || "—"}</TableCell>
                <TableCell>{m.blood_group ? <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-semibold">{m.blood_group}</span> : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
      <DataTablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
}
