import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { UtilityItem, AdvanceItem } from "@/lib/bookingExtras";

interface UtilityChargesEditorProps {
  items: UtilityItem[];
  onChange: (items: UtilityItem[]) => void;
  error?: string;
}

export function UtilityChargesEditor({ items, onChange, error }: UtilityChargesEditorProps) {
  const update = (i: number, patch: Partial<UtilityItem>) => {
    onChange(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { description: "", amount: 0 }]);
  const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

  return (
    <div className="md:col-span-2 space-y-2 rounded-md border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Utility Charges <span className="text-destructive">*</span></Label>
        <Button type="button" size="sm" variant="outline" onClick={add} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Charge
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">No charges added. Click "Add Charge" to start.</p>
      )}

      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-2 items-start">
            <Input
              placeholder="Description (e.g., Electricity)"
              value={it.description}
              onChange={e => update(i, { description: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Amount (Rs)"
              value={it.amount === 0 && document.activeElement !== null ? it.amount : it.amount || ""}
              onChange={e => update(i, { amount: Number(e.target.value) || 0 })}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove charge">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="flex justify-between items-center pt-2 border-t text-sm">
          <span className="font-medium">Total Tariff Amount</span>
          <span className="font-semibold">Rs. {total.toLocaleString("en-IN")}</span>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface AdvancePaymentsEditorProps {
  items: AdvanceItem[];
  onChange: (items: AdvanceItem[]) => void;
  tariff: number;
}

export function AdvancePaymentsEditor({ items, onChange, tariff }: AdvancePaymentsEditorProps) {
  const today = new Date().toISOString().slice(0, 10);
  const update = (i: number, patch: Partial<AdvanceItem>) => {
    onChange(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { date: today, amount: 0, note: "" }]);
  const totalAdvance = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const balance = tariff - totalAdvance;

  return (
    <div className="md:col-span-2 space-y-2 rounded-md border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Advance Payments</Label>
        <Button type="button" size="sm" variant="outline" onClick={add} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Payment
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">No advance payments recorded.</p>
      )}

      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[160px_140px_1fr_auto] gap-2 items-start">
            <Input
              type="date"
              value={it.date}
              onChange={e => update(i, { date: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Amount (Rs)"
              value={it.amount || ""}
              onChange={e => update(i, { amount: Number(e.target.value) || 0 })}
            />
            <Input
              placeholder="Note (e.g., Cash / UPI / Cheque #)"
              value={it.note || ""}
              onChange={e => update(i, { note: e.target.value })}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove payment">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t text-sm">
        <div className="flex justify-between sm:flex-col">
          <span className="text-muted-foreground">Tariff Amount</span>
          <span className="font-semibold">Rs. {tariff.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between sm:flex-col">
          <span className="text-muted-foreground">Total Advance Paid</span>
          <span className="font-semibold">Rs. {totalAdvance.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between sm:flex-col">
          <span className="text-muted-foreground">Balance Amount</span>
          <span className={`font-semibold ${balance < 0 ? "text-destructive" : ""}`}>
            Rs. {balance.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}
