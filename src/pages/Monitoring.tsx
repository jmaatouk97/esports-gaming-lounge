import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  SegmentedControl,
  Tabs,
  useToast,
} from "open-glass-ui";
import {
  Activity,
  Cpu,
  Gauge,
  HardDrive,
  Lock,
  MessageSquare,
  Power,
  RefreshCw,
  RotateCcw,
  ServerCog,
  Wifi,
  Wrench,
} from "lucide-react";
import { PageHeader, SectionHead, StatusPill } from "../components/Bits";
import { alerts, specs, type HardwareAlert } from "../data";
import { useApp } from "../store";
import { useThemePreset } from "../theme";

function Sparkline({ seed }: { seed: number }) {
  const values = Array.from({ length: 14 }, (_, index) => {
    const v = Math.sin((index + seed) * 1.7) * 0.5 + Math.sin((index + seed) * 0.6) * 0.5;
    return 28 + Math.round((v + 1) * 16);
  });
  return (
    <div className="flex h-7 items-end gap-[2px]" aria-hidden="true">
      {values.map((height, index) => (
        <span
          key={index}
          className="w-[3px] rounded-sm"
          style={{
            height: `${height}%`,
            background:
              index === values.length - 1
                ? "var(--theme-secondary)"
                : "color-mix(in srgb, var(--theme-primary) 38%, transparent)",
          }}
        />
      ))}
    </div>
  );
}

function HealthBar({
  label,
  value,
  max = 100,
  suffix = "%",
  warn = false,
}: {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/7 bg-white/2 px-3 py-2.5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[10px] text-white/40">{label}</span>
        <span className="num text-[11px] text-white/75">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, (value / max) * 100)}%`,
            background: warn ? "#fbbf24" : "var(--theme-primary)",
          }}
        />
      </div>
    </div>
  );
}

const KIND_ICON = {
  Storage: HardDrive,
  Network: Wifi,
  Crash: Activity,
  Thermal: Gauge,
  Power: Power,
};

export default function Monitoring() {
  const { toast } = useToast();
  const { preset } = useThemePreset();
  const [primary, secondary] = preset.colors;
  const stations = useApp((s) => s.stations);
  const [tick, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState(stations[0]?.id ?? "MH-01");
  const [severity, setSeverity] = useState("All");
  const [resolved, setResolved] = useState<string[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 2200);
    return () => window.clearInterval(id);
  }, []);

  const selected = stations.find((s) => s.id === selectedId) ?? stations[0];
  const selectedIndex = Math.max(0, stations.findIndex((s) => s.id === selected.id));
  const jitter = (base: number, index: number) => {
    const delta = ((tick + index * 3) % 7) - 3;
    return Math.max(24, Math.min(96, base + delta));
  };

  const filteredAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          !resolved.includes(alert.id) &&
          (severity === "All" || alert.severity === severity.toLowerCase()),
      ),
    [severity, resolved],
  );

  const telemetryTab = (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(175px,1fr))]">
        {stations.map((station, index) => {
          const active = station.id === selected.id;
          return (
            <button
              key={station.id}
              type="button"
              onClick={() => setSelectedId(station.id)}
              className="rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5"
              style={{
                borderColor: active
                  ? "color-mix(in srgb, var(--theme-primary) 42%, transparent)"
                  : "var(--hairline)",
                background: active
                  ? "color-mix(in srgb, var(--theme-primary) 7%, rgb(255 255 255 / 0.02))"
                  : "rgb(255 255 255 / 0.028)",
                boxShadow: active
                  ? "inset 0 0 0 1px color-mix(in srgb, var(--theme-primary) 18%, transparent)"
                  : "none",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="num text-[12.5px] text-white/90">{station.id}</span>
                  <span
                    className="dot"
                    style={{
                      background:
                        station.status === "maintenance"
                          ? "#f87171"
                          : station.status === "available"
                            ? "#34d399"
                            : "var(--theme-primary)",
                    }}
                  />
                </div>
                <span className="num text-[10px] text-white/35">{station.telemetry.ping}ms</span>
              </div>
              <p className="mt-0.5 truncate text-[10px] text-white/30">
                {station.member ?? station.zone}
              </p>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-white/25">CPU</p>
                  <p className="num text-[17px] text-white/85">{jitter(station.telemetry.cpu, index)}°</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-white/25">GPU</p>
                  <p className="num text-[17px] text-white/85">{jitter(station.telemetry.gpu, index + 2)}°</p>
                </div>
                <Sparkline seed={index + tick} />
              </div>

              <div className="mt-3 flex gap-2 border-t border-white/6 pt-2 text-[9px] text-white/30">
                <span className="num">RAM {station.telemetry.ram}%</span>
                <span className="num">FPS {station.telemetry.fps}</span>
                <span className="num ml-auto">{station.telemetry.uptime}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 xl:sticky xl:top-[84px] xl:self-start">
        <div className="panel p-4">
          <div className="flex items-center justify-between">
            <SectionHead title={`Remote · ${selected.id}`} hint={selected.member ?? selected.zone} />
            <span className="flex items-center gap-1.5 text-[9px] text-white/30">
              <span className="dot dot-live" /> live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="inset-well p-2.5">
              <p className="text-[9px] uppercase tracking-[0.1em] text-white/30">CPU temp</p>
              <p className="num mt-1 text-[17px] text-white/90">
                {jitter(selected.telemetry.cpu, selectedIndex)}°C
              </p>
            </div>
            <div className="inset-well p-2.5">
              <p className="text-[9px] uppercase tracking-[0.1em] text-white/30">GPU temp</p>
              <p className="num mt-1 text-[17px] text-white/90">
                {jitter(selected.telemetry.gpu, selectedIndex + 2)}°C
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-white/40">VRAM</span>
                <span className="num text-white/65">{selected.telemetry.ram}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${selected.telemetry.ram}%`,
                    background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-white/40">Disk</span>
                <span className="num text-white/65">{selected.telemetry.disk}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
                <div
                  className="h-full rounded-full bg-white/25"
                  style={{ width: `${selected.telemetry.disk}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="small"
              leadingIcon={<Lock size={13} />}
              onClick={() => toast({ title: `Screen locked · ${selected.id}` })}
            >
              Lock
            </Button>
            <Button
              variant="secondary"
              size="small"
              leadingIcon={<RotateCcw size={13} />}
              onClick={() => toast({ title: `Restart queued · ${selected.id}`, description: "Guest warned · 60s" })}
            >
              Restart
            </Button>
            <Button
              variant="secondary"
              size="small"
              leadingIcon={<Power size={13} />}
              onClick={() => toast({ title: `Wake-on-LAN sent · ${selected.id}` })}
            >
              Wake
            </Button>
            <Button
              variant="secondary"
              size="small"
              leadingIcon={<MessageSquare size={13} />}
              onClick={() => toast({ title: `Message sent · ${selected.id}`, description: "Session ends in 15 min." })}
            >
              Message
            </Button>
          </div>
          <Button
            variant="primary"
            size="small"
            className="mt-2 w-full"
            leadingIcon={<Wrench size={13} />}
            onClick={() => toast({ title: "Technician dispatched", description: `${selected.id} · ETA 8 min` })}
          >
            Dispatch technician
          </Button>
        </div>

        <div className="panel p-4">
          <SectionHead title="Fleet health" hint="attention queue" />
          <div className="space-y-2">
            {alerts.slice(0, 4).map((alert) => {
              const Icon = KIND_ICON[alert.kind];
              return (
                <div key={alert.id} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-white/8 bg-white/4"
                    style={{
                      color:
                        alert.severity === "critical"
                          ? "#f87171"
                          : alert.severity === "warning"
                            ? "#fbbf24"
                            : "#94a3b8",
                    }}
                  >
                    <Icon size={11} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="num text-[10.5px] text-white/75">{alert.station}</span>
                      <span className="text-[9px] text-white/25">{alert.at}</span>
                    </div>
                    <p className="truncate text-[10px] text-white/35">{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const systemTab = (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-2">
        <SectionHead title="System inventory" hint={`${specs.length} representative nodes`} />
        <Button
          variant="quiet"
          size="small"
          leadingIcon={<RefreshCw size={13} />}
          onClick={() => toast({ title: "Inventory synced", description: "24 nodes · 2 changed" })}
        >
          Sync
        </Button>
      </div>
      <div className="scroll-thin overflow-x-auto">
        <table className="data-table min-w-[900px]">
          <thead>
            <tr>
              <th>Node</th>
              <th>CPU</th>
              <th>GPU</th>
              <th>Memory</th>
              <th>Storage</th>
              <th>OS</th>
              <th className="num">Disk use</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((row, index) => (
              <tr key={row.station}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="num text-[11.5px] text-white/85">{row.station}</span>
                    <span className="dot" style={{ background: index === 1 ? "#fbbf24" : "#34d399" }} />
                  </div>
                </td>
                <td className="num text-[11px]">{row.cpu}</td>
                <td className="num text-[11px]">{row.gpu}</td>
                <td className="num text-[11px]">{row.ram}</td>
                <td className="num text-[11px]">{row.storage}</td>
                <td className="text-[11px] text-white/45">{row.os}</td>
                <td className="num">
                  <div className="flex items-center justify-end gap-2">
                    <span className="h-1 w-16 overflow-hidden rounded-full bg-white/8">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${42 + index * 9}%`,
                          background: index > 3 ? "#fbbf24" : "var(--theme-primary)",
                        }}
                      />
                    </span>
                    <span className="w-7 text-right text-[10px] text-white/40">
                      {42 + index * 9}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-white/8 p-4">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <HealthBar label="Fleet temp" value={64} max={100} suffix="°C" />
          <HealthBar label="Disk budget" value={68} />
          <HealthBar label="Packet loss" value={4} suffix="%" warn />
          <HealthBar label="Patch coverage" value={92} />
        </div>
      </div>
    </div>
  );

  const alertsTab = (
    <div className="space-y-3">
      <Alert
        tone="danger"
        title="2 critical hardware faults need a technician"
        onDismiss={() => toast({ title: "Alert acknowledged" })}
      >
        VIP-03 GPU fan failure and MH-07 SSD wear are outside safe operating limits.
      </Alert>

      <div className="panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <SectionHead title="Attention queue" hint={`${filteredAlerts.length} open`} />
          <div className="w-[240px]">
            <SegmentedControl
              aria-label="Filter severity"
              value={severity}
              onValueChange={setSeverity}
              items={[
                { value: "All", label: "All" },
                { value: "Critical", label: "Critical" },
                { value: "Warning", label: "Warning" },
              ]}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          {filteredAlerts.map((alert) => {
            const Icon = KIND_ICON[alert.kind];
            return (
              <div
                key={alert.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/7 bg-white/2 px-3 py-2.5"
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/8"
                  style={{
                    color:
                      alert.severity === "critical"
                        ? "#f87171"
                        : alert.severity === "warning"
                          ? "#fbbf24"
                          : "#94a3b8",
                    background:
                      alert.severity === "critical"
                        ? "rgb(248 113 113 / 0.08)"
                        : "rgb(255 255 255 / 0.03)",
                  }}
                >
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="num text-[11.5px] text-white/85">{alert.station}</span>
                    <StatusPill
                      tone={
                        alert.severity === "critical"
                          ? "red"
                          : alert.severity === "warning"
                            ? "amber"
                            : "slate"
                      }
                    >
                      {alert.kind}
                    </StatusPill>
                  </div>
                  <p className="truncate text-[11px] text-white/40">{alert.message}</p>
                </div>
                <span className="text-[10px] text-white/25">{alert.at}</span>
                <Button
                  variant="secondary"
                  size="small"
                  leadingIcon={<Wrench size={12} />}
                  onClick={() => {
                    setResolved((rows) => [...rows, alert.id]);
                    toast({ title: "Work order created", description: `${alert.station} · ${alert.kind}` });
                  }}
                >
                  Dispatch
                </Button>
              </div>
            );
          })}
          {!filteredAlerts.length && (
            <div className="grid place-items-center gap-2 py-12 text-center">
              <ServerCog size={20} className="text-white/20" />
              <p className="text-[12px] text-white/40">Queue clear for this filter.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(Object.keys(KIND_ICON) as (keyof typeof KIND_ICON)[]).slice(0, 3).map((kind) => {
          const Icon = KIND_ICON[kind];
          return (
            <div key={kind} className="panel flex items-center gap-3 p-3.5">
              <span className="grid size-8 place-items-center rounded-lg border border-white/8 bg-white/4 text-white/50">
                <Icon size={14} />
              </span>
              <div>
                <p className="text-[10px] text-white/35">{kind} incidents · 7d</p>
                <p className="num mt-0.5 text-[15px] text-white/85">{kind === "Crash" ? 9 : kind === "Network" ? 4 : 2}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="Systems"
        title="Monitoring & control"
        meta={
          <span className="flex items-center gap-2">
            <span className="dot dot-live" />
            24 nodes · telemetry every 2s · 12ms median
          </span>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="small"
              leadingIcon={<RefreshCw size={14} />}
              onClick={() => setTick((t) => t + 1)}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="small"
              leadingIcon={<Cpu size={14} />}
              onClick={() => toast({ title: "Diagnostics started", description: "24 nodes · ~40s" })}
            >
              Run diagnostics
            </Button>
          </>
        }
      />

      <section className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Online nodes", value: "24/24", foot: "0 offline · 3 maintenance" },
          { label: "Median ping", value: "12ms", foot: "p95 24ms" },
          { label: "Avg GPU temp", value: "58°C", foot: "2 above policy" },
          { label: "Open faults", value: "6", foot: "2 critical · 3 warning" },
        ].map((stat) => (
          <div key={stat.label} className="panel p-4">
            <p className="text-[11px] text-white/40">{stat.label}</p>
            <p className="metric mt-2">{stat.value}</p>
            <p className="mt-2 text-[10px] text-white/28">{stat.foot}</p>
          </div>
        ))}
      </section>

      <Tabs
        label="Monitoring views"
        defaultValue="telemetry"
        items={[
          { value: "telemetry", label: "Live telemetry", content: telemetryTab },
          { value: "system", label: "System", content: systemTab },
          { value: "alerts", label: "Stats & alerts", content: alertsTab },
        ]}
      />
    </div>
  );
}
