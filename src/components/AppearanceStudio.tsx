import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, IconButton } from "open-glass-ui";
import {
  Check,
  Moon,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Type,
  X,
} from "lucide-react";
import {
  DEFAULT_OPTICS,
  FONT_PAIRS,
  PRESETS,
  useThemePreset,
  type Optics,
} from "../theme";

const OPTICS: { key: keyof Optics; label: string; hint: string }[] = [
  { key: "strength", label: "Glass strength", hint: "Tint density of every surface" },
  { key: "bezel", label: "Bezel", hint: "Edge width and rim intensity" },
  { key: "dispersion", label: "Dispersion", hint: "Chromatic refraction on edges" },
  { key: "frost", label: "Frost", hint: "Backdrop saturation and diffusion" },
  { key: "blur", label: "Blur", hint: "Backdrop blur radius" },
  { key: "specular", label: "Specular", hint: "Directional highlight strength" },
];

function Swatches({ colors, size = 14 }: { colors: [string, string, string]; size?: number }) {
  return (
    <span className="flex shrink-0 items-center">
      {colors.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="swatch"
          style={{
            background: color,
            width: size,
            height: size,
            marginLeft: index === 0 ? 0 : -size / 3,
            zIndex: 3 - index,
          }}
        />
      ))}
    </span>
  );
}

export default function AppearanceStudio() {
  const {
    preset,
    setPreset,
    mode,
    setMode,
    font,
    setFont,
    optics,
    setOptics,
    resetOptics,
    resetAll,
  } = useThemePreset();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="quiet"
        size="small"
        className="gap-2"
        onClick={() => setOpen(true)}
        aria-label="Open appearance studio"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Palette size={15} strokeWidth={1.9} />
        <Swatches colors={preset.colors} size={10} />
        <span className="hidden text-[11px] font-medium text-[rgb(var(--ink-rgb)/0.6)] xl:inline">
          Studio
        </span>
      </Button>

      {open &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close appearance studio"
              className="glass-backdrop"
              onClick={close}
            />
            <aside
              className="drawer-glass"
              role="dialog"
              aria-modal="true"
              aria-label="Appearance studio"
              style={{ width: "min(430px, calc(100vw - 24px))" }}
            >
            <div className="drawer-hero">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow flex items-center gap-1.5">
                    <Sparkles size={11} /> Appearance studio
                  </p>
                  <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.02em]">
                    Tune the glass
                  </h2>
                  <p className="mt-1 text-[11px] text-[rgb(var(--ink-rgb)/0.45)]">
                    Live preview · persisted to this browser
                  </p>
                </div>
                <IconButton aria-label="Close" onClick={close}>
                  <X size={15} />
                </IconButton>
              </div>

              <div
                className="mt-4 grid grid-cols-2 gap-2 rounded-xl border p-3"
                style={{
                  borderColor: "var(--hairline)",
                  background: `linear-gradient(135deg, color-mix(in srgb, ${preset.colors[0]} 26%, transparent), color-mix(in srgb, ${preset.colors[1]} 12%, transparent) 55%, transparent)`,
                }}
              >
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[rgb(var(--ink-rgb)/0.45)]">
                    Accent
                  </p>
                  <p className="num mt-1 text-[15px]">{preset.colors[0]}</p>
                  <p className="mt-1 text-[10px] text-[rgb(var(--ink-rgb)/0.5)]">{preset.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[rgb(var(--ink-rgb)/0.45)]">
                    Type specimen
                  </p>
                  <p className="mt-0.5 text-[18px] font-semibold" style={{ fontFamily: font.sans }}>
                    {font.specimen}
                  </p>
                  <p className="num text-[10px] text-[rgb(var(--ink-rgb)/0.5)]">01:42:15</p>
                </div>
              </div>
            </div>

            <div className="drawer-body space-y-6">
              <section>
                <p className="eyebrow mb-2">Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "light", label: "Light", icon: Sun },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition"
                      style={{
                        borderColor:
                          mode === item.id
                            ? "color-mix(in srgb, var(--theme-primary) 45%, transparent)"
                            : "var(--hairline)",
                        background:
                          mode === item.id
                            ? "color-mix(in srgb, var(--theme-primary) 14%, transparent)"
                            : "rgb(var(--ink-rgb) / 0.03)",
                      }}
                    >
                      <span className="flex items-center gap-2 text-[12px] font-medium">
                        <item.icon size={14} /> {item.label}
                      </span>
                      {mode === item.id && <Check size={12} strokeWidth={2.6} />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <p className="eyebrow">Colour presets</p>
                  <span className="rail-label">{PRESETS.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPreset(item.id)}
                      className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition"
                      style={{
                        borderColor:
                          item.id === preset.id
                            ? "color-mix(in srgb, var(--theme-primary) 48%, transparent)"
                            : "transparent",
                        background:
                          item.id === preset.id
                            ? "color-mix(in srgb, var(--theme-primary) 13%, transparent)"
                            : "transparent",
                      }}
                    >
                      <Swatches colors={item.colors} size={12} />
                      <span className="truncate text-[11px] text-[rgb(var(--ink-rgb)/0.78)]">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="eyebrow mb-2 flex items-center gap-1.5">
                  <Type size={11} /> Typography
                </p>
                <div className="space-y-1">
                  {FONT_PAIRS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="font-row"
                      data-active={item.id === font.id}
                      onClick={() => setFont(item.id)}
                    >
                      <span className="min-w-0">
                        <span
                          className="block truncate text-[13px] font-medium text-[rgb(var(--ink-rgb)/0.86)]"
                          style={{ fontFamily: item.sans }}
                        >
                          {item.specimen}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">
                          {item.name}
                        </span>
                      </span>
                      {item.id === font.id && <Check size={13} strokeWidth={2.4} />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <p className="eyebrow flex items-center gap-1.5">
                    <SlidersHorizontal size={11} /> Glass optics
                  </p>
                  <Button variant="quiet" size="small" onClick={resetOptics}>
                    Reset
                  </Button>
                </div>
                <div className="space-y-3.5">
                  {OPTICS.map((item) => (
                    <label key={item.key} className="block">
                      <span className="flex items-baseline justify-between">
                        <span className="text-[11.5px] font-medium text-[rgb(var(--ink-rgb)/0.75)]">
                          {item.label}
                        </span>
                        <span className="num text-[10px] text-[rgb(var(--ink-rgb)/0.45)]">
                          {optics[item.key]}
                        </span>
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={optics[item.key]}
                        onChange={(event) =>
                          setOptics({ [item.key]: Number(event.target.value) } as Partial<Optics>)
                        }
                        className="range-input mt-1"
                        style={{ ["--range" as string]: `${optics[item.key]}%` }}
                        aria-label={item.label}
                      />
                      <span className="text-[9.5px] text-[rgb(var(--ink-rgb)/0.32)]">
                        {item.hint}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-[color:var(--hairline)] p-3">
                <p className="eyebrow mb-2">Component preview</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary" size="small">
                    Start session
                  </Button>
                  <Button variant="secondary" size="small">
                    Add time
                  </Button>
                  <span className="chip">VIP · 01:42:15</span>
                  <span className="dot dot-live" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[82, 54, 36].map((value, index) => (
                    <div key={index} className="rounded-lg border border-[color:var(--hairline)] p-2">
                      <p className="text-[9px] text-[rgb(var(--ink-rgb)/0.4)]">
                        {["CPU", "GPU", "RAM"][index]}
                      </p>
                      <p className="num text-[14px]">{value}%</p>
                      <div className="mini-meter mt-1.5">
                        <span
                          style={{
                            width: `${value}%`,
                            background:
                              index === 1 ? "var(--theme-secondary)" : "var(--theme-primary)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button
                type="button"
                onClick={resetAll}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--hairline)] py-2 text-[11px] text-[rgb(var(--ink-rgb)/0.55)] transition hover:bg-[rgb(var(--ink-rgb)/0.05)]"
              >
                <RotateCcw size={12} /> Reset all appearance settings
              </button>
              <p className="text-center text-[9.5px] text-[rgb(var(--ink-rgb)/0.3)]">
                Defaults · {DEFAULT_OPTICS.strength}% strength · {DEFAULT_OPTICS.blur}% blur
              </p>
            </div>
          </aside>
        </>,
        document.body,
      )}
    </>
  );
}
