import { useState } from "react";
import {
  Button,
  Card,
  Dialog,
  NumberField,
  SegmentedControl,
  Switch,
  TextField,
  useToast,
} from "open-glass-ui";
import {
  Check,
  Cpu,
  Database,
  ExternalLink,
  MonitorDot,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { PageHeader, SectionHead, StatusPill } from "../components/Bits";
import { PRESETS, useThemePreset } from "../theme";
import { PresetSwatches } from "../components/ThemeSwitcher";

const INTEGRATIONS = [
  { name: "Stripe Terminal", detail: "Card present · Reader T2", status: "connected", icon: ShieldCheck },
  { name: "MQTT telemetry broker", detail: "24 nodes · 2s interval", status: "connected", icon: MonitorDot },
  { name: "Context7 docs", detail: "OpenGlass + React references", status: "connected", icon: Database },
  { name: "Playwright visual QA", detail: "Screenshot diff · nightly", status: "idle", icon: Terminal },
];

export default function Settings() {
  const { toast } = useToast();
  const { preset, setPreset } = usePresetSafe();
  const [density, setDensity] = useState("comfortable");
  const [ambient, setAmbient] = useState(true);
  const [autoLock, setAutoLock] = useState(true);
  const [telemetry, setTelemetry] = useState(true);
  const [sessionMinutes, setSessionMinutes] = useState(120);
  const [venueName, setVenueName] = useState("Nexus Gaming Lounge");
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        meta="Workspace defaults · Zone A · build 0.5.1"
        actions={
          <Button
            variant="primary"
            size="small"
            onClick={() => toast({ title: "Preferences saved", description: "Applied to this workspace." })}
          >
            Save changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-3">
          <section className="panel p-5">
            <SectionHead
              title="Theme palette"
              hint="6 curated presets"
              actions={<Palette size={14} className="text-white/30" />}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PRESETS.map((item) => {
                const active = item.id === preset.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPreset(item.id);
                      toast({ title: "Palette applied", description: item.name });
                    }}
                    className="relative overflow-hidden rounded-xl border p-3 text-left transition hover:-translate-y-0.5"
                    style={{
                      borderColor: active
                        ? "color-mix(in srgb, var(--theme-primary) 45%, transparent)"
                        : "var(--hairline)",
                      background: active
                        ? "color-mix(in srgb, var(--theme-primary) 8%, rgb(255 255 255 / 0.02))"
                        : "rgb(255 255 255 / 0.025)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <PresetSwatches colors={item.colors} size={16} />
                      {active && (
                        <span
                          className="grid size-4 place-items-center rounded-full text-[#08101c]"
                          style={{ background: "var(--theme-primary)" }}
                        >
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[12px] font-medium text-white/85">{item.name}</p>
                    <p className="num mt-0.5 text-[9px] uppercase tracking-[0.08em] text-white/28">
                      {item.colors.join(" · ")}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-white/32">
              Accent drives primary actions and focus. Secondary colors data. Surfaces stay neutral.
            </p>
          </section>

          <section className="panel p-5">
            <SectionHead title="Workspace defaults" hint="stations & sessions" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                label="Venue name"
                value={venueName}
                onChange={(event) => setVenueName(event.currentTarget.value)}
              />
              <NumberField
                label="Default session (min)"
                value={sessionMinutes}
                min={30}
                step={30}
                onValueChange={setSessionMinutes}
              />
            </div>
            <div className="mt-4 space-y-3">
              <Switch
                label="Auto-lock station at session end"
                description="Locks the guest desktop and opens checkout."
                checked={autoLock}
                onCheckedChange={(checked) => {
                  setAutoLock(checked);
                  toast({ title: checked ? "Auto-lock on" : "Auto-lock off" });
                }}
              />
              <Switch
                label="Stream telemetry to dashboard"
                description="CPU, GPU, ping and storage every 2 seconds."
                checked={telemetry}
                onCheckedChange={setTelemetry}
              />
            </div>
          </section>

          <section className="panel p-5">
            <SectionHead title="Integrations" hint="4 services" />
            <div className="space-y-1.5">
              {INTEGRATIONS.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center gap-3 rounded-xl border border-white/7 bg-white/2 px-3 py-2.5"
                >
                  <span className="grid size-8 place-items-center rounded-lg border border-white/8 bg-white/4 text-white/50">
                    <integration.icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-white/80">{integration.name}</p>
                    <p className="truncate text-[10px] text-white/30">{integration.detail}</p>
                  </div>
                  <StatusPill tone={integration.status === "connected" ? "green" : "slate"}>
                    {integration.status}
                  </StatusPill>
                  <Button
                    variant="quiet"
                    size="small"
                    aria-label={`Open ${integration.name}`}
                    onClick={() => toast({ title: `${integration.name} opened` })}
                  >
                    <ExternalLink size={13} />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-3">
          <section className="panel p-5">
            <SectionHead title="Interface" hint="density & motion" />
            <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-white/30">Table density</p>
            <SegmentedControl
              aria-label="Table density"
              value={density}
              onValueChange={(value) => {
                setDensity(value);
                document.documentElement.dataset.density = value;
              }}
              items={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
            />
            <div className="mt-4">
              <Switch
                label="Animated ambient mesh"
                description="Slow drifting light behind glass surfaces."
                checked={ambient}
                onCheckedChange={(checked) => {
                  setAmbient(checked);
                  document.documentElement.dataset.motion = checked ? "on" : "off";
                }}
              />
            </div>
            <div className="mt-4 rounded-xl border border-white/8 bg-white/3 p-3">
              <div className="flex items-center gap-2 text-[11px] text-white/55">
                <Sparkles size={13} />
                Dark liquid glass · frosted surfaces
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/30">
                Neutral #0B0D12–#141821 base. Spectral accents are reserved for status and data.
              </p>
            </div>
          </section>

          <Card eyebrow="Reference" title="Design stack" className="!p-5">
            <div className="space-y-2 text-[11px]">
              {[
                ["UI system", "open-glass-ui 0.5.1"],
                ["Renderer", "CSS · auto"],
                ["Charts", "Recharts 3"],
                ["State", "Zustand 5"],
                ["Icons", "Lucide 1.72"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-white/35">{label}</span>
                  <span className="num text-white/70">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-white/8 pt-3 text-[10px] text-white/30">
              <Cpu size={12} /> Type-safe · Vite 8 · React 19
            </div>
          </Card>

          <section className="panel p-5">
            <SectionHead title="Danger zone" hint="demo data" />
            <p className="text-[11px] leading-relaxed text-white/35">
              Resets stations, stock, members and theme to the seeded demo state.
            </p>
            <Button
              variant="danger"
              size="small"
              className="mt-3 w-full"
              leadingIcon={<RotateCcw size={13} />}
              onClick={() => setResetOpen(true)}
            >
              Reset demo data
            </Button>
          </section>
        </div>
      </div>

      <Dialog
        title="Reset demo data?"
        description="All local changes in this session will be discarded."
        open={resetOpen}
        onOpenChange={setResetOpen}
      >
        <div className="flex justify-end gap-2">
          <Button variant="quiet" onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => window.location.reload()}>
            Reset workspace
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function usePresetSafe() {
  return useThemePreset();
}
