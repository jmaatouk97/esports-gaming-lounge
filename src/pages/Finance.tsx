import { useState } from "react";
import {
  Button,
  Card,
  Dialog,
  SegmentedControl,
  Stat,
  useToast,
} from "open-glass-ui";
import {
  ArrowUpRight,
  CircleDollarSign,
  Download,
  FileText,
  HandCoins,
  Landmark,
  ReceiptText,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, SectionHead, StatusPill, Trend, usd } from "../components/Bits";
import { loans, paymentMix, revenueSeries, shifts } from "../data";
import { useThemePreset } from "../theme";

export default function Finance() {
  const { toast } = useToast();
  const { preset } = useThemePreset();
  const [primary, secondary] = preset.colors;
  const [range, setRange] = useState("14d");
  const [viewing, setViewing] = useState<(typeof shifts)[number] | null>(null);
  const [ledger, setLedger] = useState(loans);

  const outstanding = ledger.reduce((sum, loan) => sum + loan.amount, 0);

  const stats = [
    { label: "Gross revenue", value: usd(67020, 0), change: <Trend value="14.2%" />, foot: "Nov 01 – Nov 14" },
    { label: "Net profit", value: usd(23840, 0), change: <Trend value="9.8%" />, foot: "35.6% margin" },
    { label: "Avg. ticket", value: usd(18.42), change: <Trend value="3.1%" />, foot: "1,284 transactions" },
    { label: "Outstanding debt", value: usd(outstanding), change: <Trend value="2 overdue" positive={false} />, foot: `${ledger.length} open accounts` },
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Finance"
        title="Reports & ledger"
        meta="Fiscal period Nov 2026 · shift SH-116 open"
        actions={
          <>
            <Button
              variant="secondary"
              size="small"
              leadingIcon={<Download size={14} />}
              onClick={() => toast({ title: "P&L exported", description: "nov-2026-pl.xlsx · 148 KB" })}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="small"
              leadingIcon={<Landmark size={14} />}
              onClick={() => toast({ title: "Shift close queued", description: "SH-116 · awaiting cash count" })}
            >
              Close shift
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="panel p-4">
            <Stat label={stat.label} value={stat.value} change={stat.change} />
            <p className="mt-2.5 text-[11px] text-white/32">{stat.foot}</p>
          </div>
        ))}
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.6fr_1fr]">
        <div className="panel p-5">
          <SectionHead
            title="Revenue vs. operating cost"
            hint="USD"
            actions={
              <div className="w-[168px]">
                <SegmentedControl
                  aria-label="Chart range"
                  value={range}
                  onValueChange={setRange}
                  items={[
                    { value: "7d", label: "7D" },
                    { value: "14d", label: "14D" },
                    { value: "30d", label: "30D" },
                  ]}
                />
              </div>
            }
          />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={range === "7d" ? revenueSeries.slice(-7) : revenueSeries}
                margin={{ top: 6, right: 4, bottom: 0, left: -16 }}
                barGap={2}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 6" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} dy={8} interval="preserveStartEnd" minTickGap={32} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={54}
                  ticks={[0, 2000, 4000, 6000]}
                  tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  cursor={{ fill: "rgb(255 255 255 / 0.03)" }}
                  contentStyle={{
                    background: "#0b0e14",
                    border: "1px solid rgb(255 255 255 / 0.12)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [usd(Number(value), 0), String(name)]}
                />
                <Bar dataKey="revenue" name="Revenue" fill={primary} radius={[3, 3, 0, 0]} maxBarSize={16} />
                <Bar dataKey="expenses" name="Cost" fill={secondary} fillOpacity={0.35} radius={[3, 3, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <SectionHead title="Payment mix" hint="today" />
          <div className="flex items-center gap-3">
            <div className="h-[168px] w-[168px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {paymentMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0b0e14",
                      border: "1px solid rgb(255 255 255 / 0.12)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(value) => `${Number(value)}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              {paymentMix.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full" style={{ background: entry.color }} />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-white/50">{entry.name}</span>
                  <span className="num text-[11px] text-white/80">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[11px]">
            <span className="text-white/40">Settled today</span>
            <span className="num text-white/80">{usd(3198.4)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-white/40">Pending tabs</span>
            <span className="num text-white/80">{usd(342.8)}</span>
          </div>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_1fr]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 pb-2">
            <SectionHead title="Shift & Z-reports" hint="Nov 14" />
            <Button
              variant="quiet"
              size="small"
              leadingIcon={<FileText size={13} />}
              onClick={() => toast({ title: "Z-report generated", description: "All shifts · Nov 14" })}
            >
              Z-report
            </Button>
          </div>
          <div className="scroll-thin overflow-x-auto">
            <table className="data-table min-w-[560px]">
              <thead>
                <tr>
                  <th>Shift</th>
                  <th>Staff</th>
                  <th className="num">Cash</th>
                  <th className="num">Card</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id}>
                    <td>
                      <p className="text-[12px] font-medium text-white/85">{shift.label}</p>
                      <p className="num text-[9.5px] text-white/28">{shift.window}</p>
                    </td>
                    <td className="text-[11px] text-white/50">{shift.staff}</td>
                    <td className="num">{usd(shift.cash)}</td>
                    <td className="num">{usd(shift.card)}</td>
                    <td>
                      <StatusPill tone={shift.status === "open" ? "blue" : "green"}>
                        {shift.status === "open" ? "Open" : "Closed"}
                      </StatusPill>
                    </td>
                    <td className="text-right">
                      <Button variant="quiet" size="small" onClick={() => setViewing(shift)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 pb-2">
            <SectionHead title="Loans & debt" hint={`${usd(outstanding)} open`} />
            <HandCoins size={14} className="text-white/30" />
          </div>
          <div className="divide-y divide-white/6">
            {ledger.length === 0 && (
              <p className="px-4 py-8 text-center text-[11px] text-white/35">No open balances.</p>
            )}
            {ledger.map((loan) => (
              <div key={loan.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-white/80">{loan.member}</p>
                  <p className="num text-[9.5px] text-white/28">
                    {loan.id} · due {loan.due}
                  </p>
                </div>
                <StatusPill tone={loan.status === "overdue" ? "red" : "amber"}>
                  {loan.status}
                </StatusPill>
                <span className="num w-14 text-right text-[12px] text-white/80">
                  {usd(loan.amount)}
                </span>
                <Button
                  variant="quiet"
                  size="small"
                  onClick={() => {
                    setLedger((rows) => rows.filter((row) => row.id !== loan.id));
                    toast({
                      title: "Debt settled",
                      description: `${loan.member} · ${usd(loan.amount)}`,
                    });
                  }}
                >
                  Settle
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-white/8 px-4 py-2.5">
            <span className="text-[10px] text-white/35">Recovery rate</span>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-300/90">
              <ArrowUpRight size={11} /> 78% within 7 days
            </span>
          </div>
        </div>
      </section>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { icon: CircleDollarSign, label: "Cash position", value: usd(12480), foot: "all drawers reconciled" },
          { icon: ReceiptText, label: "Unbilled PC tabs", value: usd(342.8), foot: "8 active sessions" },
          { icon: Landmark, label: "Payroll (Nov)", value: usd(18600), foot: "due Nov 30" },
        ].map((item) => (
          <Card key={item.label} className="!p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-white/8 bg-white/4 text-white/50">
                <item.icon size={16} />
              </span>
              <div>
                <p className="text-[10px] text-white/35">{item.label}</p>
                <p className="num mt-0.5 text-[16px] text-white/90">{item.value}</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-white/28">{item.foot}</p>
          </Card>
        ))}
      </div>

      <Dialog
        title={`Z-report · ${viewing?.label ?? ""}`}
        description={viewing ? `${viewing.id} · ${viewing.staff} · ${viewing.window}` : undefined}
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        {viewing && (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/8 bg-white/3 p-3">
              {[
                ["Cash", viewing.cash],
                ["Card", viewing.card],
                ["PC tabs", viewing.tab],
                ["Variance", viewing.variance],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between py-1 text-[12px]">
                  <span className="text-white/40">{label}</span>
                  <span className="num text-white/85">{usd(Number(value))}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-white/8 pt-2 text-[13px]">
                <span className="text-white/60">Total</span>
                <span className="num text-white/95">
                  {usd(viewing.cash + viewing.card + viewing.tab)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                leadingIcon={<Download size={14} />}
                onClick={() => toast({ title: "PDF queued", description: `${viewing.id}-zreport.pdf` })}
              >
                Download
              </Button>
              <Button variant="primary" onClick={() => setViewing(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
