import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PresetId =
  | "cobalt"
  | "tokyo"
  | "emerald"
  | "solar"
  | "iris"
  | "titanium";

export interface ThemePreset {
  id: PresetId;
  name: string;
  colors: [string, string, string];
  tint: string;
}

export const PRESETS: ThemePreset[] = [
  {
    id: "cobalt",
    name: "Nordic Cobalt",
    colors: ["#3B82F6", "#38BDF8", "#1E293B"],
    tint: "#0d1522",
  },
  {
    id: "tokyo",
    name: "Tokyo Dusk",
    colors: ["#F43F5E", "#F59E0B", "#311042"],
    tint: "#180f1c",
  },
  {
    id: "emerald",
    name: "Emerald Lounge",
    colors: ["#10B981", "#2DD4BF", "#064E3B"],
    tint: "#0a1714",
  },
  {
    id: "solar",
    name: "Solar Sand",
    colors: ["#EA580C", "#EAB308", "#291D18"],
    tint: "#17110d",
  },
  {
    id: "iris",
    name: "Velvet Iris",
    colors: ["#8B5CF6", "#D946EF", "#1E1B4B"],
    tint: "#120f22",
  },
  {
    id: "titanium",
    name: "Monochrome Titanium",
    colors: ["#E2E8F0", "#94A3B8", "#18181B"],
    tint: "#111114",
  },
];

interface ThemeContextValue {
  preset: ThemePreset;
  setPreset: (id: PresetId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeController({ children }: { children: ReactNode }) {
  const [id, setId] = useState<PresetId>(() => {
    if (typeof window === "undefined") return "cobalt";
    const saved = window.localStorage.getItem("nexus-theme");
    return PRESETS.some((p) => p.id === saved) ? (saved as PresetId) : "cobalt";
  });

  const preset = PRESETS.find((p) => p.id === id) ?? PRESETS[0];

  useEffect(() => {
    const root = document.documentElement;
    const [primary, secondary, tertiary] = preset.colors;
    root.style.setProperty("--theme-primary", primary);
    root.style.setProperty("--theme-secondary", secondary);
    root.style.setProperty("--theme-tertiary", tertiary);
    root.style.setProperty("--theme-surface-tint", preset.tint);
    root.style.setProperty("--theme-ambient-1", primary);
    root.style.setProperty("--theme-ambient-2", secondary);
    root.style.setProperty("--theme-ambient-3", tertiary);
    window.localStorage.setItem("nexus-theme", preset.id);
  }, [preset]);

  const value = useMemo(() => ({ preset, setPreset: setId }), [preset]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreset() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemePreset must be used inside ThemeController");
  return ctx;
}
