import { useEffect, useMemo, useState } from "react";
import {
  Button,
  IconButton,
  SearchField,
  SegmentedControl,
  Select,
  useToast,
} from "open-glass-ui";
import {
  Coffee,
  Cookie,
  CupSoda,
  Gamepad2,
  Grid3X3,
  LayoutGrid,
  Minus,
  Plus,
  Receipt,
  ShoppingBag,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { PageHeader, SectionHead, usd } from "../components/Bits";
import FloorEditor from "../components/floor/FloorEditor";
import { products, type Product, type ProductCategory, type Station } from "../data";
import { useApp } from "../store";

const CATEGORIES: (ProductCategory | "All")[] = [
  "All",
  "Gaming",
  "Hot Drinks",
  "Cold Drinks",
  "Snacks",
  "Meals",
];

const CATEGORY_ICON: Record<ProductCategory, typeof Gamepad2> = {
  Gaming: Gamepad2,
  "Hot Drinks": Coffee,
  "Cold Drinks": CupSoda,
  Snacks: Cookie,
  Meals: UtensilsCrossed,
};

const STATUS_LABEL: Record<Station["status"], string> = {
  available: "Available",
  "in-use": "In use",
  reserved: "Reserved",
  maintenance: "Maintenance",
};

function useTick(active: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);
}

function remaining(station: Station) {
  if (!station.endsAt) return null;
  const ms = station.endsAt - Date.now();
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours > 0 ? `${hours}h ${String(minutes).padStart(2, "0")}m` : `${minutes}m`;
}

function ProductTile({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const Icon = CATEGORY_ICON[product.category];
  const out = product.stock <= 0;
  return (
    <button
      type="button"
      className="product-tile"
      data-out={out}
      disabled={out}
      onClick={onAdd}
      aria-label={`Add ${product.name} to order`}
    >
      <div className="flex items-start justify-between">
        <span
          className="grid size-8 place-items-center rounded-lg border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.05)] text-[rgb(var(--ink-rgb)/0.60)]"
          aria-hidden="true"
        >
          <Icon size={15} strokeWidth={1.8} />
        </span>
        <span className="num text-[12px] text-[rgb(var(--ink-rgb)/0.85)]">{usd(product.price)}</span>
      </div>
      <p className="mt-3 line-clamp-2 min-h-[32px] text-[12.5px] font-medium leading-snug text-[rgb(var(--ink-rgb)/0.85)]">
        {product.name}
      </p>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.30)]">
          {out ? "Sold out" : `${product.stock} left`}
        </span>
        <span
          className="grid size-5 place-items-center rounded-full border border-[rgb(var(--ink-rgb)/0.10)] bg-[rgb(var(--ink-rgb)/0.05)] text-[rgb(var(--ink-rgb)/0.60)] transition group-hover:bg-[rgb(var(--ink-rgb)/0.10)]"
          aria-hidden="true"
        >
          <Plus size={11} />
        </span>
      </div>
    </button>
  );
}

export default function Cafe() {
  const { toast } = useToast();
  const mode = useApp((s) => s.cafeMode);
  const setMode = useApp((s) => s.setCafeMode);
  const category = useApp((s) => s.activeCategory);
  const setCategory = useApp((s) => s.setCategory);
  const query = useApp((s) => s.cafeQuery);
  const setQuery = useApp((s) => s.setCafeQuery);
  const cart = useApp((s) => s.cart);
  const addItem = useApp((s) => s.addItem);
  const decItem = useApp((s) => s.decItem);
  const clearCart = useApp((s) => s.clearCart);
  const cartTarget = useApp((s) => s.cartTarget);
  const setCartTarget = useApp((s) => s.setCartTarget);
  const checkout = useApp((s) => s.checkout);
  const stations = useApp((s) => s.stations);
  const members = useApp((s) => s.members);
  const startSession = useApp((s) => s.startSession);
  const extendSession = useApp((s) => s.extendSession);
  const endSession = useApp((s) => s.endSession);
  const setMaintenance = useApp((s) => s.setMaintenance);

  const [payment, setPayment] = useState("Card");

  useTick(mode === "floor");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (category === "All" || product.category === category) &&
        (!q || product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q)),
    );
  }, [category, query]);

  const lines = cart
    .map((line) => ({ ...line, product: products.find((p) => p.id === line.productId) }))
    .filter((line) => line.product);

  const subtotal = lines.reduce(
    (sum, line) => sum + (line.product?.price ?? 0) * line.qty,
    0,
  );

  const targetStation = stations.find((s) => s.id === cartTarget);
  const targetMember = members.find((m) => m.name === targetStation?.member);
  const discountRate =
    targetMember?.tier === "Platinum" ? 0.15 : targetMember?.tier === "Gold" ? 0.1 : targetMember?.tier === "Silver" ? 0.05 : 0;
  const discount = subtotal * discountRate;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  const handleCheckout = () => {
    if (!lines.length) return;
    const label = targetStation ? `to ${targetStation.id}` : "as walk-in";
    toast({
      title: `Order sent ${label}`,
      description: `${lines.reduce((n, l) => n + l.qty, 0)} items · ${usd(total)} · ${payment}`,
      duration: 4200,
    });
    checkout();
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Daily operations"
        title="Cafe & floor"
        meta={
          <span className="flex items-center gap-2">
            <span className="dot dot-live" />
            {stations.filter((s) => s.status === "in-use").length} sessions live · 2 orders in queue
          </span>
        }
        actions={
          <div className="w-[286px] max-w-full">
            <SegmentedControl
              aria-label="Workspace mode"
              value={mode}
              onValueChange={(value) => setMode(value as "pos" | "floor")}
              items={[
                { value: "pos", label: "POS & Cart", icon: <LayoutGrid size={13} /> },
                { value: "floor", label: "Floor Map", icon: <Grid3X3 size={13} /> },
              ]}
            />
          </div>
        }
      />

      {mode === "pos" ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_388px]">
          <section className="panel min-w-0 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-[200px] flex-1">
                <SearchField
                  label="Search products"
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search products or SKU"
                />
              </div>
              <span className="num hidden text-[10px] text-[rgb(var(--ink-rgb)/0.25)] sm:block">
                {filtered.length} items
              </span>
            </div>

            <div className="scroll-thin mt-3 flex gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="cat-chip"
                  data-active={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductTile key={product.id} product={product} onAdd={() => addItem(product.id)} />
              ))}
            </div>
            {!filtered.length && (
              <div className="mt-6 rounded-xl border border-dashed border-[rgb(var(--ink-rgb)/0.10)] py-10 text-center text-[12px] text-[rgb(var(--ink-rgb)/0.35)]">
                No products match “{query}”.
              </div>
            )}
          </section>

          <aside className="panel flex h-fit flex-col p-4 xl:sticky xl:top-[84px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={15} className="text-[rgb(var(--ink-rgb)/0.55)]" />
                <h2 className="section-title">Current order</h2>
                <span className="chip !h-5 !px-1.5 !text-[10px]">{cart.reduce((n, l) => n + l.qty, 0)}</span>
              </div>
              {lines.length > 0 && (
                <IconButton aria-label="Clear order" onClick={clearCart}>
                  <Trash2 size={14} />
                </IconButton>
              )}
            </div>

            <div className="mt-3">
              <Select
                label="Order for"
                value={cartTarget ?? "walk-in"}
                onChange={(event) =>
                  setCartTarget(event.currentTarget.value === "walk-in" ? null : event.currentTarget.value)
                }
                options={[
                  { value: "walk-in", label: "Walk-in counter" },
                  ...stations
                    .filter((s) => s.status !== "maintenance")
                    .map((s) => ({
                      value: s.id,
                      label: `${s.id} · ${
                        s.member ??
                        (s.status === "available"
                          ? "Available"
                          : s.status === "reserved"
                            ? "Reserved"
                            : "Session")
                      }`,
                    })),
                ]}
              />
              {targetMember && (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.03)] px-2.5 py-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] text-[rgb(var(--ink-rgb)/0.45)]">
                    <Sparkles size={11} />
                    {targetMember.tier} member · {usd(targetMember.balance)} balance
                  </span>
                  <span className="num text-[10px]" style={{ color: "var(--theme-secondary)" }}>
                    −{Math.round(discountRate * 100)}%
                  </span>
                </div>
              )}
            </div>

            <div className="scroll-thin mt-3 max-h-[310px] flex-1 space-y-1 overflow-y-auto pr-0.5">
              {!lines.length && (
                <div className="grid place-items-center rounded-xl border border-dashed border-[rgb(var(--ink-rgb)/0.10)] px-4 py-12 text-center">
                  <Receipt size={20} className="mb-2 text-[rgb(var(--ink-rgb)/0.20)]" />
                  <p className="text-[12px] text-[rgb(var(--ink-rgb)/0.40)]">Cart is empty</p>
                  <p className="mt-0.5 text-[10px] text-[rgb(var(--ink-rgb)/0.22)]">Tap a product to add it</p>
                </div>
              )}
              {lines.map((line) => (
                <div
                  key={line.productId}
                  className="flex items-center gap-2.5 rounded-xl border border-transparent px-1.5 py-2 transition hover:border-[rgb(var(--ink-rgb)/0.08)] hover:bg-[rgb(var(--ink-rgb)/0.03)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-[rgb(var(--ink-rgb)/0.80)]">
                      {line.product!.name}
                    </p>
                    <p className="num text-[10px] text-[rgb(var(--ink-rgb)/0.32)]">
                      {usd(line.product!.price)} · {line.product!.sku}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`Remove one ${line.product!.name}`}
                      className="grid size-6 place-items-center rounded-md border border-[rgb(var(--ink-rgb)/0.10)] bg-[rgb(var(--ink-rgb)/0.05)] text-[rgb(var(--ink-rgb)/0.60)] transition hover:bg-[rgb(var(--ink-rgb)/0.10)] active:scale-95"
                      onClick={() => decItem(line.productId)}
                    >
                      <Minus size={11} />
                    </button>
                    <span className="num w-4 text-center text-[11px] text-[rgb(var(--ink-rgb)/0.75)]">{line.qty}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${line.product!.name}`}
                      className="grid size-6 place-items-center rounded-md border border-[rgb(var(--ink-rgb)/0.10)] bg-[rgb(var(--ink-rgb)/0.05)] text-[rgb(var(--ink-rgb)/0.60)] transition hover:bg-[rgb(var(--ink-rgb)/0.10)] active:scale-95"
                      onClick={() => addItem(line.productId)}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  <span className="num w-12 text-right text-[11px] text-[rgb(var(--ink-rgb)/0.70)]">
                    {usd(line.product!.price * line.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-1.5 border-t border-[rgb(var(--ink-rgb)/0.08)] pt-3 text-[11px]">
              <div className="flex justify-between text-[rgb(var(--ink-rgb)/0.40)]">
                <span>Subtotal</span>
                <span className="num">{usd(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[rgb(var(--ink-rgb)/0.40)]">
                <span>Member discount</span>
                <span className="num" style={{ color: discount ? "#4ade80" : undefined }}>
                  {discount ? `−${usd(discount)}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-[rgb(var(--ink-rgb)/0.40)]">
                <span>Tax 8%</span>
                <span className="num">{usd(tax)}</span>
              </div>
              <div className="flex items-baseline justify-between pt-1.5">
                <span className="text-[12px] font-medium text-[rgb(var(--ink-rgb)/0.75)]">Total</span>
                <span className="num text-[20px] font-medium tracking-tight text-[rgb(var(--ink-rgb)/0.95)]">
                  {usd(total)}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <Select
                label="Payment method"
                value={payment}
                onChange={(event) => setPayment(event.currentTarget.value)}
                options={[
                  { value: "Card", label: "Card terminal" },
                  { value: "Cash", label: "Cash drawer" },
                  { value: "Member Balance", label: "Member balance" },
                  { value: "PC Tab", label: "Charge to PC tab" },
                ]}
              />
            </div>

            <Button
              variant="primary"
              className="mt-3 w-full"
              disabled={!lines.length}
              onClick={handleCheckout}
              leadingIcon={<ShoppingBag size={15} />}
            >
              Checkout · {usd(total)}
            </Button>
          </aside>
        </div>
      ) : (
        <FloorEditor />
      )}
    </div>
  );
}
