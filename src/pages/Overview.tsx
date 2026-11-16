import { useNavigate } from "react-router-dom";
import { Button, Stat, Tooltip as GlassTooltip } from "open-glass-ui";
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Download,
  Radio,
  TriangleAlert,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, SectionHead, StatusPill, Trend, usd } from "../components/Bits";
import { activity, alerts, revenueSeries, topProducts } from "../data";
import { useApp } from "../store";
import { useThemePreset } from "../theme";

export default function Overview() {
  const navigate = useNavigate();
  const stations = useApp((s) => s.stations);
  const active = stations.filter((s) => s.status === "in-use").length;
  const occupancy = Math.round((active / stations.length) * 100);
  const zoneLoad = ["Main Hall", "VIP Room", "Console Zone"].map((zone) => {
    const nodes = stations.filter((s) => s.zone === zone);
    return {
      zone,
      total: nodes.length,
      busy: nodes.filter((s) => s.status === "in-use").length,
    };
  });
  const { preset } = useThemePreset();
  const [primary, secondary] = preset.colors;

  const stats = [
    {
      label: "Net revenue · today",
      value: usd(4286.5),
      change: <Trend value="12.4%" />,
      foot: "vs. $3,812 yesterday",
    },
    {
      label: "Occupancy",
      value: `${occupancy}%`,
      change: <Trend value="8.1%" />,
      foot: `${active} of ${stations.length} stations live`,
    },
    {
      label: "Avg. session",
      value: "3h 42m",
      change: <Trend value="2.3%" positive={false} />,
      foot: "Peak window 18:00–22:00",
    },
    {
      label: "Open tabs",
      value: usd(342.8),
      change: <Trend value="6 tabs" />,
      foot: "2 overdue · $41.25",
    },
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Admin / Live"
        title="Floor overview"
        meta={
          <span className="flex items-center gap-2">
            <span className="dot dot-live" />
            Sat 14 Nov · telemetry streaming · 2s refresh
          </span>
        }
        actions={
          <>
            <Button variant="secondary" size="small" leadingIcon={<Download size={14} />}>
              Export
            </Button>
            <Button
              variant="primary"
              size="small"
              trailingIcon={<ArrowUpRight size={14} />}
              onClick={() => navigate("/cafe")}
            >
              Open floor
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="panel p-4">
            <Stat label={stat.label} value={stat.value} change={stat.change} />
            <p className="mt-2.5 text-[11px] text-[rgb(var(--ink-rgb)/0.32)]">{stat.foot}</p>
          </div>
        ))}
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.7fr_1fr]">
        <div className="panel p-5">
          <SectionHead
            title="Revenue & expenses"
            actions={
              <div className="flex items-center gap-3 text-[10px] text-[rgb(var(--ink-rgb)/0.40)]">
                <span className="hidden text-[rgb(var(--ink-rgb)/0.30)] sm:inline">14 days</span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full" style={{ background: primary }} />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full" style={{ background: secondary }} />
                  Expenses
                </span>
              </div>
            }
          />
          <div className="h-[252px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={primary} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={secondary} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  contentStyle={{
                    background: "#0b0e14",
                    border: "1px solid rgb(var(--ink-rgb) / 0.12)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "rgb(var(--ink-rgb) / 0.5)", fontSize: 10 }}
                  formatter={(value, name) => [usd(Number(value), 0), String(name)]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={primary}
                  strokeWidth={2}
                  fill="url(#revFill)"
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke={secondary}
                  strokeWidth={1.25}
                  strokeDasharray="4 4"
                  fill="url(#expFill)"
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <SectionHead title="Zone load" hint={`${occupancy}% live`} />
          <div className="space-y-5 pt-1">
            {zoneLoad.map((zone) => {
              const pct = (zone.busy / zone.total) * 100;
              return (
                <div key={zone.zone}>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-[12px] font-medium text-[rgb(var(--ink-rgb)/0.75)]">{zone.zone}</span>
                    <span className="num text-[11px] text-[rgb(var(--ink-rgb)/0.40)]">
                      {zone.busy}
                      <span className="text-[rgb(var(--ink-rgb)/0.20)]">/{zone.total}</span>
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: zone.total }).map((_, index) => (
                      <div
                        key={index}
                        className="h-7 flex-1 rounded-[4px] border transition"
                        style={
                          index < zone.busy
                            ? {
                                background: `color-mix(in srgb, ${index < 2 ? secondary : primary} ${
                                  index < 3 ? 55 : 35
                                }%, transparent)`,
                                borderColor: `color-mix(in srgb, ${primary} 30%, transparent)`,
                                boxShadow:
                                  index < 2
                                    ? `inset 0 -8px 12px color-mix(in srgb, ${primary} 18%, transparent)`
                                    : "none",
                              }
                            : {
                                background: "rgb(var(--ink-rgb) / 0.025)",
                                borderColor: "rgb(var(--ink-rgb) / 0.06)",
                              }
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[rgb(var(--ink-rgb)/0.08)] pt-3">
            <span className="text-[11px] text-[rgb(var(--ink-rgb)/0.40)]">Peak today</span>
            <span className="num text-[12px] text-[rgb(var(--ink-rgb)/0.80)]">20:00 · 21/24</span>
          </div>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_1fr_0.85fr]">
        <div className="panel p-5">
          <SectionHead
            title="Live activity"
            hint="auto-refresh"
            actions={<Radio size={13} className="text-[rgb(var(--ink-rgb)/0.30)]" />}
          />
          <div className="space-y-0.5">
            {activity.slice(0, 5).map((row) => (
              <div
                key={row.id}
                className="flex items-center gap-3 rounded-lg px-1.5 py-2 transition hover:bg-[rgb(var(--ink-rgb)/0.04)]"
              >
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-md border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.04)] font-mono text-[8px] text-[rgb(var(--ink-rgb)/0.50)]"
                >
                  {row.at}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="num text-[11px] text-[rgb(var(--ink-rgb)/0.80)]">{row.station}</span>
                    <span className="truncate text-[11px] text-[rgb(var(--ink-rgb)/0.35)]">{row.detail}</span>
                  </div>
                  <p className="text-[10px] text-[rgb(var(--ink-rgb)/0.28)]">{row.member}</p>
                </div>
                <span className="num text-[11px] text-[rgb(var(--ink-rgb)/0.55)]">
                  {row.amount ? `+${usd(row.amount)}` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <SectionHead title="Top sellers" hint="today" />
          <div className="space-y-3 pt-1">
            {topProducts.map((product, index) => {
              const max = topProducts[0].revenue;
              return (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="num w-3 text-[10px] text-[rgb(var(--ink-rgb)/0.25)]">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[12px] text-[rgb(var(--ink-rgb)/0.75)]">{product.name}</span>
                      <span className="num text-[11px] text-[rgb(var(--ink-rgb)/0.45)]">{usd(product.revenue, 0)}</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[rgb(var(--ink-rgb)/0.06)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(product.revenue / max) * 100}%`,
                          background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel flex flex-col p-5">
          <SectionHead
            title="Attention"
            hint="3 faults"
            actions={<TriangleAlert size={13} className="text-amber-400/70" />}
          />
          <div className="flex-1 space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-[rgb(var(--ink-rgb)/0.06)] bg-[rgb(var(--ink-rgb)/0.02)] px-2.5 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="num text-[11px] text-[rgb(var(--ink-rgb)/0.80)]">{alert.station}</span>
                  <StatusPill tone={alert.severity === "critical" ? "red" : "amber"}>
                    {alert.kind}
                  </StatusPill>
                </div>
                <p className="mt-1 truncate text-[10px] text-[rgb(var(--ink-rgb)/0.38)]">{alert.message}</p>
              </div>
            ))}
          </div>
          <Button
            variant="quiet"
            size="small"
            className="mt-3 w-full"
            leadingIcon={<Activity size={13} />}
            trailingIcon={<ChevronRight size={13} />}
            onClick={() => navigate("/monitoring")}
          >
            Fleet health
          </Button>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between text-[10px] text-[rgb(var(--ink-rgb)/0.22)]">
        <span>Nexus OS · build 0.5.1</span>
        <span className="num">Latency 12ms · 24 nodes online</span>
      </div>
    </div>
  );
}
