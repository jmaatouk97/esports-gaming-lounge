import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { useToast } from "open-glass-ui";
import {
  Armchair,
  Check,
  Grid3X3,
  Hand,
  Layers,
  Lock,
  Magnet,
  Maximize,
  MessageSquare,
  Monitor,
  MousePointer2,
  PencilRuler,
  Plus,
  Redo2,
  RotateCcw,
  Ruler,
  Save,
  SquareDashed,
  Trash2,
  Type as TypeIcon,
  Undo2,
  Unlock,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useApp, type FloorTool } from "../../store";
import type { Station } from "../../data";
import StationDrawer, { ConfirmDialog, formatRemaining } from "./StationDrawer";
import { BatchToolbar, StationContextMenu } from "./StationOverlays";

type DragState =
  | null
  | {
      kind: "stations";
      startX: number;
      startY: number;
      originals: Record<string, { x: number; y: number }>;
      moved: boolean;
    }
  | { kind: "resize"; id: string; startX: number; startY: number; w: number; h: number }
  | { kind: "rotate"; id: string; startX: number; startY: number; cx: number; cy: number; startAngle: number; rotation: number }
  | { kind: "zone-move"; id: string; startX: number; startY: number; originals: Record<string, { x: number; y: number }>; zoneX: number; zoneY: number }
  | { kind: "zone-resize"; id: string; startX: number; startY: number; w: number; h: number }
  | { kind: "pan"; startX: number; startY: number; panX: number; panY: number }
  | { kind: "marquee"; startX: number; startY: number; additive: boolean };

const TOOLS: { id: FloorTool; label: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Select · V", icon: MousePointer2 },
  { id: "pan", label: "Pan · H", icon: Hand },
  { id: "add-station", label: "Add PC", icon: Monitor },
  { id: "add-zone", label: "Add zone", icon: SquareDashed },
  { id: "furniture", label: "Group table", icon: Armchair },
  { id: "label", label: "Text label", icon: TypeIcon },
  { id: "measure", label: "Measure", icon: Ruler },
];

const STATUS_COLOR: Record<Station["status"], string> = {
  available: "#34d399",
  "in-use": "var(--theme-primary)",
  reserved: "#f59e0b",
  maintenance: "#f87171",
};

const SNAP = 10;
const round = (value: number, on: boolean) => (on ? Math.round(value / SNAP) * SNAP : Math.round(value));

export default function FloorEditor() {
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>(null);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [measure, setMeasure] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [zoneRename, setZoneRename] = useState<{ id: string; value: string } | null>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [tick, setTick] = useState(0);

  const stations = useApp((s) => s.stations);
  const zones = useApp((s) => s.zones);
  const editorMode = useApp((s) => s.editorMode);
  const tool = useApp((s) => s.tool);
  const showGrid = useApp((s) => s.showGrid);
  const snap = useApp((s) => s.snap);
  const zoom = useApp((s) => s.zoom);
  const pan = useApp((s) => s.pan);
  const selectedIds = useApp((s) => s.selectedIds);
  const savedAt = useApp((s) => s.savedAt);
  const past = useApp((s) => s.past);
  const future = useApp((s) => s.future);

  const setEditorMode = useApp((s) => s.setEditorMode);
  const setTool = useApp((s) => s.setTool);
  const toggleGrid = useApp((s) => s.toggleGrid);
  const toggleSnap = useApp((s) => s.toggleSnap);
  const setZoom = useApp((s) => s.setZoom);
  const setPan = useApp((s) => s.setPan);
  const setSelection = useApp((s) => s.setSelection);
  const selectStation = useApp((s) => s.selectStation);
  const openStation = useApp((s) => s.openStation);
  const openContextMenu = useApp((s) => s.openContextMenu);
  const beginHistory = useApp((s) => s.beginHistory);
  const updateStationLayout = useApp((s) => s.updateStationLayout);
  const updateZone = useApp((s) => s.updateZone);
  const undo = useApp((s) => s.undo);
  const redo = useApp((s) => s.redo);
  const saveFloor = useApp((s) => s.saveFloor);
  const resetFloor = useApp((s) => s.resetFloor);
  const addStation = useApp((s) => s.addStation);
  const addZone = useApp((s) => s.addZone);
  const lockStations = useApp((s) => s.lockStations);

  useEffect(() => {
    if (editorMode !== "live") return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [editorMode]);

  useEffect(() => {
    if (!selectOpen) return;
    const close = () => setSelectOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [selectOpen]);

  const toWorld = useCallback((clientX: number, clientY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    const state = useApp.getState();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - state.pan.x) / state.zoom,
      y: (clientY - rect.top - state.pan.y) / state.zoom,
    };
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) {
        if (useApp.getState().tool === "measure") {
          const point = toWorld(event.clientX, event.clientY);
          setMeasure((current) => (current ? { ...current, x2: point.x, y2: point.y } : current));
        }
        return;
      }
      const state = useApp.getState();
      const world = toWorld(event.clientX, event.clientY);
      const dx = (event.clientX - drag.startX) / state.zoom;
      const dy = (event.clientY - drag.startY) / state.zoom;

      if (drag.kind === "stations") {
        if (Math.abs(dx) + Math.abs(dy) > 1) drag.moved = true;
        if (!drag.moved) return;
        Object.entries(drag.originals).forEach(([id, origin]) => {
          updateStationLayout(id, {
            x: round(origin.x + dx, state.snap),
            y: round(origin.y + dy, state.snap),
          });
        });
      } else if (drag.kind === "resize") {
        updateStationLayout(drag.id, {
          w: Math.max(110, round(drag.w + dx, state.snap)),
          h: Math.max(62, round(drag.h + dy, state.snap)),
        });
      } else if (drag.kind === "rotate") {
        const angle = (Math.atan2(event.clientY - drag.cy, event.clientX - drag.cx) * 180) / Math.PI;
        updateStationLayout(drag.id, {
          rotation: Math.round(drag.rotation + angle - drag.startAngle),
        });
      } else if (drag.kind === "zone-move") {
        updateZone(drag.id, {
          x: round(drag.zoneX + dx, state.snap),
          y: round(drag.zoneY + dy, state.snap),
        });
        Object.entries(drag.originals).forEach(([id, origin]) => {
          updateStationLayout(id, {
            x: round(origin.x + dx, state.snap),
            y: round(origin.y + dy, state.snap),
          });
        });
      } else if (drag.kind === "zone-resize") {
        updateZone(drag.id, {
          w: Math.max(240, round(drag.w + dx, state.snap)),
          h: Math.max(160, round(drag.h + dy, state.snap)),
        });
      } else if (drag.kind === "pan") {
        setPan({
          x: drag.panX + (event.clientX - drag.startX),
          y: drag.panY + (event.clientY - drag.startY),
        });
      } else if (drag.kind === "marquee") {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) return;
        const sx = (drag.startX - rect.left - state.pan.x) / state.zoom;
        const sy = (drag.startY - rect.top - state.pan.y) / state.zoom;
        setMarquee({
          x: Math.min(sx, world.x),
          y: Math.min(sy, world.y),
          w: Math.abs(world.x - sx),
          h: Math.abs(world.y - sy),
        });
      }
    };

    const onUp = () => {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.kind === "marquee" && marquee) {
        const ids = useApp
          .getState()
          .stations.filter(
            (station) =>
              station.layout.x < marquee.x + marquee.w &&
              station.layout.x + station.layout.w > marquee.x &&
              station.layout.y < marquee.y + marquee.h &&
              station.layout.y + station.layout.h > marquee.y,
          )
          .map((station) => station.id);
        const current = useApp.getState().selectedIds;
        setSelection(drag.additive ? Array.from(new Set([...current, ...ids])) : ids);
      }
      if (drag.kind === "stations" && drag.moved) {
        toast({
          title: "Layout updated",
          description: `${Object.keys(drag.originals).length} station${Object.keys(drag.originals).length > 1 ? "s" : ""} moved · undo available`,
          duration: 1800,
        });
      }
      dragRef.current = null;
      setMarquee(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [marquee, setPan, setSelection, toWorld, updateStationLayout, updateZone, toast]);

  const zoneAt = (x: number, y: number) => {
    const zone = useApp
      .getState()
      .zones.find((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h);
    return zone?.name ?? "Main Hall";
  };

  const onCanvasPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button === 2) return;
    const state = useApp.getState();
    const target = event.target as HTMLElement;
    if (target.closest("[data-floor-node], [data-floor-zone], .floor-toolbar, .floor-chipbar, .floor-zoombar")) return;

    if (event.button === 1 || state.tool === "pan") {
      dragRef.current = {
        kind: "pan",
        startX: event.clientX,
        startY: event.clientY,
        panX: state.pan.x,
        panY: state.pan.y,
      };
      return;
    }

    const point = toWorld(event.clientX, event.clientY);

    if (state.editorMode === "edit") {
      if (state.tool === "add-station") {
        addStation("standard", zoneAt(point.x, point.y), point.x, point.y);
        setTool("select");
        return;
      }
      if (state.tool === "furniture") {
        addStation("table", zoneAt(point.x, point.y), point.x, point.y);
        setTool("select");
        return;
      }
      if (state.tool === "add-zone") {
        addZone(point.x, point.y);
        setTool("select");
        return;
      }
      if (state.tool === "label") {
        addZone(point.x, point.y);
        const latest = useApp.getState().zones.at(-1);
        if (latest) updateZone(latest.id, { name: "New label", w: 190, h: 34 });
        setTool("select");
        return;
      }
      if (state.tool === "measure") {
        if (!measure) setMeasure({ x1: point.x, y1: point.y, x2: point.x, y2: point.y });
        else setMeasure({ ...measure, x2: point.x, y2: point.y });
        return;
      }
      if (state.tool === "select") {
        dragRef.current = {
          kind: "marquee",
          startX: event.clientX,
          startY: event.clientY,
          additive: event.shiftKey,
        };
        if (!event.shiftKey) setSelection([]);
      }
    } else {
      setSelection([]);
    }
  };

  const onStationPointerDown = (event: ReactPointerEvent, station: Station) => {
    if (event.button === 2) return;
    event.stopPropagation();
    const state = useApp.getState();
    if (state.editorMode === "live") return;
    if (state.tool !== "select") return;

    const already = state.selectedIds.includes(station.id);
    const nextIds = event.shiftKey
      ? already
        ? state.selectedIds.filter((id) => id !== station.id)
        : [...state.selectedIds, station.id]
      : already
        ? state.selectedIds
        : [station.id];
    setSelection(nextIds);
    beginHistory();
    dragRef.current = {
      kind: "stations",
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      originals: Object.fromEntries(
        state.stations
          .filter((s) => nextIds.includes(s.id))
          .map((s) => [s.id, { x: s.layout.x, y: s.layout.y }]),
      ),
    };
  };

  const onStationClick = (station: Station) => {
    const state = useApp.getState();
    if (state.editorMode === "live") {
      openStation(station.id);
    }
  };

  const onStationContext = (event: ReactMouseEvent, station: Station) => {
    event.preventDefault();
    event.stopPropagation();
    const state = useApp.getState();
    if (!state.selectedIds.includes(station.id)) {
      setSelection([station.id]);
    }
    openContextMenu(event.clientX, event.clientY, station.id);
  };

  const onCanvasContext = (event: ReactMouseEvent) => {
    event.preventDefault();
    const target = event.target as HTMLElement;
    if (target.closest("[data-floor-node], [data-floor-zone], .floor-toolbar, .floor-chipbar, .floor-zoombar")) return;
    setSelection([]);
    openContextMenu(event.clientX, event.clientY, null);
  };

  const onWheel = (event: ReactWheelEvent) => {
    event.preventDefault();
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const state = useApp.getState();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    const next = Math.min(2.2, Math.max(0.35, state.zoom * (event.deltaY > 0 ? 0.92 : 1.08)));
    setZoom(next);
    setPan({
      x: mx - ((mx - state.pan.x) * next) / state.zoom,
      y: my - ((my - state.pan.y) * next) / state.zoom,
    });
  };

  const fit = () => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xs = [
      ...zones.map((z) => z.x),
      ...stations.map((s) => s.layout.x),
    ];
    const ys = [
      ...zones.map((z) => z.y),
      ...stations.map((s) => s.layout.y),
    ];
    const maxX = Math.max(...zones.map((z) => z.x + z.w), ...stations.map((s) => s.layout.x + s.layout.w));
    const maxY = Math.max(...zones.map((z) => z.y + z.h), ...stations.map((s) => s.layout.y + s.layout.h));
    const minX = Math.min(...xs, 0);
    const minY = Math.min(...ys, 0);
    const width = maxX - minX + 80;
    const height = maxY - minY + 120;
    const next = Math.min(1.25, Math.max(0.35, Math.min(rect.width / width, rect.height / height)));
    setZoom(next);
    setPan({
      x: 40 - minX * next,
      y: 40 - minY * next,
    });
  };

  const selectBy = (mode: "all" | "alerts" | "connected" | "clear" | string) => {
    const state = useApp.getState();
    if (mode === "clear") setSelection([]);
    else if (mode === "all") setSelection(state.stations.map((s) => s.id));
    else if (mode === "connected") setSelection(state.stations.filter((s) => s.status !== "maintenance").map((s) => s.id));
    else if (mode === "alerts") setSelection(state.stations.filter((s) => s.status === "maintenance" || s.telemetry.gpu > 78).map((s) => s.id));
    else setSelection(state.stations.filter((s) => s.zone === mode).map((s) => s.id));
    setSelectOpen(false);
  };

  const total = stations.length;
  const active = useMemo(() => stations.filter((s) => s.status === "in-use").length, [stations]);
  const selection = selectedIds.length;

  return (
    <>
      <div className="floor-shell">
        <div
          ref={viewportRef}
          className="floor-viewport"
          data-tool={editorMode === "edit" ? tool : "select"}
          onPointerDown={onCanvasPointerDown}
          onContextMenu={onCanvasContext}
          onWheel={onWheel}
        >
          <div
            className="floor-world"
            data-grid={showGrid && editorMode === "edit"}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {zones.map((zone) => {
              const isLabel = zone.h <= 44;
              const count = stations.filter((s) => s.zone === zone.name).length;
              return (
                <div
                  key={zone.id}
                  className="floor-zone"
                  data-floor-zone="true"
                  data-editing={editorMode === "edit"}
                  style={{
                    left: zone.x,
                    top: zone.y,
                    width: zone.w,
                    height: zone.h,
                    border: isLabel ? "none" : undefined,
                    background: isLabel ? "transparent" : undefined,
                    pointerEvents: isLabel ? "none" : undefined,
                  }}
                  onPointerDown={(event) => {
                    if (editorMode !== "edit" || event.button === 2 || isLabel) return;
                    event.stopPropagation();
                    const state = useApp.getState();
                    beginHistory();
                    dragRef.current = {
                      kind: "zone-move",
                      id: zone.id,
                      startX: event.clientX,
                      startY: event.clientY,
                      zoneX: zone.x,
                      zoneY: zone.y,
                      originals: Object.fromEntries(
                        state.stations
                          .filter(
                            (s) =>
                              s.layout.x + s.layout.w / 2 >= zone.x &&
                              s.layout.x + s.layout.w / 2 <= zone.x + zone.w &&
                              s.layout.y + s.layout.h / 2 >= zone.y &&
                              s.layout.y + s.layout.h / 2 <= zone.y + zone.h,
                          )
                          .map((s) => [s.id, { x: s.layout.x, y: s.layout.y }]),
                      ),
                    };
                  }}
                >
                  {!isLabel && (
                    <div
                      className="floor-zone-label"
                      style={{ pointerEvents: editorMode === "edit" ? "auto" : "none" }}
                      onDoubleClick={() => {
                        if (editorMode === "edit") setZoneRename({ id: zone.id, value: zone.name });
                      }}
                    >
                      {zoneRename?.id === zone.id ? (
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            updateZone(zone.id, { name: zoneRename.value.trim() || zone.name });
                            setZoneRename(null);
                          }}
                        >
                          <input
                            autoFocus
                            value={zoneRename.value}
                            onChange={(event) => setZoneRename({ id: zone.id, value: event.target.value })}
                            onBlur={() => {
                              updateZone(zone.id, { name: zoneRename.value.trim() || zone.name });
                              setZoneRename(null);
                            }}
                            className="w-[120px] bg-transparent text-[10px] uppercase tracking-[0.14em] outline-none"
                          />
                        </form>
                      ) : (
                        <>
                          <span className="size-1.5 rounded-full" style={{ background: "var(--theme-primary)" }} />
                          {zone.name}
                          <span className="floor-zone-count">{count} stations</span>
                        </>
                      )}
                    </div>
                  )}
                  {editorMode === "edit" && !isLabel && (
                    <span
                      className="node-handle"
                      style={{ right: -6, bottom: -6 }}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        beginHistory();
                        dragRef.current = {
                          kind: "zone-resize",
                          id: zone.id,
                          startX: event.clientX,
                          startY: event.clientY,
                          w: zone.w,
                          h: zone.h,
                        };
                      }}
                    />
                  )}
                </div>
              );
            })}

            {stations.map((station) => {
              const compact = station.layout.w < 150 || station.layout.h < 74;
              const selected = selectedIds.includes(station.id);
              return (
                <div
                  key={station.id}
                  data-floor-node="true"
                  data-status={station.status}
                  data-selected={selected}
                  data-compact={compact}
                  role="button"
                  tabIndex={0}
                  aria-label={`${station.id} · ${station.status}`}
                  className="floor-node"
                  style={{
                    left: station.layout.x,
                    top: station.layout.y,
                    width: station.layout.w,
                    height: station.layout.h,
                    transform: `rotate(${station.layout.rotation}deg)`,
                    cursor: editorMode === "edit" ? "grab" : "pointer",
                  }}
                  onPointerDown={(event) => onStationPointerDown(event, station)}
                  onClick={() => onStationClick(station)}
                  onContextMenu={(event) => onStationContext(event, station)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (editorMode === "live") openStation(station.id);
                      else setSelection([station.id]);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="num text-[11px] font-semibold tracking-tight">{station.name}</span>
                    <span className="flex items-center gap-1.5">
                      {station.locked && <Lock size={9} className="text-[#fbbf24]" />}
                      <span className="dot" style={{ background: STATUS_COLOR[station.status] }} />
                    </span>
                  </div>

                  <p className="mt-0.5 truncate text-[9px] text-[rgb(var(--ink-rgb)/0.42)]">
                    {station.status === "in-use" ? station.member : station.status === "available" ? "Ready" : station.status === "reserved" ? "Reserved" : "Maintenance"}
                  </p>

                  <div className="mt-auto flex items-end justify-between gap-1">
                    <span
                      className="num text-[11px] font-medium"
                      style={{ color: station.status === "in-use" ? "var(--theme-secondary)" : "var(--ink)" }}
                    >
                      {station.status === "in-use" ? formatRemaining(station.endsAt) : "—"}
                    </span>
                    {!compact && (
                      <span className="num text-[8.5px] text-[rgb(var(--ink-rgb)/0.35)]">
                        {station.telemetry.ping}ms
                      </span>
                    )}
                  </div>

                  {!compact && (
                    <div className="mt-1 flex gap-1">
                      {[
                        { label: "C", value: station.telemetry.cpu, max: 100 },
                        { label: "G", value: station.telemetry.gpu, max: 100 },
                      ].map((metric) => (
                        <div key={metric.label} className="flex flex-1 items-center gap-1">
                          <span className="text-[7px] text-[rgb(var(--ink-rgb)/0.3)]">{metric.label}</span>
                          <span className="mini-meter flex-1">
                            <span style={{ width: `${metric.value}%`, background: "var(--station-color)" }} />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="node-hud" onClick={(event) => event.stopPropagation()}>
                    <button type="button" className="node-hud-button" title="Live screen" aria-label="Live screen" onClick={() => toast({ title: `Live screen · ${station.id}`, description: "Simulated thumbnail · agent required" })}>
                      <Layers size={10} />
                    </button>
                    <button type="button" className="node-hud-button" title="Message" aria-label="Message" onClick={() => { openStation(station.id); }}>
                      <MessageSquare size={10} />
                    </button>
                    <button type="button" className="node-hud-button" title="Lock" aria-label="Lock" onClick={() => { lockStations([station.id], !station.locked); toast({ title: `${station.id} ${station.locked ? "unlocked" : "locked"}` }); }}>
                      {station.locked ? <Unlock size={10} /> : <Lock size={10} />}
                    </button>
                    <button type="button" className="node-hud-button" title="Wake on LAN" aria-label="Wake on LAN" onClick={() => toast({ title: `Wake on LAN · ${station.id}`, description: "Magic packet · simulated" })}>
                      <Zap size={10} />
                    </button>
                  </div>

                  {editorMode === "edit" && selected && (
                    <>
                      <span
                        className="node-handle"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          beginHistory();
                          dragRef.current = {
                            kind: "resize",
                            id: station.id,
                            startX: event.clientX,
                            startY: event.clientY,
                            w: station.layout.w,
                            h: station.layout.h,
                          };
                        }}
                      />
                      <span
                        className="node-rotate"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          const rect = (event.target as HTMLElement).closest("[data-floor-node]")?.getBoundingClientRect();
                          if (!rect) return;
                          beginHistory();
                          dragRef.current = {
                            kind: "rotate",
                            id: station.id,
                            startX: event.clientX,
                            startY: event.clientY,
                            cx: rect.left + rect.width / 2,
                            cy: rect.top + rect.height / 2,
                            startAngle: (Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180) / Math.PI,
                            rotation: station.layout.rotation,
                          };
                        }}
                      />
                    </>
                  )}

                  {editorMode === "live" && (
                    <span
                      className="absolute left-1.5 top-1.5 grid size-3.5 place-items-center rounded-[4px] border transition"
                      style={{
                        borderColor: selected ? "var(--theme-primary)" : "rgb(var(--ink-rgb) / 0.2)",
                        background: selected ? "var(--theme-primary)" : "rgb(var(--app-bg) / 0.5)",
                        color: "#07101d",
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectStation(station.id, true);
                      }}
                    >
                      {selected && <Check size={8} strokeWidth={3} />}
                    </span>
                  )}
                </div>
              );
            })}

            {marquee && (
              <div
                className="marquee"
                style={{ left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h }}
              />
            )}

            {measure && (
              <div
                style={{
                  position: "absolute",
                  left: measure.x1,
                  top: measure.y1,
                  width: Math.hypot(measure.x2 - measure.x1, measure.y2 - measure.y1),
                  height: 1,
                  background: "var(--theme-secondary)",
                  transformOrigin: "0 0",
                  transform: `rotate(${(Math.atan2(measure.y2 - measure.y1, measure.x2 - measure.x1) * 180) / Math.PI}deg)`,
                  pointerEvents: "none",
                  boxShadow: "0 0 12px var(--theme-secondary)",
                }}
              >
                <span
                  className="num rounded px-1 text-[9px]"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -18,
                    transform: "translateX(-50%)",
                    background: "var(--app-bg)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  {(Math.hypot(measure.x2 - measure.x1, measure.y2 - measure.y1) / 10).toFixed(1)} m
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="floor-chipbar">
          <div className="floor-mode-toggle" role="group" aria-label="Editor mode">
            <button type="button" data-active={editorMode === "live"} onClick={() => setEditorMode("live")}>
              <span className="dot dot-live" /> Live ops
            </button>
            <button type="button" data-active={editorMode === "edit"} onClick={() => setEditorMode("edit")}>
              <PencilRuler size={11} /> Edit layout
            </button>
          </div>

          {editorMode === "live" ? (
            <div className="relative" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-xl border border-[color:var(--hairline)] px-2.5 text-[10.5px] text-[rgb(var(--ink-rgb)/0.65)] backdrop-blur-md transition hover:bg-[rgb(var(--ink-rgb)/0.06)]"
                style={{ background: "color-mix(in srgb, var(--app-bg) 55%, transparent)" }}
                onClick={() => setSelectOpen((v) => !v)}
                aria-expanded={selectOpen}
              >
                Select
                {selection > 0 && <span className="chip !h-4 !px-1 !text-[9px]">{selection}</span>}
              </button>
              {selectOpen && (
                <div className="context-menu" style={{ position: "absolute", left: 0, top: 38, minWidth: 190 }}>
                  <div className="cm-label">Selection</div>
                  <button type="button" className="cm-item" onClick={() => selectBy("all")}>All stations</button>
                  <button type="button" className="cm-item" onClick={() => selectBy("connected")}>Connected PCs</button>
                  <button type="button" className="cm-item" onClick={() => selectBy("alerts")}>Stations with alerts</button>
                  <div className="cm-sep" />
                  <div className="cm-label">By zone</div>
                  {zones.map((zone) => (
                    <button key={zone.id} type="button" className="cm-item" onClick={() => selectBy(zone.name)}>
                      {zone.name}
                    </button>
                  ))}
                  <div className="cm-sep" />
                  <button type="button" className="cm-item" onClick={() => selectBy("clear")}>Clear selection</button>
                </div>
              )}
            </div>
          ) : (
            <span className="rounded-lg border border-[color:var(--hairline)] px-2 py-1 text-[10px] text-[rgb(var(--ink-rgb)/0.5)] backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--app-bg) 50%, transparent)" }}>
              Drag to move · handles resize/rotate · double-click zone to rename
            </span>
          )}

          <span className="num hidden items-center gap-1.5 text-[10px] text-[rgb(var(--ink-rgb)/0.42)] sm:flex">
            <span className="dot dot-live" /> {active}/{total} active
          </span>
        </div>

        <div className="floor-zoombar">
          <button type="button" className="floor-tool" onClick={() => setZoom(zoom - 0.1)} aria-label="Zoom out">
            <ZoomOut size={14} />
          </button>
          <span className="num w-9 text-center text-[10px] text-[rgb(var(--ink-rgb)/0.55)]">{Math.round(zoom * 100)}%</span>
          <button type="button" className="floor-tool" onClick={() => setZoom(zoom + 0.1)} aria-label="Zoom in">
            <ZoomIn size={14} />
          </button>
          <button type="button" className="floor-tool" onClick={fit} aria-label="Fit to screen" title="Fit to screen">
            <Maximize size={13} />
          </button>
        </div>

        <div className="floor-toolbar" role="toolbar" aria-label="Floor editor tools">
          {TOOLS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="floor-tool"
              data-active={tool === item.id}
              title={item.label}
              aria-label={item.label}
              disabled={editorMode === "live"}
              onClick={() => setTool(item.id)}
            >
              <item.icon size={15} />
            </button>
          ))}
          <span className="floor-tool-sep" />
          <button type="button" className="floor-tool" data-active={showGrid} onClick={toggleGrid} title="Toggle grid" aria-label="Toggle grid" disabled={editorMode === "live"}>
            <Grid3X3 size={15} />
          </button>
          <button type="button" className="floor-tool" data-active={snap} onClick={toggleSnap} title="Snap to grid" aria-label="Snap to grid" disabled={editorMode === "live"}>
            <Magnet size={15} />
          </button>
          <span className="floor-tool-sep" />
          <button type="button" className="floor-tool" onClick={undo} disabled={!past.length} title="Undo" aria-label="Undo">
            <Undo2 size={15} />
          </button>
          <button type="button" className="floor-tool" onClick={redo} disabled={!future.length} title="Redo" aria-label="Redo">
            <Redo2 size={15} />
          </button>
          <span className="floor-tool-sep" />
          <button
            type="button"
            className="floor-tool"
            onClick={() => {
              saveFloor();
              toast({ title: "Floor layout saved", description: "Station positions, rotation and zones persisted locally." });
            }}
            title="Save layout"
            aria-label="Save layout"
          >
            <Save size={15} />
          </button>
          <button type="button" className="floor-tool" onClick={() => setResetConfirm(true)} title="Reset layout" aria-label="Reset layout">
            <RotateCcw size={15} />
          </button>
          <span className="floor-tool-sep" />
          <button
            type="button"
            className="floor-tool"
            title="Add station"
            aria-label="Add station"
            disabled={editorMode === "live"}
            onClick={() => addStation("standard", "Main Hall", 120 + Math.random() * 80, 140 + Math.random() * 60)}
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            className="floor-tool"
            title="Delete selection"
            aria-label="Delete selection"
            disabled={editorMode === "live" || !selection}
            onClick={() => {
              useApp.getState().deleteSelected();
              toast({ title: "Stations removed", description: "Use Undo to restore the layout." });
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>

        <span className="pointer-events-none absolute bottom-1 right-3 text-[9px] text-[rgb(var(--ink-rgb)/0.28)]">
          {savedAt ? `Saved ${savedAt}` : "Unsaved layout"} · simulated devices
        </span>
      </div>

      <StationDrawer />
      <StationContextMenu />
      <BatchToolbar />

      <ConfirmDialog
        open={resetConfirm}
        title="Reset floor layout?"
        detail="All custom positions, rotations, zone sizes and added stations return to the seed layout. Appearance preferences are kept."
        confirmLabel="Reset layout"
        onCancel={() => setResetConfirm(false)}
        onConfirm={() => {
          resetFloor();
          setResetConfirm(false);
          toast({ title: "Floor layout reset", description: "Undo is available if you change your mind." });
        }}
      />
    </>
  );
}
