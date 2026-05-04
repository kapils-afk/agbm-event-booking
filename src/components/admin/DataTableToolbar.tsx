import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar, X } from "lucide-react";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  label?: string;
}

export function DateRangeFilter({ from, to, onFromChange, onToChange, label = "Date" }: DateRangeFilterProps) {
  const clear = () => { onFromChange(""); onToChange(""); };
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} /> {label} From</Label>
        <Input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="h-9 w-[160px]" />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="h-9 w-[160px]" />
      </div>
      {(from || to) && (
        <Button variant="ghost" size="sm" className="h-9" onClick={clear}><X size={14} className="mr-1" /> Clear</Button>
      )}
    </div>
  );
}

export function filterByDateRange<T>(items: T[], from: string, to: string, getDate: (item: T) => string | Date | null | undefined): T[] {
  if (!from && !to) return items;
  const fromTs = from ? new Date(from + "T00:00:00").getTime() : -Infinity;
  const toTs = to ? new Date(to + "T23:59:59.999").getTime() : Infinity;
  return items.filter((i) => {
    const d = getDate(i);
    if (!d) return false;
    const t = new Date(d).getTime();
    return !isNaN(t) && t >= fromTs && t <= toTs;
  });
}

interface ToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
}

export function DataTableSearchBar({ search, onSearch, placeholder = "Search...", pageSize, onPageSizeChange }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={placeholder} value={search} onChange={(e) => onSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Show</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-20 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">entries</span>
      </div>
    </div>
  );
}

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}

export function DataTablePagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-3 px-1">
      <p className="text-xs text-muted-foreground">
        Showing <b>{start}</b> to <b>{end}</b> of <b>{total}</b> entries
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => onPageChange(1)}><ChevronsLeft size={14} /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={14} /></Button>
        <span className="px-3 text-sm">Page <b>{page}</b> of <b>{totalPages}</b></span>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={14} /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}><ChevronsRight size={14} /></Button>
      </div>
    </div>
  );
}

export function usePaginatedFilter<T>(items: T[], search: string, pageSize: number, page: number, filterFn: (item: T, q: string) => boolean) {
  const q = search.trim().toLowerCase();
  const filtered = q ? items.filter((i) => filterFn(i, q)) : items;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  return { filtered, paged, total: filtered.length, totalPages, safePage };
}
