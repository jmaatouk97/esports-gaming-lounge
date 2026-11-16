import { useMemo, useState } from "react";
import {
  Banner,
  Button,
  Dialog,
  NumberField,
  SearchField,
  Select,
  TextField,
  useToast,
} from "open-glass-ui";
import { Boxes, Plus, RefreshCw, Search, Truck } from "lucide-react";
import { PageHeader, SectionHead, StatusPill, usd } from "../components/Bits";
import { useApp } from "../store";
import type { InventoryItem } from "../data";

const CATEGORIES = ["All", "Cafe", "Hardware", "Supplies", "Merch"] as const;

function stockTone(item: InventoryItem) {
  if (item.stock === 0) return { tone: "red" as const, label: "Out" };
  if (item.stock < item.reorder) return { tone: "red" as const, label: "Low" };
  if (item.stock < item.reorder * 1.5) return { tone: "amber" as const, label: "Watch" };
  return { tone: "green" as const, label: "Healthy" };
}

export default function Stock() {
  const { toast } = useToast();
  const inventory = useApp((s) => s.stock);
  const restock = useApp((s) => s.restock);
  const addStockItem = useApp((s) => s.addStockItem);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [restocking, setRestocking] = useState<InventoryItem | null>(null);
  const [qty, setQty] = useState(24);
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    sku: "",
    category: "Cafe",
    stock: 0,
    reorder: 10,
    unitCost: 0,
  });

  const lowCount = inventory.filter((i) => i.stock < i.reorder).length;
  const stockValue = inventory.reduce((sum, i) => sum + i.stock * i.unitCost, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventory.filter((item) => {
      const status = stockTone(item).label;
      return (
        (category === "All" || item.category === category) &&
        (statusFilter === "All" ||
          (statusFilter === "Low" ? status === "Low" || status === "Out" : status === statusFilter)) &&
        (!q ||
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q))
      );
    });
  }, [inventory, query, category, statusFilter]);

  const stats = [
    { label: "Tracked SKUs", value: String(inventory.length), foot: "4 categories" },
    { label: "Stock value", value: usd(stockValue, 0), foot: "at unit cost" },
    { label: "Below reorder", value: String(lowCount), foot: "needs PO today" },
    { label: "Open POs", value: "4", foot: "2 arriving today" },
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Operations"
        title="Stock & inventory"
        meta="Supplier lead times · 3–5 days · Zone A store"
        actions={
          <Button
            variant="primary"
            size="small"
            leadingIcon={<Plus size={14} />}
            onClick={() => setNewOpen(true)}
          >
            New item
          </Button>
        }
      />

      <section className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="panel p-4">
            <p className="text-[11px] text-[rgb(var(--ink-rgb)/0.40)]">{stat.label}</p>
            <p className="metric mt-2">{stat.value}</p>
            <p className="mt-2 text-[10px] text-[rgb(var(--ink-rgb)/0.28)]">{stat.foot}</p>
          </div>
        ))}
      </section>

      {lowCount > 0 && (
        <div className="mb-3">
          <Banner
            title={`${lowCount} items below reorder point`}
            dismissible
            action={
              <Button
                variant="secondary"
                size="small"
                leadingIcon={<Truck size={13} />}
                onClick={() => toast({ title: "Purchase order drafted", description: "Sent to Vertex Supply." })}
              >
                Create PO
              </Button>
            }
          >
            Coffee base, pizza bases and cleaning supplies cover less than two service days.
          </Banner>
        </div>
      )}

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-end gap-2 border-b border-[rgb(var(--ink-rgb)/0.07)] p-4">
          <div className="min-w-[220px] flex-1">
            <SearchField
              label="Search inventory"
              value={query}
              onValueChange={setQuery}
              placeholder="Search item, SKU or supplier"
            />
          </div>
          <div className="w-[150px]">
            <Select
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.currentTarget.value)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div className="w-[150px]">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.currentTarget.value)}
              options={[
                { value: "All", label: "All statuses" },
                { value: "Low", label: "Low / out" },
                { value: "Watch", label: "Watch" },
                { value: "Healthy", label: "Healthy" },
              ]}
            />
          </div>
          <span className="num mb-2 ml-auto hidden text-[10px] text-[rgb(var(--ink-rgb)/0.25)] md:block">
            {filtered.length} rows
          </span>
        </div>

        <div className="scroll-thin overflow-x-auto">
          <table className="data-table min-w-[980px]">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th className="num">On hand</th>
                <th className="num">Reorder</th>
                <th className="num">Unit</th>
                <th className="num">Value</th>
                <th>Supplier</th>
                <th>Status</th>
                <th className="num">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const state = stockTone(item);
                const pct = Math.min(100, (item.stock / Math.max(item.reorder * 2, 1)) * 100);
                return (
                  <tr key={item.id}>
                    <td>
                      <p className="text-[12px] font-medium text-[rgb(var(--ink-rgb)/0.85)]">{item.name}</p>
                      <p className="num text-[9.5px] text-[rgb(var(--ink-rgb)/0.28)]">{item.sku}</p>
                    </td>
                    <td>
                      <span className="chip !h-5 !text-[9.5px]">{item.category}</span>
                    </td>
                    <td className="num">
                      <div className="flex items-center justify-end gap-2">
                        <span className={item.stock < item.reorder ? "text-amber-300" : ""}>
                          {item.stock}
                        </span>
                        <span className="h-1 w-14 overflow-hidden rounded-full bg-[rgb(var(--ink-rgb)/0.08)]">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background:
                                state.tone === "red"
                                  ? "#f87171"
                                  : state.tone === "amber"
                                    ? "#fbbf24"
                                    : "var(--theme-primary)",
                            }}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="num text-[rgb(var(--ink-rgb)/0.40)]">{item.reorder}</td>
                    <td className="num">{usd(item.unitCost)}</td>
                    <td className="num">{usd(item.stock * item.unitCost, 0)}</td>
                    <td className="text-[11px] text-[rgb(var(--ink-rgb)/0.45)]">{item.supplier}</td>
                    <td>
                      <StatusPill tone={state.tone}>{state.label}</StatusPill>
                    </td>
                    <td className="text-right">
                      <Button
                        variant="quiet"
                        size="small"
                        leadingIcon={<RefreshCw size={12} />}
                        onClick={() => {
                          setRestocking(item);
                          setQty(Math.max(item.reorder * 2 - item.stock, 10));
                        }}
                      >
                        Restock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="grid place-items-center gap-2 py-14 text-center">
            <Search size={18} className="text-[rgb(var(--ink-rgb)/0.20)]" />
            <p className="text-[12px] text-[rgb(var(--ink-rgb)/0.40)]">No inventory matches these filters.</p>
          </div>
        )}
      </section>

      <Dialog
        title={`Restock · ${restocking?.name ?? ""}`}
        description="Units are added to on-hand stock immediately."
        open={!!restocking}
        onOpenChange={(open) => !open && setRestocking(null)}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="inset-well p-3">
              <p className="text-[10px] text-[rgb(var(--ink-rgb)/0.35)]">On hand</p>
              <p className="num mt-1 text-[18px] text-[rgb(var(--ink-rgb)/0.85)]">{restocking?.stock ?? 0}</p>
            </div>
            <div className="inset-well p-3">
              <p className="text-[10px] text-[rgb(var(--ink-rgb)/0.35)]">Reorder point</p>
              <p className="num mt-1 text-[18px] text-[rgb(var(--ink-rgb)/0.85)]">{restocking?.reorder ?? 0}</p>
            </div>
          </div>
          <NumberField label="Units to add" value={qty} min={1} onValueChange={setQty} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="quiet" onClick={() => setRestocking(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!restocking) return;
                restock(restocking.id, qty);
                toast({
                  title: "Stock updated",
                  description: `${restocking.name} · +${qty} units`,
                });
                setRestocking(null);
              }}
            >
              Add {qty} units
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        title="New inventory item"
        description="Create a stock line with supplier and reorder rules."
        open={newOpen}
        onOpenChange={setNewOpen}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Item name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })}
              placeholder="Cold brew"
            />
            <TextField
              label="SKU"
              value={draft.sku}
              onChange={(event) => setDraft({ ...draft, sku: event.currentTarget.value })}
              placeholder="CD-CBC"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.currentTarget.value })}
              options={CATEGORIES.slice(1).map((c) => ({ value: c, label: c }))}
            />
            <NumberField
              label="Unit cost"
              value={draft.unitCost}
              min={0}
              step={0.25}
              onValueChange={(value) => setDraft({ ...draft, unitCost: value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Opening stock"
              value={draft.stock}
              min={0}
              onValueChange={(value) => setDraft({ ...draft, stock: value })}
            />
            <NumberField
              label="Reorder point"
              value={draft.reorder}
              min={0}
              onValueChange={(value) => setDraft({ ...draft, reorder: value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="quiet" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              leadingIcon={<Boxes size={14} />}
              disabled={!draft.name.trim() || !draft.sku.trim()}
              onClick={() => {
                addStockItem({
                  id: `i-${Date.now()}`,
                  name: draft.name.trim(),
                  sku: draft.sku.trim().toUpperCase(),
                  category: draft.category as InventoryItem["category"],
                  stock: draft.stock,
                  reorder: draft.reorder,
                  unitCost: draft.unitCost,
                  supplier: "Unassigned",
                });
                toast({ title: "Item created", description: draft.name.trim() });
                setNewOpen(false);
                setDraft({ name: "", sku: "", category: "Cafe", stock: 0, reorder: 10, unitCost: 0 });
              }}
            >
              Create item
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
