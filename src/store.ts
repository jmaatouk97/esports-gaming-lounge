import { create } from "zustand";
import {
  ZONE_DEFS,
  inventory as inventorySeed,
  members as memberSeed,
  stations as stationSeed,
  type InventoryItem,
  type Member,
  type Station,
  type StationLayout,
  type StationType,
  type ZoneDef,
} from "./data";

export type CafeMode = "pos" | "floor";
export type EditorMode = "live" | "edit";
export type FloorTool =
  | "select"
  | "pan"
  | "add-station"
  | "add-zone"
  | "furniture"
  | "label"
  | "measure";
export type Density = "compact" | "standard" | "detailed";
export type MonitorView = "telemetry" | "thumbnails";

export interface CartLine {
  productId: string;
  qty: number;
}

export interface FloorSnapshot {
  stations: Station[];
  zones: ZoneDef[];
}

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "success" | "warn" | "danger";
  at: string;
  read: boolean;
}

const FLOOR_KEY = "nexus-floor-v3";

function loadFloor(): { stations: Station[]; zones: ZoneDef[] } {
  const zones = ZONE_DEFS.map((zone) => ({ ...zone }));
  if (typeof window === "undefined") return { stations: stationSeed, zones };
  try {
    const raw = window.localStorage.getItem(FLOOR_KEY);
    if (!raw) return { stations: stationSeed, zones };
    const parsed = JSON.parse(raw) as {
      layouts?: Record<string, StationLayout>;
      zones?: ZoneDef[];
    };
    const stations = stationSeed.map((station) => ({
      ...station,
      layout: parsed.layouts?.[station.id] ?? station.layout,
    }));
    return {
      stations,
      zones: Array.isArray(parsed.zones) && parsed.zones.length ? parsed.zones : zones,
    };
  } catch {
    return { stations: stationSeed, zones };
  }
}

function persistFloor(stations: Station[], zones: ZoneDef[]) {
  try {
    const layouts = Object.fromEntries(stations.map((s) => [s.id, s.layout]));
    window.localStorage.setItem(FLOOR_KEY, JSON.stringify({ layouts, zones }));
  } catch {
    /* ignore blocked storage */
  }
}

function stamp() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const initial = loadFloor();

const seedNotifications: AppNotification[] = [
  { id: "n1", title: "Thermal alert · VIP-03", detail: "GPU fan 0 RPM at 84°C", tone: "danger", at: "26m", read: false },
  { id: "n2", title: "Shift handover ready", detail: "Night shift totals reconciled", tone: "success", at: "1h", read: false },
  { id: "n3", title: "Reservation confirmed", detail: "VIP Room · 20:00 · 6 seats", tone: "info", at: "2h", read: true },
];

interface AppState {
  sidebarCollapsed: boolean;
  mobileNav: boolean;

  cafeMode: CafeMode;
  activeCategory: string;
  cafeQuery: string;
  cart: CartLine[];
  cartTarget: string | null;

  stations: Station[];
  zones: ZoneDef[];
  stock: InventoryItem[];
  members: Member[];

  editorMode: EditorMode;
  tool: FloorTool;
  showGrid: boolean;
  snap: boolean;
  zoom: number;
  pan: { x: number; y: number };
  selectedIds: string[];
  drawerId: string | null;
  contextMenu: { x: number; y: number; stationId: string | null } | null;
  past: FloorSnapshot[];
  future: FloorSnapshot[];
  savedAt: string | null;

  density: Density;
  monitorView: MonitorView;
  thumbInterval: number;
  thumbPaused: boolean;
  notifications: AppNotification[];

  toggleSidebar: () => void;
  setMobileNav: (open: boolean) => void;

  setCafeMode: (mode: CafeMode) => void;
  setCategory: (category: string) => void;
  setCafeQuery: (query: string) => void;
  addItem: (productId: string) => void;
  decItem: (productId: string) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
  setCartTarget: (stationId: string | null) => void;
  checkout: () => void;

  startSession: (stationId: string, minutes: number, member?: string) => void;
  extendSession: (stationId: string, minutes: number) => void;
  endSession: (stationId: string) => void;
  setMaintenance: (stationId: string, on: boolean) => void;
  lockStations: (ids: string[], locked: boolean) => void;

  restock: (itemId: string, qty: number) => void;
  addStockItem: (item: InventoryItem) => void;
  topUp: (memberId: string, amount: number) => void;
  addMember: (member: Member) => void;

  setEditorMode: (mode: EditorMode) => void;
  setTool: (tool: FloorTool) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  selectStation: (id: string, additive?: boolean) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  openStation: (id: string) => void;
  closeStation: () => void;
  openContextMenu: (x: number, y: number, stationId: string | null) => void;
  closeContextMenu: () => void;

  beginHistory: () => void;
  updateStationLayout: (id: string, patch: Partial<StationLayout>) => void;
  moveSelection: (dx: number, dy: number) => void;
  addStation: (type: StationType, zoneOrX: string | number, x?: number, y?: number) => string;
  addZone: (x: number, y: number) => void;
  updateZone: (id: string, patch: Partial<ZoneDef>) => void;
  renameStation: (id: string, name: string) => void;
  moveToZone: (ids: string[], zone: string) => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
  saveFloor: () => void;
  resetFloor: () => void;

  setDensity: (density: Density) => void;
  setMonitorView: (view: MonitorView) => void;
  setThumbInterval: (seconds: number) => void;
  toggleThumbPaused: () => void;
  pushNotification: (notification: Omit<AppNotification, "id" | "at" | "read">) => void;
  dismissNotification: (id: string) => void;
  markAllRead: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const useApp = create<AppState>((set, get) => {
  const commit = (stations: Station[], zones: ZoneDef[]) => {
    persistFloor(stations, zones);
    set({ stations, zones });
  };

  const withHistory = (producer: (state: AppState) => Partial<AppState>) => {
    const state = get();
    const snapshot: FloorSnapshot = {
      stations: JSON.parse(JSON.stringify(state.stations)),
      zones: JSON.parse(JSON.stringify(state.zones)),
    };
    const patch = producer(state);
    const stations = (patch.stations as Station[] | undefined) ?? state.stations;
    const zones = (patch.zones as ZoneDef[] | undefined) ?? state.zones;
    persistFloor(stations, zones);
    set({
      ...patch,
      past: [...state.past.slice(-39), snapshot],
      future: [],
      savedAt: stamp(),
    });
  };

  return {
    sidebarCollapsed: false,
    mobileNav: false,

    cafeMode: "pos",
    activeCategory: "All",
    cafeQuery: "",
    cart: [],
    cartTarget: null,

    stations: initial.stations,
    zones: initial.zones,
    stock: inventorySeed,
    members: memberSeed,

    editorMode: "live",
    tool: "select",
    showGrid: true,
    snap: true,
    zoom: 0.9,
    pan: { x: 24, y: 24 },
    selectedIds: [],
    drawerId: null,
    contextMenu: null,
    past: [],
    future: [],
    savedAt: null,

    density: "standard",
    monitorView: "telemetry",
    thumbInterval: 5,
    thumbPaused: false,
    notifications: seedNotifications,

    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setMobileNav: (open) => set({ mobileNav: open }),

    setCafeMode: (mode) => set({ cafeMode: mode }),
    setCategory: (category) => set({ activeCategory: category }),
    setCafeQuery: (query) => set({ cafeQuery: query }),

    addItem: (productId) =>
      set((s) => {
        const existing = s.cart.find((line) => line.productId === productId);
        if (existing) {
          return {
            cart: s.cart.map((line) =>
              line.productId === productId ? { ...line, qty: line.qty + 1 } : line,
            ),
          };
        }
        return { cart: [...s.cart, { productId, qty: 1 }] };
      }),

    decItem: (productId) =>
      set((s) => ({
        cart: s.cart
          .map((line) =>
            line.productId === productId ? { ...line, qty: line.qty - 1 } : line,
          )
          .filter((line) => line.qty > 0),
      })),

    removeLine: (productId) =>
      set((s) => ({ cart: s.cart.filter((line) => line.productId !== productId) })),

    clearCart: () => set({ cart: [] }),
    setCartTarget: (stationId) => set({ cartTarget: stationId }),

    checkout: () =>
      set((s) => ({
        cart: [],
        cartTarget: null,
        notifications: [
          {
            id: `n${Date.now()}`,
            title: "POS order completed",
            detail: `${s.cart.reduce((n, l) => n + l.qty, 0)} items charged`,
            tone: "success",
            at: "now",
            read: false,
          },
          ...s.notifications,
        ],
      })),

    startSession: (stationId, minutes, member = "Walk-in") =>
      set((s) => ({
        stations: s.stations.map((station) =>
          station.id === stationId
            ? {
                ...station,
                status: "in-use",
                member,
                startsAt: Date.now(),
                endsAt: Date.now() + minutes * 60_000,
              }
            : station,
        ),
      })),

    extendSession: (stationId, minutes) =>
      set((s) => ({
        stations: s.stations.map((station) =>
          station.id === stationId
            ? { ...station, endsAt: (station.endsAt ?? Date.now()) + minutes * 60_000 }
            : station,
        ),
      })),

    endSession: (stationId) =>
      set((s) => ({
        stations: s.stations.map((station) =>
          station.id === stationId
            ? { ...station, status: "available", member: undefined, endsAt: undefined, startsAt: undefined }
            : station,
        ),
      })),

    setMaintenance: (stationId, on) =>
      set((s) => ({
        stations: s.stations.map((station) =>
          station.id === stationId
            ? {
                ...station,
                status: on ? "maintenance" : "available",
                member: on ? undefined : station.member,
                endsAt: on ? undefined : station.endsAt,
              }
            : station,
        ),
      })),

    lockStations: (ids, locked) =>
      set((s) => ({
        stations: s.stations.map((station) =>
          ids.includes(station.id) ? { ...station, locked } : station,
        ),
      })),

    restock: (itemId, qty) =>
      set((s) => ({
        stock: s.stock.map((item) =>
          item.id === itemId ? { ...item, stock: item.stock + qty } : item,
        ),
      })),

    addStockItem: (item) => set((s) => ({ stock: [item, ...s.stock] })),

    topUp: (memberId, amount) =>
      set((s) => ({
        members: s.members.map((member) =>
          member.id === memberId
            ? { ...member, balance: Math.round((member.balance + amount) * 100) / 100 }
            : member,
        ),
      })),

    addMember: (member) => set((s) => ({ members: [member, ...s.members] })),

    setEditorMode: (mode) =>
      set({ editorMode: mode, tool: mode === "live" ? "select" : get().tool, selectedIds: [] }),
    setTool: (tool) => set({ tool }),
    toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
    toggleSnap: () => set((s) => ({ snap: !s.snap })),
    setZoom: (zoom) => set({ zoom: clamp(zoom, 0.35, 2.2) }),
    setPan: (pan) => set({ pan }),

    selectStation: (id, additive = false) =>
      set((s) => {
        if (!additive) return { selectedIds: [id] };
        return {
          selectedIds: s.selectedIds.includes(id)
            ? s.selectedIds.filter((item) => item !== id)
            : [...s.selectedIds, id],
        };
      }),
    setSelection: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),
    openStation: (id) => set({ drawerId: id, contextMenu: null }),
    closeStation: () => set({ drawerId: null }),
    openContextMenu: (x, y, stationId) =>
      set({ contextMenu: { x, y, stationId }, drawerId: null }),
    closeContextMenu: () => set({ contextMenu: null }),

    beginHistory: () => {
      const state = get();
      set({
        past: [
          ...state.past.slice(-39),
          {
            stations: JSON.parse(JSON.stringify(state.stations)),
            zones: JSON.parse(JSON.stringify(state.zones)),
          },
        ],
        future: [],
      });
    },

    updateStationLayout: (id, patch) =>
      set((s) => {
        const stations = s.stations.map((station) =>
          station.id === id ? { ...station, layout: { ...station.layout, ...patch } } : station,
        );
        persistFloor(stations, s.zones);
        return { stations, savedAt: stamp() };
      }),

    moveSelection: (dx, dy) =>
      set((s) => {
        const stations = s.stations.map((station) =>
          s.selectedIds.includes(station.id)
            ? {
                ...station,
                layout: {
                  ...station.layout,
                  x: Math.round(station.layout.x + dx),
                  y: Math.round(station.layout.y + dy),
                },
              }
            : station,
        );
        persistFloor(stations, s.zones);
        return { stations };
      }),

    addStation: (type, zoneOrX, x, y) => {
      const state = get();
      const zoneName = typeof zoneOrX === "string" ? zoneOrX : "Main Hall";
      const px = typeof zoneOrX === "number" ? zoneOrX : (x ?? 120);
      const py = typeof zoneOrX === "number" ? (x ?? 120) : (y ?? 120);
      const prefix = zoneName === "VIP Room" ? "VIP" : zoneName === "Console Zone" ? "CS" : zoneName === "Esports Arena" ? "AR" : "MH";
      let n = 1;
      while (state.stations.some((s) => s.id === `${prefix}-${String(n).padStart(2, "0")}`)) n += 1;
      const id = `${prefix}-${String(n).padStart(2, "0")}`;
      const template = state.stations[0];
      const station: Station = {
        ...template,
        id,
        name: id,
        zone: zoneName as Station["zone"],
        status: "available",
        member: undefined,
        endsAt: undefined,
        startsAt: undefined,
        type,
        game: "Desktop Idle",
        locked: false,
        layout: {
          x: Math.round(px),
          y: Math.round(py),
          w: type === "table" ? 190 : type === "console" ? 172 : 160,
          h: type === "table" ? 100 : 84,
          rotation: 0,
        },
        telemetry: { ...template.telemetry },
      };
      withHistory(() => ({ stations: [...state.stations, station], zones: state.zones }));
      set({ selectedIds: [id] });
      return id;
    },

    addZone: (x, y) => {
      const state = get();
      const zone: ZoneDef = {
        id: `zone-${Date.now()}`,
        name: `New Zone ${state.zones.length + 1}`,
        x: Math.round(x),
        y: Math.round(y),
        w: 420,
        h: 260,
      };
      withHistory(() => ({ stations: state.stations, zones: [...state.zones, zone] }));
    },

    updateZone: (id, patch) =>
      set((s) => {
        const zones = s.zones.map((zone) => (zone.id === id ? { ...zone, ...patch } : zone));
        persistFloor(s.stations, zones);
        return { zones };
      }),

    renameStation: (id, name) =>
      withHistory((s) => ({
        stations: s.stations.map((station) =>
          station.id === id ? { ...station, name } : station,
        ),
        zones: s.zones,
      })),

    moveToZone: (ids, zone) =>
      withHistory((s) => ({
        stations: s.stations.map((station) =>
          ids.includes(station.id) ? { ...station, zone: zone as Station["zone"] } : station,
        ),
        zones: s.zones,
      })),

    deleteSelected: () =>
      withHistory((s) => ({
        stations: s.stations.filter((station) => !s.selectedIds.includes(station.id)),
        zones: s.zones,
        selectedIds: [],
      })),

    undo: () => {
      const state = get();
      const previous = state.past[state.past.length - 1];
      if (!previous) return;
      set({
        stations: previous.stations,
        zones: previous.zones,
        past: state.past.slice(0, -1),
        future: [
          ...state.future,
          {
            stations: JSON.parse(JSON.stringify(state.stations)),
            zones: JSON.parse(JSON.stringify(state.zones)),
          },
        ],
        selectedIds: [],
      });
      persistFloor(previous.stations, previous.zones);
    },

    redo: () => {
      const state = get();
      const next = state.future[state.future.length - 1];
      if (!next) return;
      set({
        stations: next.stations,
        zones: next.zones,
        future: state.future.slice(0, -1),
        past: [
          ...state.past,
          {
            stations: JSON.parse(JSON.stringify(state.stations)),
            zones: JSON.parse(JSON.stringify(state.zones)),
          },
        ],
        selectedIds: [],
      });
      persistFloor(next.stations, next.zones);
    },

    saveFloor: () => {
      persistFloor(get().stations, get().zones);
      set({ savedAt: stamp() });
    },

    resetFloor: () => {
      const state = get();
      const zones = ZONE_DEFS.map((zone) => ({ ...zone }));
      withHistory(() => ({
        stations: stationSeed.map((station) => ({ ...station, layout: { ...station.layout } })),
        zones,
        selectedIds: [],
      }));
      void state;
    },

    setDensity: (density) => set({ density }),
    setMonitorView: (view) => set({ monitorView: view }),
    setThumbInterval: (seconds) => set({ thumbInterval: seconds }),
    toggleThumbPaused: () => set((s) => ({ thumbPaused: !s.thumbPaused })),

    pushNotification: (notification) =>
      set((s) => ({
        notifications: [
          { ...notification, id: `n${Date.now()}`, at: "now", read: false },
          ...s.notifications,
        ].slice(0, 24),
      })),
    dismissNotification: (id) =>
      set((s) => ({ notifications: s.notifications.filter((item) => item.id !== id) })),
    markAllRead: () =>
      set((s) => ({ notifications: s.notifications.map((item) => ({ ...item, read: true })) })),
  };
});
