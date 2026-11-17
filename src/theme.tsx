import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PresetId =
  | "liqui"
  | "arctic"
  | "graphite"
  | "aurora"
  | "noir"
  | "crystal"
  | "nordic"
  | "tokyo"
  | "emerald"
  | "solar"
  | "velvet"
  | "titanium"
  | "cyber"
  | "synthwave"
  | "arcade"
  | "apex";

export type Mode = "dark" | "light";

export interface ThemePreset {
  id: PresetId;
  name: string;
  colors: [string, string, string];
  tint: string;
}

export const PRESETS: ThemePreset[] = [
  { id: "liqui", name: "Liqui", colors: ["#6F9DFF", "#A5B4FC", "#1E202E"], tint: "#141726" },
  { id: "arctic", name: "Arctic", colors: ["#38BDF8", "#7DD3FC", "#162232"], tint: "#0c1a26" },
  { id: "graphite", name: "Graphite", colors: ["#94A3B8", "#CBD5E1", "#1E242B"], tint: "#151a20" },
  { id: "aurora", name: "Aurora", colors: ["#34D399", "#A78BFA", "#12262A"], tint: "#0b1d1e" },
  { id: "noir", name: "Noir", colors: ["#F5F6FF", "#71717A", "#121215"], tint: "#0b0b0d" },
  { id: "crystal", name: "Crystal", colors: ["#22D3EE", "#F472B6", "#1B2432"], tint: "#111b2a" },
  { id: "nordic", name: "Nordic Cobalt", colors: ["#3B82F6", "#38BDF8", "#0F193B"], tint: "#0a1228" },
  { id: "tokyo", name: "Tokyo Dusk", colors: ["#F43F5E", "#F59E0B", "#311042"], tint: "#1c0e28" },
  { id: "emerald", name: "Emerald Lounge", colors: ["#10B981", "#14B8A6", "#0F2E28"], tint: "#081f1b" },
  { id: "solar", name: "Solar Sand", colors: ["#EA580C", "#EAB308", "#291D18"], tint: "#191210" },
  { id: "velvet", name: "Velvet Iris", colors: ["#8B5CF6", "#D946EF", "#1E1B4B"], tint: "#130f2e" },
  { id: "titanium", name: "Monochrome Titanium", colors: ["#E2E8F0", "#94A3B8", "#18181B"], tint: "#101013" },
  { id: "cyber", name: "Cyber Pulse", colors: ["#06B6D4", "#EC4899", "#1E1035"], tint: "#150b28" },
  { id: "synthwave", name: "Synthwave Prism", colors: ["#22D3EE", "#A855F7", "#17153B"], tint: "#0f0d2a" },
  { id: "arcade", name: "Arcade Volt", colors: ["#2563EB", "#FACC15", "#0F172A"], tint: "#0a1020" },
  { id: "apex", name: "Apex Racing", colors: ["#3B82F6", "#EF4444", "#111827"], tint: "#0b0f18" },
];

export type FontId = "inter" | "jakarta" | "grotesk" | "outfit" | "dmsans" | "rajdhani";

export interface FontPair {
  id: FontId;
  name: string;
  sans: string;
  mono: string;
  specimen: string;
}

export const FONT_PAIRS: FontPair[] = [
  {
    id: "inter",
    name: "Inter + JetBrains Mono",
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
    specimen: "Ops dashboard 128",
  },
  {
    id: "jakarta",
    name: "Plus Jakarta Sans + Geist Mono",
    sans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    mono: '"Geist Mono", ui-monospace, monospace',
    specimen: "Lounge control 24/7",
  },
  {
    id: "grotesk",
    name: "Space Grotesk + Space Mono",
    sans: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    mono: '"Space Mono", ui-monospace, monospace',
    specimen: "ARENA 04 · 240 FPS",
  },
  {
    id: "outfit",
    name: "Outfit + Fira Code",
    sans: '"Outfit", ui-sans-serif, system-ui, sans-serif',
    mono: '"Fira Code", ui-monospace, monospace',
    specimen: "Station 012 · 01:42:15",
  },
  {
    id: "dmsans",
    name: "DM Sans + IBM Plex Mono",
    sans: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
    specimen: "Revenue $4,286.50",
  },
  {
    id: "rajdhani",
    name: "Rajdhani + Share Tech Mono",
    sans: '"Rajdhani", ui-sans-serif, system-ui, sans-serif',
    mono: '"Share Tech Mono", ui-monospace, monospace',
    specimen: "MATCH LIVE · VIP 03",
  },
];

export interface Optics {
  strength: number;
  bezel: number;
  dispersion: number;
  frost: number;
  blur: number;
  specular: number;
}

export const DEFAULT_OPTICS: Optics = {
  strength: 58,
  bezel: 46,
  dispersion: 28,
  frost: 54,
  blur: 58,
  specular: 52,
};

export type BackgroundMode = "none" | "led" | "aurora" | "grid" | "grain";

export interface BackgroundSettings {
  mode: BackgroundMode;
  speed: number;
  intensity: number;
  paused: boolean;
}

export const DEFAULT_BACKGROUND: BackgroundSettings = {
  mode: "none",
  speed: 42,
  intensity: 55,
  paused: false,
};

const BACKGROUND_MODES: BackgroundMode[] = ["none", "led", "aurora", "grid", "grain"];

interface AppearanceState {
  presetId: PresetId;
  mode: Mode;
  fontId: FontId;
  optics: Optics;
  background: BackgroundSettings;
}

const DEFAULTS: AppearanceState = {
  presetId: "nordic",
  mode: "dark",
  fontId: "inter",
  optics: DEFAULT_OPTICS,
  background: DEFAULT_BACKGROUND,
};

const STORAGE_KEY = "nexus-appearance-v2";

function readSaved(): AppearanceState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AppearanceState>;
    return {
      presetId: PRESETS.some((p) => p.id === parsed.presetId)
        ? (parsed.presetId as PresetId)
        : DEFAULTS.presetId,
      mode: parsed.mode === "light" ? "light" : "dark",
      fontId: FONT_PAIRS.some((f) => f.id === parsed.fontId)
        ? (parsed.fontId as FontId)
        : DEFAULTS.fontId,
      optics: { ...DEFAULT_OPTICS, ...(parsed.optics ?? {}) },
      background: {
        ...DEFAULT_BACKGROUND,
        ...(parsed.background ?? {}),
        mode: BACKGROUND_MODES.includes(parsed.background?.mode as BackgroundMode)
          ? (parsed.background?.mode as BackgroundMode)
          : DEFAULT_BACKGROUND.mode,
      },
    };
  } catch {
    return DEFAULTS;
  }
}

interface ThemeContextValue {
  preset: ThemePreset;
  setPreset: (id: PresetId) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  font: FontPair;
  setFont: (id: FontId) => void;
  optics: Optics;
  setOptics: (patch: Partial<Optics>) => void;
  resetOptics: () => void;
  background: BackgroundSettings;
  setBackground: (patch: Partial<BackgroundSettings>) => void;
  resetBackground: () => void;
  resetAll: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeController({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppearanceState>(readSaved);

  const preset = PRESETS.find((p) => p.id === state.presetId) ?? PRESETS[0];
  const font = FONT_PAIRS.find((f) => f.id === state.fontId) ?? FONT_PAIRS[0];

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
    root.style.setProperty("--app-font-sans", font.sans);
    root.style.setProperty("--app-font-mono", font.mono);
    root.dataset.mode = state.mode;
    root.dataset.font = font.id;
    root.style.colorScheme = state.mode;

    const { strength, bezel, dispersion, frost, blur, specular } = state.optics;
    root.style.setProperty("--optics-strength", String(strength / 100));
    root.style.setProperty("--optics-bezel", String(bezel / 100));
    root.style.setProperty("--optics-dispersion", String(dispersion / 100));
    root.style.setProperty("--optics-frost", String(frost / 100));
    root.style.setProperty("--optics-blur", `${Math.round(6 + (blur / 100) * 30)}px`);
    root.style.setProperty("--optics-specular", String(specular / 100));

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable in private mode */
    }
  }, [preset, font, state]);

  const setPreset = useCallback(
    (presetId: PresetId) => setState((s) => ({ ...s, presetId })),
    [],
  );
  const setMode = useCallback((mode: Mode) => setState((s) => ({ ...s, mode })), []);
  const toggleMode = useCallback(
    () => setState((s) => ({ ...s, mode: s.mode === "dark" ? "light" : "dark" })),
    [],
  );
  const setFont = useCallback((fontId: FontId) => setState((s) => ({ ...s, fontId })), []);
  const setOptics = useCallback(
    (patch: Partial<Optics>) =>
      setState((s) => ({ ...s, optics: { ...s.optics, ...patch } })),
    [],
  );
  const resetOptics = useCallback(
    () => setState((s) => ({ ...s, optics: DEFAULT_OPTICS })),
    [],
  );
  const setBackground = useCallback(
    (patch: Partial<BackgroundSettings>) =>
      setState((s) => ({ ...s, background: { ...s.background, ...patch } })),
    [],
  );
  const resetBackground = useCallback(
    () => setState((s) => ({ ...s, background: DEFAULT_BACKGROUND })),
    [],
  );
  const resetAll = useCallback(() => setState(DEFAULTS), []);

  const value = useMemo(
    () => ({
      preset,
      setPreset,
      mode: state.mode,
      setMode,
      toggleMode,
      font,
      setFont,
      optics: state.optics,
      setOptics,
      resetOptics,
      background: state.background,
      setBackground,
      resetBackground,
      resetAll,
    }),
    [
      preset,
      setPreset,
      state.mode,
      setMode,
      toggleMode,
      font,
      setFont,
      state.optics,
      setOptics,
      resetOptics,
      state.background,
      setBackground,
      resetBackground,
      resetAll,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreset() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemePreset must be used inside ThemeController");
  return ctx;
}

/** Relative luminance helper used to keep text legible on accent fills. */
export function onAccent(hex: string) {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.45 ? "#0b1220" : "#ffffff";
}
