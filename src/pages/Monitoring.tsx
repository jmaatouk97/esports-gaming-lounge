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
  Pause,
  Play,
  Power,
  RefreshCw,
  RotateCcw,
  ServerCog,
  Wifi,
  Wrench,
} from "lucide-react";
import { PageHeader, SectionHead, StatusPill } from "../components/Bits";
import { alerts, specs, type HardwareAlert, type Station } from "../data";
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
    <div className="rounded-xl border border-[rgb(var(--ink-rgb)/0.07)] bg-[rgb(var(--ink-rgb)/0.02)] px-3 py-2.5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.40)]">{label}</span>
        <span className="num text-[11px] text-[rgb(var(--ink-rgb)/0.75)]">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[rgb(var(--ink-rgb)/0.08)]">
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

const STATUS_TONE: Record<string, string> = {
  available: "#34d399",
  "in-use": "var(--theme-primary)",
  reserved: "#f59e0b",
  maintenance: "#f87171",
};

function StationTile({
  station,
  active,
  density,
  view,
  tick,
  onSelect,
}: {
  station: Station;
  active: boolean;
  density: "compact" | "standard" | "detailed";
  view: "telemetry" | "thumbnails";
  tick: number;
  onSelect: () => void;
}) {
  const tone = STATUS_TONE[station.status];
  const tone2 = station.status === "maintenance" ? "#f87171" : "var(--theme-secondary)";

  if (view === "thumbnails") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="group relative overflow-hidden rounded-xl border text-left transition hover:-translate-y-0.5"
        style={{
          borderColor: active ? "color-mix(in srgb, var(--theme-primary) 55%, transparent)" : "var(--hairline)",
          boxShadow: active ? "0 0 0 1px color-mix(in srgb, var(--theme-primary) 35%, transparent)" : "none",
          height: 128,
          background: "#0a0d15",
        }}
        aria-label={`${station.id} live preview`}
      >
        <span
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${120 + (tick % 8) * 3}deg, color-mix(in srgb, ${tone2} 36%, transparent), transparent 55%), radial-gradient(circle at ${30 + (tick % 5) * 7}% 20%, color-mix(in srgb, var(--theme-primary) 30%, transparent), transparent 50%), #0a0d15`,
            filter: "saturate(1.1)",
          }}
        />
        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
        <span className="absolute left-2.5 top-2 flex items-center gap-1.5 text-[9px] font-semibold text-white/80">
          <span className="dot" style={{ background: tone }} />
          {station.id}
        </span>
        <span className="absolute right-2.5 top-2 rounded bg-black/45 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.1em] text-white/55">
          {station.status === "available" ? "READY" : station.status}
        </span>
        <span className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-[10.5px] font-medium text-white/90">
              {station.member ?? "Vacant"}
            </span>
            <span className="num block text-[9px] text-white/45">{station.game}</span>
          </span>
          <span className="num text-[10px] text-white/80">
            {station.endsAt
              ? `${String(Math.max(0, Math.floor((station.endsAt - Date.now()) / 60000))).padStart(2, "0")}m`
              : "—"}
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-2xl border p-3 text-left transition hover:-translate-y-0.5"
      style={{
        borderColor: active
          ? "color-mix(in srgb, var(--theme-primary) 42%, transparent)"
          : "var(--hairline)",
        background: active
          ? "color-mix(in srgb, var(--theme-primary) 7%, rgb(var(--ink-rgb) / 0.02))"
          : "rgb(var(--ink-rgb) / 0.028)",
        boxShadow: active
          ? "inset 0 0 0 1px color-mix(in srgb, var(--theme-primary) 18%, transparent)"
          : "none",
        padding: density === "compact" ? 9 : density === "detailed" ? 14 : 12,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="num text-[12px] font-medium text-[rgb(var(--ink-rgb)/0.9)]">{station.id}</span>
          <span className="dot" style={{ background: tone }} />
        </div>
        <span className="num text-[9.5px] text-[rgb(var(--ink-rgb)/0.35)]">{station.telemetry.ping}ms</span>
      </div>
      <p className="mt-0.5 truncate text-[9.5px] text-[rgb(var(--ink-rgb)/0.32)]">
        {station.member ?? station.zone} · {station.game}
      </p>

      {density === "compact" ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="num text-[12px] text-[rgb(var(--ink-rgb)/0.8)]">{station.telemetry.cpu}°</span>
          <span className="num text-[10px] text-[rgb(var(--ink-rgb)/0.45)]">/ {station.telemetry.gpu}° GPU</span>
          <span className="dot" style={{ background: station.status === "available" ? "#34d399" : tone }} />
        </div>
      ) : (
        <>
          <div className="mt-2.5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.25)]">CPU</p>
              <p className="num text-[16px] text-[rgb(var(--ink-rgb)/0.85)]">{station.telemetry.cpu}°</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.25)]">GPU</p>
              <p className="num text-[16px] text-[rgb(var(--ink-rgb)/0.85)]">{station.telemetry.gpu}°</p>
            </div>
            <Sparkline seed={station.telemetry.cpu + tick} />
          </div>
          <div className="mt-2.5 flex gap-2 border-t border-[color:var(--hairline)] pt-2 text-[9px] text-[rgb(var(--ink-rgb)/0.3)]">
            <span className="num">RAM {station.telemetry.ram}%</span>
            <span className="num">FPS {station.telemetry.fps}</span>
            {density === "detailed" && <span className="num">DSK {station.telemetry.disk}%</span>}
            <span className="num ml-auto">{station.telemetry.uptime}</span>
          </div>
        </>
      )}
    </button>
  );
}

export default function Monitoring() {
  const { toast } = useToast();
  const { preset } = useThemePreset();
  const [primary, secondary] = preset.colors;
  const stations = useApp((s) => s.stations);
  const density = useApp((s) => s.density);
  const setDensity = useApp((s) => s.setDensity);
  const monitorView = useApp((s) => s.monitorView);
  const setMonitorView = useApp((s) => s.setMonitorView);
  const thumbInterval = useApp((s) => s.thumbInterval);
  const setThumbInterval = useApp((s) => s.setThumbInterval);
  const thumbPaused = useApp((s) => s.thumbPaused);
  const toggleThumbPaused = useApp((s) => s.toggleThumbPaused);
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
      <div className="space-y-3">
        <div className="panel flex flex-wrap items-center justify-between gap-3 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Station grid</span>
            <div className="flex rounded-lg border border-[color:var(--hairline)] p-0.5">
              {(["compact", "standard", "detailed"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDensity(item)}
                  className="rounded-md px-2 py-1 text-[10px] capitalize transition"
                  style={{
                    background:
                      density === item
                        ? "color-mix(in srgb, var(--theme-primary) 18%, transparent)"
                        : "transparent",
                    color: density === item ? "var(--ink)" : "var(--muted)",
                  }}
                  aria-pressed={density === item}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-[color:var(--hairline)] p-0.5">
              {(["telemetry", "thumbnails"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMonitorView(item)}
                  className="rounded-md px-2 py-1 text-[10px] capitalize transition"
                  style={{
                    background:
                      monitorView === item
                        ? "color-mix(in srgb, var(--theme-primary) 18%, transparent)"
                        : "transparent",
                    color: monitorView === item ? "var(--ink)" : "var(--muted)",
                  }}
                  aria-pressed={monitorView === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">
            <span>{stations.length} stations</span>
            <span className="h-3 w-px bg-[color:var(--hairline-strong)]" />
            <span>{stations.filter((s) => s.status === "in-use").length} in session</span>
            {monitorView === "thumbnails" && (
              <>
                <span className="h-3 w-px bg-[color:var(--hairline-strong)]" />
                <button
                  type="button"
                  onClick={toggleThumbPaused}
                  className="flex items-center gap-1 rounded-md border border-[color:var(--hairline)] px-1.5 py-0.5 transition hover:bg-[rgb(var(--ink-rgb)/0.05)]"
                >
                  {thumbPaused ? <Play size={9} /> : <Pause size={9} />}
                  {thumbPaused ? "Resume" : "Pause"}
                </button>
                <select
                  value={thumbInterval}
                  onChange={(event) => setThumbInterval(Number(event.target.value))}
                  className="rounded-md border border-[color:var(--hairline)] bg-transparent px-1 py-0.5 text-[10px] outline-none"
                  aria-label="Thumbnail refresh interval"
                >
                  {[3, 5, 10, 30].map((value) => (
                    <option key={value} value={value} className="bg-[#0b0f18]">
                      {value}s
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        <div
          className={
            monitorView === "thumbnails"
              ? "grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(190px,1fr))]"
              : density === "compact"
                ? "grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(112px,1fr))]"
                : density === "detailed"
                  ? "grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(196px,1fr))]"
                  : "grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(158px,1fr))]"
          }
        >
          {stations.map((station) => (
            <StationTile
              key={station.id}
              station={station}
              active={station.id === selected.id}
              density={density}
              view={thumbPaused && monitorView === "thumbnails" ? "telemetry" : monitorView}
              tick={thumbPaused ? 2 : tick}
              onSelect={() => setSelectedId(station.id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 xl:sticky xl:top-[84px] xl:self-start">
        <div className="panel p-4">
          <div className="flex items-center justify-between">
            <SectionHead title={`Remote · ${selected.id}`} hint={selected.member ?? selected.zone} />
            <span className="flex items-center gap-1.5 text-[9px] text-[rgb(var(--ink-rgb)/0.30)]">
              <span className="dot dot-live" /> live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="inset-well p-2.5">
              <p className="text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.30)]">CPU temp</p>
              <p className="num mt-1 text-[17px] text-[rgb(var(--ink-rgb)/0.90)]">
                {jitter(selected.telemetry.cpu, selectedIndex)}°C
              </p>
            </div>
            <div className="inset-well p-2.5">
              <p className="text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.30)]">GPU temp</p>
              <p className="num mt-1 text-[17px] text-[rgb(var(--ink-rgb)/0.90)]">
                {jitter(selected.telemetry.gpu, selectedIndex + 2)}°C
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-[rgb(var(--ink-rgb)/0.40)]">VRAM</span>
                <span className="num text-[rgb(var(--ink-rgb)/0.65)]">{selected.telemetry.ram}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--ink-rgb)/0.07)]">
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
                <span className="text-[rgb(var(--ink-rgb)/0.40)]">Disk</span>
                <span className="num text-[rgb(var(--ink-rgb)/0.65)]">{selected.telemetry.disk}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--ink-rgb)/0.07)]">
                <div
                  className="h-full rounded-full bg-[rgb(var(--ink-rgb)/0.25)]"
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
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.04)]"
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
                      <span className="num text-[10.5px] text-[rgb(var(--ink-rgb)/0.75)]">{alert.station}</span>
                      <span className="text-[9px] text-[rgb(var(--ink-rgb)/0.25)]">{alert.at}</span>
                    </div>
                    <p className="truncate text-[10px] text-[rgb(var(--ink-rgb)/0.35)]">{alert.message}</p>
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
                    <span className="num text-[11.5px] text-[rgb(var(--ink-rgb)/0.85)]">{row.station}</span>
                    <span className="dot" style={{ background: index === 1 ? "#fbbf24" : "#34d399" }} />
                  </div>
                </td>
                <td className="num text-[11px]">{row.cpu}</td>
                <td className="num text-[11px]">{row.gpu}</td>
                <td className="num text-[11px]">{row.ram}</td>
                <td className="num text-[11px]">{row.storage}</td>
                <td className="text-[11px] text-[rgb(var(--ink-rgb)/0.45)]">{row.os}</td>
                <td className="num">
                  <div className="flex items-center justify-end gap-2">
                    <span className="h-1 w-16 overflow-hidden rounded-full bg-[rgb(var(--ink-rgb)/0.08)]">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${42 + index * 9}%`,
                          background: index > 3 ? "#fbbf24" : "var(--theme-primary)",
                        }}
                      />
                    </span>
                    <span className="w-7 text-right text-[10px] text-[rgb(var(--ink-rgb)/0.40)]">
                      {42 + index * 9}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[rgb(var(--ink-rgb)/0.08)] p-4">
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
                className="flex flex-wrap items-center gap-3 rounded-xl border border-[rgb(var(--ink-rgb)/0.07)] bg-[rgb(var(--ink-rgb)/0.02)] px-3 py-2.5"
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-lg border border-[rgb(var(--ink-rgb)/0.08)]"
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
                        : "rgb(var(--ink-rgb) / 0.03)",
                  }}
                >
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="num text-[11.5px] text-[rgb(var(--ink-rgb)/0.85)]">{alert.station}</span>
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
                  <p className="truncate text-[11px] text-[rgb(var(--ink-rgb)/0.40)]">{alert.message}</p>
                </div>
                <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.25)]">{alert.at}</span>
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
              <ServerCog size={20} className="text-[rgb(var(--ink-rgb)/0.20)]" />
              <p className="text-[12px] text-[rgb(var(--ink-rgb)/0.40)]">Queue clear for this filter.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(Object.keys(KIND_ICON) as (keyof typeof KIND_ICON)[]).slice(0, 3).map((kind) => {
          const Icon = KIND_ICON[kind];
          return (
            <div key={kind} className="panel flex items-center gap-3 p-3.5">
              <span className="grid size-8 place-items-center rounded-lg border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.04)] text-[rgb(var(--ink-rgb)/0.50)]">
                <Icon size={14} />
              </span>
              <div>
                <p className="text-[10px] text-[rgb(var(--ink-rgb)/0.35)]">{kind} incidents · 7d</p>
                <p className="num mt-0.5 text-[15px] text-[rgb(var(--ink-rgb)/0.85)]">{kind === "Crash" ? 9 : kind === "Network" ? 4 : 2}</p>
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
            <p className="text-[11px] text-[rgb(var(--ink-rgb)/0.40)]">{stat.label}</p>
            <p className="metric mt-2">{stat.value}</p>
            <p className="mt-2 text-[10px] text-[rgb(var(--ink-rgb)/0.28)]">{stat.foot}</p>
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
