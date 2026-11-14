import { create } from "zustand";
import {
  inventory as inventorySeed,
  members as memberSeed,
  stations as stationSeed,
  type InventoryItem,
  type Member,
  type Station,
} from "./data";

export type CafeMode = "pos" | "floor";

export interface CartLine {
  productId: string;
  qty: number;
}

interface AppState {
  sidebarCollapsed: boolean;
  mobileNav: boolean;
  cafeMode: CafeMode;
  activeCategory: string;
  cafeQuery: string;
  cart: CartLine[];
  cartTarget: string | null;
  stations: Station[];
  stock: InventoryItem[];
  members: Member[];
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
  restock: (itemId: string, qty: number) => void;
  addStockItem: (item: InventoryItem) => void;
  topUp: (memberId: string, amount: number) => void;
  addMember: (member: Member) => void;
}

export const useApp = create<AppState>((set) => ({
  sidebarCollapsed: false,
  mobileNav: false,
  cafeMode: "pos",
  activeCategory: "All",
  cafeQuery: "",
  cart: [],
  cartTarget: null,
  stations: stationSeed,
  stock: inventorySeed,
  members: memberSeed,

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
    set(() => ({
      cart: [],
      cartTarget: null,
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
}));
