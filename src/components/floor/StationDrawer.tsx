import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button, useToast } from "open-glass-ui";
import {
  AppWindow,
  ArrowRight,
  Ban,
  Clock3,
  Cpu,
  Gamepad2,
  HardDrive,
  Lock,
  LogOut,
  MessageSquare,
  MonitorPlay,
  Power,
  RefreshCw,
  Send,
  Thermometer,
  Unlock,
  UtensilsCrossed,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { specs, type Station } from "../../data";
import { useApp } from "../../store";
import { StatusPill } from "../Bits";

export function formatRemaining(endsAt?: number) {
  if (!endsAt) return "—";
  const ms = endsAt - Date.now();
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatElapsed(startsAt?: number) {
  if (!startsAt) return "00:00:00";
  const total = Math.max(0, Math.floor((Date.now() - startsAt) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Spark({ seed, color = "var(--theme-primary)" }: { seed: number; color?: string }) {
  const points = Array.from({ length: 24 }, (_, index) => {
    const v = Math.sin((index + seed) * 1.3) * 0.5 + Math.sin((index + seed) * 0.55) * 0.5;
    return 12 - (v + 1) * 5;
  });
  const path = points.map((y, index) => `${index === 0 ? "M" : "L"}${(index / 23) * 100},${y}`).join(" ");
  return (
    <svg viewBox="0 0 100 14" className="h-3.5 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" opacity="0.85" />
    </svg>
  );
}

function TelemetryRow({
  label,
  value,
  suffix,
  percent,
  tone,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  percent?: number;
  tone?: "warn" | "danger";
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.45)]">{label}</span>
        <span className="num text-[11.5px] text-[rgb(var(--ink-rgb)/0.8)]">
          {value}
          {suffix}
        </span>
      </div>
      {percent !== undefined && (
        <div className="mini-meter mt-1">
          <span
            style={{
              width: `${Math.min(100, percent)}%`,
              background:
                tone === "danger"
                  ? "#f87171"
                  : tone === "warn"
                    ? "#fbbf24"
                    : "var(--theme-primary)",
            }}
          />
        </div>
      )}
    </div>
  );
}

const TABS = ["Overview", "Telemetry", "Hardware", "History"] as const;

export function ConfirmDialog({
  open,
  title,
  detail,
  confirmLabel = "Confirm",
  danger = true,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  detail: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        className="glass-backdrop"
        style={{ zIndex: 80 }}
        aria-label="Cancel"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="fixed left-1/2 top-1/2 z-[85] w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[color:var(--hairline-strong)] p-5"
        style={{
          background: "color-mix(in srgb, var(--app-bg) 86%, transparent)",
          backdropFilter: "blur(30px) saturate(1.35)",
          boxShadow: "0 30px 90px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(var(--ink-rgb) / 0.1)",
          animation: "menu-pop 160ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className="grid size-9 place-items-center rounded-xl"
            style={{
              background: danger ? "rgb(248 113 113 / 0.14)" : "color-mix(in srgb, var(--theme-primary) 16%, transparent)",
              color: danger ? "#f87171" : "var(--theme-primary)",
            }}
          >
            {danger ? <Ban size={17} /> : <Zap size={17} />}
          </span>
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold">{title}</h3>
            <p className="mt-1 text-[11.5px] leading-relaxed text-[rgb(var(--ink-rgb)/0.5)]">{detail}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="quiet" size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} size="small" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </>
  );
}

export default function StationDrawer() {
  const { toast } = useToast();
  const drawerId = useApp((s) => s.drawerId);
  const closeStation = useApp((s) => s.closeStation);
  const stations = useApp((s) => s.stations);
  const members = useApp((s) => s.members);
  const extendSession = useApp((s) => s.extendSession);
  const endSession = useApp((s) => s.endSession);
  const startSession = useApp((s) => s.startSession);
  const lockStations = useApp((s) => s.lockStations);
  const setCafeMode = useApp((s) => s.setCafeMode);
  const setCartTarget = useApp((s) => s.setCartTarget);
  const pushNotification = useApp((s) => s.pushNotification);

  const station = stations.find((s) => s.id === drawerId);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [confirm, setConfirm] = useState<null | { title: string; detail: string; action: () => void }>(null);
  const [message, setMessage] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!station) return;
    setTab("Overview");
    setShowComposer(false);
    setMessage("");
    setConfirm(null);
  }, [station?.id]);

  useEffect(() => {
    if (!drawerId) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [drawerId]);

  useEffect(() => {
    if (!drawerId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (confirm) setConfirm(null);
        else closeStation();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerId, confirm, closeStation]);

  const member = useMemo(
    () => members.find((m) => m.name === station?.member),
    [members, station?.member],
  );

  if (!station) return null;

  const spec = specs.find((s) => s.station === station.id);
  const isActive = station.status === "in-use";
  const isOnline = station.status !== "maintenance";
  const simulated = true;

  const simulate = (label: string, detail: string) => {
    toast({
      title: `${label} queued · ${station.id}`,
      description: `${detail} · simulated, requires Windows client agent`,
      duration: 4200,
    });
    pushNotification({ title: `${label} · ${station.id}`, detail, tone: "info" });
  };

  const confirmEnd = () =>
    setConfirm({
      title: `End session on ${station.id}?`,
      detail: `${station.member ?? "Walk-in"} will be signed out and the station returned to the floor.`,
      action: () => {
        endSession(station.id);
        toast({ title: `Session ended · ${station.id}`, description: "Station is now available." });
      },
    });

  const history = [
    { at: "18:02", label: "PC powered on", tone: "#34d399" },
    { at: "18:04", label: "Client agent connected", tone: "#34d399" },
    ...(isActive
      ? [
          {
            at: new Date(station.startsAt ?? Date.now()).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            label: `Session started · ${station.member ?? "Walk-in"}`,
            tone: "var(--theme-primary)",
          },
          { at: "19:12", label: "Cafe order · 2 items", tone: "#f59e0b" },
          { at: "19:40", label: "+30 min added", tone: "var(--theme-secondary)" },
        ]
      : [{ at: "—", label: "No active session", tone: "#64748b" }]),
    ...(station.status === "maintenance"
      ? [{ at: "—", label: "Maintenance hold", tone: "#f87171" }]
      : []),
  ];

  return (
    <>
      <button
        type="button"
        aria-label="Close station details"
        className="glass-backdrop"
        onClick={closeStation}
      />
      <aside
        className="drawer-glass"
        role="dialog"
        aria-modal="true"
        aria-label={`Station ${station.id} details`}
      >
        <div className="drawer-hero">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="grid size-11 place-items-center rounded-2xl border border-[color:var(--hairline)]"
                style={{
                  background: "color-mix(in srgb, var(--theme-primary) 14%, transparent)",
                  color: "var(--theme-primary)",
                }}
              >
                {station.type === "console" ? <Gamepad2 size={19} /> : station.type === "stream" ? <MonitorPlay size={19} /> : <Cpu size={19} />}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="num text-[20px] font-semibold tracking-[-0.03em]">{station.id}</h2>
                  <span className="dot" style={{ background: isOnline ? "#34d399" : "#f87171" }} />
                  <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">
                    {isOnline ? "Online" : "Agent offline"}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[rgb(var(--ink-rgb)/0.45)]">
                  {station.zone} · {station.spec}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeStation}
              aria-label="Close drawer"
              className="grid size-8 place-items-center rounded-lg border border-[color:var(--hairline)] text-[rgb(var(--ink-rgb)/0.55)] transition hover:bg-[rgb(var(--ink-rgb)/0.06)]"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <StatusPill
              tone={
                station.status === "available"
                  ? "green"
                  : station.status === "in-use"
                    ? "blue"
                    : station.status === "reserved"
                      ? "amber"
                      : "red"
              }
            >
              {station.status === "in-use"
                ? "In session"
                : station.status === "available"
                  ? "Ready"
                  : station.status === "reserved"
                    ? "Reserved"
                    : "Maintenance"}
            </StatusPill>
            <span className="chip !h-6">
              <Wifi size={10} /> {station.telemetry.ping} ms
            </span>
            <span className="chip !h-6">Agent v2.8.1</span>
            {station.locked && (
              <span className="chip !h-6" style={{ color: "#fbbf24" }}>
                <Lock size={10} /> Locked
              </span>
            )}
          </div>

          <div className="mt-4 flex gap-1 rounded-xl border border-[color:var(--hairline)] p-1">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className="flex-1 rounded-lg py-1.5 text-[11px] font-medium transition"
                style={{
                  background:
                    tab === item ? "color-mix(in srgb, var(--theme-primary) 17%, transparent)" : "transparent",
                  color: tab === item ? "var(--ink)" : "var(--muted)",
                }}
                aria-pressed={tab === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="drawer-body">
          {tab === "Overview" && (
            <div className="space-y-4">
              <section className="rounded-2xl border border-[color:var(--hairline)] p-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid size-9 place-items-center rounded-full text-[12px] font-semibold"
                      style={{ background: "color-mix(in srgb, var(--theme-secondary) 22%, transparent)" }}
                    >
                      {(station.member ?? "WI").slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium">{station.member ?? "Walk-in guest"}</p>
                      <p className="text-[10px] text-[rgb(var(--ink-rgb)/0.42)]">
                        {member ? `${member.tier} member · ${member.id}` : "No linked membership"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="eyebrow">{isActive ? "Remaining" : "Session"}</p>
                    <p
                      className="num mt-0.5 text-[22px] font-medium tracking-[-0.04em]"
                      style={{ color: isActive ? "var(--theme-secondary)" : "var(--muted)" }}
                    >
                      {isActive ? formatRemaining(station.endsAt) : "READY"}
                    </p>
                    <p className="text-[9.5px] text-[rgb(var(--ink-rgb)/0.35)]">
                      {isActive ? "Package · hourly" : "Awaiting login"}
                    </p>
                  </div>
                </div>

                {isActive ? (
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[color:var(--hairline)] pt-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.35)]">Started</p>
                      <p className="num mt-0.5 text-[11px]">
                        {new Date(station.startsAt ?? Date.now()).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.35)]">Elapsed</p>
                      <p className="num mt-0.5 text-[11px]">
                        {formatElapsed(station.startsAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.35)]">Tab</p>
                      <p className="num mt-0.5 text-[11px]">
                        ${(((Date.now() - (station.startsAt ?? Date.now())) / 3_600_000) * 4.5).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 flex gap-2">
                  {isActive ? (
                    <>
                      <Button variant="secondary" size="small" className="flex-1" onClick={() => extendSession(station.id, 30)}>
                        +30 min
                      </Button>
                      <Button variant="secondary" size="small" className="flex-1" onClick={() => extendSession(station.id, 60)}>
                        +60 min
                      </Button>
                      <Button variant="danger" size="small" className="flex-1" onClick={confirmEnd}>
                        End
                      </Button>
                    </>
                  ) : (
                    <>
                      {[60, 120, 180].map((minutes) => (
                        <Button
                          key={minutes}
                          variant="secondary"
                          size="small"
                          className="flex-1"
                          disabled={station.status === "maintenance"}
                          onClick={() => {
                            startSession(station.id, minutes, station.member ?? "Walk-in");
                            toast({
                              title: `Session started · ${station.id}`,
                              description: `${minutes / 60}h block · ${station.member ?? "Walk-in"}`,
                            });
                          }}
                        >
                          {minutes / 60}h
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[color:var(--hairline)] p-3.5">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Active application</p>
                  <span className="chip !h-5 !text-[9px]">{station.game}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <span
                    className="grid size-9 place-items-center rounded-xl"
                    style={{ background: "color-mix(in srgb, var(--theme-primary) 14%, transparent)" }}
                  >
                    <AppWindow size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium">{station.game}</p>
                    <p className="num text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">
                      {station.game.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.exe · foreground
                    </p>
                  </div>
                  <span className="dot dot-live" />
                </div>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <p className="eyebrow">Remote controls</p>
                  <span className="chip !h-5 !text-[9px]">SIMULATED · agent</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <RemoteButton icon={<MonitorPlay size={14} />} label="Remote desktop" onClick={() => simulate("Remote desktop", "VNC handshake requested")} />
                  <RemoteButton icon={<AppWindow size={14} />} label="Live screen" onClick={() => simulate("Live screen", "Thumbnail refresh requested")} />
                  <RemoteButton
                    icon={station.locked ? <Unlock size={14} /> : <Lock size={14} />}
                    label={station.locked ? "Unlock" : "Lock"}
                    onClick={() => {
                      lockStations([station.id], !station.locked);
                      toast({ title: `${station.id} ${station.locked ? "unlocked" : "locked"}` });
                    }}
                  />
                  <RemoteButton icon={<RefreshCw size={14} />} label="Restart" onClick={() => simulate("Restart", "Restart command queued")} />
                  <RemoteButton icon={<Power size={14} />} label="Shutdown" onClick={() => simulate("Shutdown", "Shutdown command queued")} />
                  <RemoteButton icon={<Zap size={14} />} label="Wake on LAN" onClick={() => simulate("Wake on LAN", "Magic packet broadcast")} />
                  <RemoteButton icon={<MessageSquare size={14} />} label="Message" onClick={() => setShowComposer((v) => !v)} />
                  <RemoteButton
                    icon={<LogOut size={14} />}
                    label="Force logout"
                    onClick={() =>
                      setConfirm({
                        title: `Force logout ${station.id}?`,
                        detail: "The client returns to the lock screen and the session is closed.",
                        action: () => {
                          endSession(station.id);
                          toast({ title: `Logged out · ${station.id}` });
                        },
                      })
                    }
                  />
                  <RemoteButton
                    icon={<UtensilsCrossed size={14} />}
                    label="Order food"
                    onClick={() => {
                      setCartTarget(station.id);
                      setCafeMode("pos");
                      closeStation();
                    }}
                  />
                </div>

                {showComposer && (
                  <div className="mt-2.5 rounded-xl border border-[color:var(--hairline)] p-2.5">
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={2}
                      placeholder="Message shown on the client overlay…"
                      className="w-full resize-none bg-transparent text-[11.5px] outline-none placeholder:text-[rgb(var(--ink-rgb)/0.3)]"
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[9px] text-[rgb(var(--ink-rgb)/0.3)]">Delivered by client agent</span>
                      <Button
                        variant="primary"
                        size="small"
                        leadingIcon={<Send size={11} />}
                        disabled={!message.trim()}
                        onClick={() => {
                          simulate("Message sent", message.trim());
                          setMessage("");
                          setShowComposer(false);
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === "Telemetry" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <MetricTile icon={<Cpu size={12} />} label="CPU" value={`${station.telemetry.cpu}%`} seed={1} percent={station.telemetry.cpu} />
                <MetricTile icon={<Cpu size={12} />} label="GPU" value={`${station.telemetry.gpu}%`} seed={4} percent={station.telemetry.gpu} />
                <MetricTile icon={<Thermometer size={12} />} label="CPU temp" value={`${48 + (station.telemetry.cpu % 32)}°C`} seed={7} percent={48 + (station.telemetry.cpu % 32)} tone={station.telemetry.cpu % 32 > 80 ? "warn" : undefined} />
                <MetricTile icon={<Thermometer size={12} />} label="GPU temp" value={`${52 + (station.telemetry.gpu % 36)}°C`} seed={9} percent={52 + (station.telemetry.gpu % 36)} />
                <MetricTile icon={<HardDrive size={12} />} label="RAM" value={`${station.telemetry.ram}%`} seed={12} percent={station.telemetry.ram} />
              </div>
              <div className="rounded-xl border border-[color:var(--hairline)] p-3">
                <p className="eyebrow mb-2">Network</p>
                <TelemetryRow label="Latency" value={station.telemetry.ping} suffix=" ms" percent={Math.min(100, station.telemetry.ping * 2)} />
                <div className="mt-2.5">
                  <TelemetryRow label="Packet loss" value={station.telemetry.ping > 14 ? "1.8" : "0.0"} suffix="%" percent={station.telemetry.ping > 14 ? 18 : 2} tone={station.telemetry.ping > 14 ? "warn" : undefined} />
                </div>
                <div className="mt-2.5">
                  <TelemetryRow label="FPS" value={station.telemetry.fps} suffix=" fps" percent={Math.min(100, station.telemetry.fps / 2.4)} />
                </div>
              </div>
              <div className="rounded-xl border border-[color:var(--hairline)] p-3">
                <p className="eyebrow mb-2">Disk</p>
                <TelemetryRow label="System drive" value={station.telemetry.disk} suffix="%" percent={station.telemetry.disk} tone={station.telemetry.disk > 85 ? "warn" : undefined} />
                <div className="mt-2 flex items-center justify-between text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">
                  <span>SMART status</span>
                  <span style={{ color: "#34d399" }}>Healthy · 98%</span>
                </div>
              </div>
            </div>
          )}

          {tab === "Hardware" && (
            <div className="space-y-2">
              {[
                ["CPU", spec?.cpu ?? "Intel i5-13600K"],
                ["GPU", spec?.gpu ?? (station.zone === "VIP Room" ? "RTX 4090" : "RTX 4070")],
                ["Memory", spec?.ram ?? "32 GB DDR5 6000"],
                ["Storage", spec?.storage ?? "1 TB NVMe Gen4"],
                ["Motherboard", "MSI MAG B760 Tomahawk"],
                ["Monitor", station.zone === "Console Zone" ? "LG C3 42\" OLED" : "ASUS 27\" 240 Hz"],
                ["Refresh rate", station.zone === "Console Zone" ? "120 Hz · VRR" : "240 Hz"],
                ["Operating system", spec?.os ?? "Windows 11 Pro 23H2"],
                ["Client agent", "Nexus Agent 2.8.1"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-[color:var(--hairline)] px-3 py-2"
                >
                  <span className="text-[10.5px] text-[rgb(var(--ink-rgb)/0.45)]">{label}</span>
                  <span className="num text-right text-[11px] text-[rgb(var(--ink-rgb)/0.8)]">{value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "History" && (
            <ol className="relative ml-2 border-l border-[color:var(--hairline)] pl-4">
              {history.map((item, index) => (
                <li key={`${item.label}-${index}`} className="relative pb-4 last:pb-0">
                  <span
                    className="absolute -left-[21px] top-1 size-2 rounded-full"
                    style={{ background: item.tone, boxShadow: `0 0 10px ${item.tone}` }}
                  />
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[11.5px] text-[rgb(var(--ink-rgb)/0.78)]">{item.label}</p>
                    <span className="num text-[9.5px] text-[rgb(var(--ink-rgb)/0.35)]">{item.at}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-[color:var(--hairline)] px-3 py-2">
            <span className="flex items-center gap-1.5 text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">
              <Clock3 size={11} /> {simulated ? "Demo telemetry · no live agent bound" : "Live agent"}
            </span>
            <ArrowRight size={11} className="text-[rgb(var(--ink-rgb)/0.3)]" />
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ""}
        detail={confirm?.detail ?? ""}
        confirmLabel="Confirm"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
      />
    </>
  );
}

function RemoteButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-[color:var(--hairline)] px-1 py-2.5 text-center text-[9.5px] text-[rgb(var(--ink-rgb)/0.6)] transition hover:border-[color:color-mix(in_srgb,var(--theme-primary)_40%,transparent)] hover:bg-[rgb(var(--ink-rgb)/0.05)] hover:text-[rgb(var(--ink-rgb)/0.9)] active:scale-[0.97]"
    >
      {icon}
      <span className="leading-tight">{label}</span>
    </button>
  );
}

function MetricTile({
  icon,
  label,
  value,
  seed,
  percent,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  seed: number;
  percent: number;
  tone?: "warn" | "danger";
}) {
  return (
    <div className="rounded-xl border border-[color:var(--hairline)] p-2.5">
      <div className="flex items-center justify-between text-[9.5px] text-[rgb(var(--ink-rgb)/0.4)]">
        <span className="flex items-center gap-1">{icon}{label}</span>
        <span className="num text-[11px] text-[rgb(var(--ink-rgb)/0.8)]">{value}</span>
      </div>
      <div className="mt-1">
        <Spark seed={seed} color={tone === "warn" ? "#fbbf24" : "var(--theme-secondary)"} />
      </div>
      <div className="mini-meter mt-1">
        <span
          style={{
            width: `${Math.min(100, percent)}%`,
            background: tone === "warn" ? "#fbbf24" : "var(--theme-primary)",
          }}
        />
      </div>
    </div>
  );
}
