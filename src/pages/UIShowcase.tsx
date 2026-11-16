import { useState } from "react";
import {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Dialog,
  Drawer,
  FileDropzone,
  IconButton,
  Menu,
  MenuItem,
  Meter,
  NumberField,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Stat,
  Stepper,
  Switch,
  Tabs,
  TextField,
  Textarea,
  ToggleButton,
  Toolbar,
  Tooltip,
  useToast,
} from "open-glass-ui";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  Clipboard,
  Copy,
  Download,
  Filter,
  Gamepad2,
  Layers,
  MessageSquare,
  Monitor,
  MoreHorizontal,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { PageHeader, SectionHead, StatusPill } from "../components/Bits";
import { FONT_PAIRS, PRESETS, useThemePreset } from "../theme";
import { useApp } from "../store";

function Lab({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[12.5px] font-semibold tracking-[-0.01em]">{title}</h3>
          {hint && <p className="mt-0.5 text-[10.5px] text-[rgb(var(--ink-rgb)/0.4)]">{hint}</p>}
        </div>
        <span className="rail-label">live</span>
      </div>
      {children}
    </section>
  );
}

function SwatchRow({ colors }: { colors: [string, string, string] }) {
  return (
    <div className="flex gap-1">
      {colors.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="h-6 flex-1 rounded-md border border-[color:var(--hairline)]"
          style={{ background: color }}
          title={color}
        />
      ))}
    </div>
  );
}

export default function UIShowcase() {
  const { toast } = useToast();
  const { preset, mode, setMode, setPreset, font } = useThemePreset();
  const density = useApp((s) => s.density);
  const setDensity = useApp((s) => s.setDensity);

  const [query, setQuery] = useState("");
  const [station, setStation] = useState("MH-01");
  const [duration, setDuration] = useState(120);
  const [tournament, setTournament] = useState("Solo");
  const [notify, setNotify] = useState(true);
  const [autoLock, setAutoLock] = useState(false);
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(2);
  const [slider, setSlider] = useState(62);
  const [segment, setSegment] = useState("floor");
  const [pressed, setPressed] = useState(false);
  const [radio, setRadio] = useState("card");
  const [bannerOpen, setBannerOpen] = useState(true);

  const foundations = (
    <div className="grid gap-3 xl:grid-cols-2">
      <Lab title="Colour tokens" hint="16 presets · token-driven, not hardcoded">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.slice(0, 8).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreset(item.id)}
              className="rounded-lg border p-1.5 text-left transition"
              style={{
                borderColor:
                  item.id === preset.id
                    ? "color-mix(in srgb, var(--theme-primary) 50%, transparent)"
                    : "var(--hairline)",
              }}
            >
              <SwatchRow colors={item.colors} />
              <p className="mt-1 truncate text-[9.5px] text-[rgb(var(--ink-rgb)/0.6)]">{item.name}</p>
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[color:var(--hairline)] p-2">
            <p className="eyebrow">Accent</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="size-6 rounded-md" style={{ background: "var(--theme-primary)" }} />
              <span className="num text-[10px] text-[rgb(var(--ink-rgb)/0.6)]">{preset.colors[0]}</span>
            </div>
          </div>
          <div className="rounded-lg border border-[color:var(--hairline)] p-2">
            <p className="eyebrow">Mode</p>
            <SegmentedControl
              aria-label="Appearance mode"
              value={mode}
              onValueChange={(value) => setMode(value as "dark" | "light")}
              items={[
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
              ]}
              className="mt-1"
            />
          </div>
        </div>
      </Lab>

      <Lab title="Typography" hint={`Active pair · ${font.name}`}>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[26px] font-semibold tracking-[-0.04em]">Page title</span>
            <span className="num text-[9px] text-[rgb(var(--ink-rgb)/0.3)]">28/32</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[18px] font-semibold tracking-[-0.02em]">Section heading</span>
            <span className="num text-[9px] text-[rgb(var(--ink-rgb)/0.3)]">18/24</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-[rgb(var(--ink-rgb)/0.75)]">Body copy for operational detail and descriptions.</span>
            <span className="num text-[9px] text-[rgb(var(--ink-rgb)/0.3)]">13/20</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Eyebrow label · 10/14</span>
            <span className="num text-[9px] text-[rgb(var(--ink-rgb)/0.3)]">uppercase</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="num text-[26px] font-medium">01:42:15</span>
            <span className="num text-[9px] text-[rgb(var(--ink-rgb)/0.3)]">tabular</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[color:var(--hairline)] pt-3">
          {FONT_PAIRS.map((item) => (
            <span
              key={item.id}
              className="rounded-md border px-2 py-1 text-[10px]"
              style={{
                fontFamily: item.sans,
                borderColor: item.id === font.id ? "color-mix(in srgb, var(--theme-primary) 45%, transparent)" : "var(--hairline)",
                color: item.id === font.id ? "var(--ink)" : "var(--muted)",
              }}
            >
              {item.name.split(" + ")[0]}
            </span>
          ))}
        </div>
      </Lab>

      <Lab title="Spacing, radius & elevation" hint="4px base scale · soft glass surfaces">
        <div className="flex items-end gap-2">
          {[2, 4, 8, 12, 16, 24, 32].map((value) => (
            <div key={value} className="flex flex-col items-center gap-1">
              <span className="rounded bg-[color:color-mix(in_srgb,var(--theme-primary)_36%,transparent)]" style={{ width: value, height: value }} />
              <span className="num text-[8px] text-[rgb(var(--ink-rgb)/0.3)]">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[8, 12, 16, 20, 26, 999].map((radius) => (
            <div
              key={radius}
              className="grid size-12 place-items-center border border-[color:var(--hairline)] bg-[rgb(var(--ink-rgb)/0.03)] text-[9px] text-[rgb(var(--ink-rgb)/0.45)]"
              style={{ borderRadius: radius }}
            >
              {radius === 999 ? "full" : radius}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["sm", "md", "lg"].map((size, index) => (
            <div
              key={size}
              className="grid h-14 place-items-center rounded-xl border border-[color:var(--hairline)] text-[9px] text-[rgb(var(--ink-rgb)/0.4)]"
              style={{ boxShadow: ["0 2px 8px rgb(0 0 0 / .2)", "0 8px 24px rgb(0 0 0 / .28)", "0 22px 60px rgb(0 0 0 / .38)"][index] }}
            >
              elevation {size}
            </div>
          ))}
        </div>
      </Lab>

      <Lab title="Iconography & status" hint="Lucide 1.75px stroke · status always has a label">
        <div className="flex flex-wrap gap-1.5">
          {[Gamepad2, Monitor, Wifi, Zap, Users, CalendarDays, MessageSquare, ShieldCheck, Layers, Bell, Settings2, Sparkles].map((Icon, index) => (
            <span key={index} className="grid size-9 place-items-center rounded-lg border border-[color:var(--hairline)] bg-[rgb(var(--ink-rgb)/0.03)] text-[rgb(var(--ink-rgb)/0.7)]">
              <Icon size={15} strokeWidth={1.75} />
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <StatusPill tone="green">Available</StatusPill>
          <StatusPill tone="blue">In session</StatusPill>
          <StatusPill tone="amber">Reserved</StatusPill>
          <StatusPill tone="red">Maintenance</StatusPill>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="positive">Positive</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <AvatarGroup>
            <Avatar name="Aria Chen" size="small" />
            <Avatar name="Marcus Vale" size="small" />
            <Avatar name="Yuki Tanaka" size="small" />
          </AvatarGroup>
          <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.45)]">4 of 6 seats filled</span>
        </div>
      </Lab>
    </div>
  );

  const forms = (
    <div className="grid gap-3 xl:grid-cols-2">
      <Lab title="Text inputs" hint="Labels always visible · errors are explicit">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Customer name" placeholder="Aria Chen" defaultValue="Aria Chen" />
          <TextField label="Station" placeholder="MH-01" hint="Assigns this order to the session" />
          <TextField label="Email" type="email" placeholder="aria@example.com" error="Use a valid email address" defaultValue="aria@" />
          <TextField label="Booking date" type="date" defaultValue="2026-11-16" />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <NumberField label="Guests" value={duration} onValueChange={setDuration} min={30} max={480} step={30} />
          <Select
            label="Station"
            value={station}
            onChange={(event) => setStation(event.target.value)}
            options={[
              { value: "MH-01", label: "MH-01 · Main Hall" },
              { value: "VIP-01", label: "VIP-01 · VIP Room" },
              { value: "AR-04", label: "AR-04 · Esports Arena" },
              { value: "CS-03", label: "CS-03 · Console Zone" },
            ]}
          />
        </div>
        <div className="mt-3">
          <SearchField label="Search stations" value={query} onValueChange={setQuery} placeholder="ID, member, game…" />
          {query && (
            <p className="mt-1 text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">
              Searching “{query}” across 36 stations and 4 zones.
            </p>
          )}
        </div>
        <div className="mt-3">
          <Textarea label="Shift note" placeholder="Handover notes for the next operator…" rows={3} />
        </div>
        <div className="mt-3">
          <FileDropzone
            label="Attach incident screenshot"
            accept="image/*"
            maxSizeBytes={4 * 1024 * 1024}
            onFiles={(files) => toast({ title: `${files.length} file(s) staged`, description: "Upload is simulated in the demo." })}
          />
        </div>
      </Lab>

      <Lab title="Selection controls" hint="Keyboard reachable · visible focus">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2.5">
            <Checkbox label="Notify member by SMS" description="On session end" defaultChecked />
            <Checkbox label="Apply loyalty discount" description="Platinum tier · 12%" defaultChecked />
            <Checkbox label="Print receipt" />
            <Switch label="Auto-lock on idle" description="10 minutes without input" checked={autoLock} onCheckedChange={setAutoLock} />
            <Switch label="Loud notification sound" checked={notify} onCheckedChange={setNotify} />
          </div>
          <div className="space-y-3">
            <RadioGroup
              label="Payment method"
              value={radio}
              onValueChange={setRadio}
              items={[
                { value: "card", label: "Card", description: "Terminal + online" },
                { value: "cash", label: "Cash", description: "Drawer reconciliation" },
                { value: "wallet", label: "Member wallet", description: "Instant balance debit" },
              ]}
            />
            <Slider label="Session length" value={duration} unit=" min" min={30} max={480} step={30} valueText={`${duration} min`} onChange={(event) => setDuration(Number(event.target.value))} />
            <Slider label="Glass opacity" value={slider} unit="%" min={0} max={100} valueText={`${slider}%`} onChange={(event) => setSlider(Number(event.target.value))} />
          </div>
        </div>
        <div className="mt-4 border-t border-[color:var(--hairline)] pt-3">
          <p className="eyebrow mb-2">Progressive disclosure</p>
          <Stepper
            items={[
              { label: "Guest" },
              { label: "Station" },
              { label: "Payment" },
              { label: "Confirm" },
            ]}
            current={step}
            onStepChange={setStep}
          />
          <div className="mt-2 flex gap-2">
            <Button variant="quiet" size="small" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </Button>
            <Button variant="secondary" size="small" disabled={step === 3} onClick={() => setStep((s) => Math.min(3, s + 1))}>
              Continue
            </Button>
          </div>
        </div>
      </Lab>
    </div>
  );

  const actions = (
    <div className="grid gap-3 xl:grid-cols-2">
      <Lab title="Buttons" hint="Four variants · three sizes · icon slots">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" leadingIcon={<Plus size={13} />}>Start session</Button>
          <Button variant="secondary" leadingIcon={<RefreshCw size={13} />}>Restart</Button>
          <Button variant="quiet">Cancel</Button>
          <Button variant="danger" leadingIcon={<Trash2 size={13} />}>End session</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="small" variant="secondary">Small</Button>
          <Button size="medium" variant="secondary">Medium</Button>
          <Button size="large" variant="secondary">Large</Button>
          <Button variant="primary" trailingIcon={<ArrowUpRight size={13} />}>Open report</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <IconButton aria-label="Search"><Search size={15} /></IconButton>
          <IconButton aria-label="Filter"><Filter size={15} /></IconButton>
          <IconButton aria-label="Copy"><Copy size={15} /></IconButton>
          <IconButton aria-label="More actions"><MoreHorizontal size={15} /></IconButton>
          <ToggleButton pressed={pressed} onPressedChange={setPressed}>
            <Layers size={13} className="mr-1 inline" /> {pressed ? "Grouped" : "Group tables"}
          </ToggleButton>
          <Tooltip label="Requires client agent">
            <Button variant="quiet" size="small" leadingIcon={<Wifi size={12} />}>Wake on LAN</Button>
          </Tooltip>
        </div>
        <div className="mt-4">
          <p className="eyebrow mb-2">Toolbar</p>
          <Toolbar label="Bulk station actions">
            <Button variant="quiet" size="small" leadingIcon={<Users size={12} />}>Select all</Button>
            <Button variant="quiet" size="small" leadingIcon={<Clipboard size={12} />}>Clone</Button>
            <Button variant="quiet" size="small" leadingIcon={<Download size={12} />}>Export</Button>
          </Toolbar>
        </div>
      </Lab>

      <Lab title="Menus & popovers" hint="Anchored · Escape closes · focus returns">
        <div className="flex flex-wrap gap-2">
          <Menu
            label="Station actions"
            trigger={<Button variant="secondary" size="small" leadingIcon={<Settings2 size={13} />}>Actions</Button>}
          >
            <MenuItem onClick={() => toast({ title: "Session started" })}>Start session</MenuItem>
            <MenuItem onClick={() => toast({ title: "Time added" })}>Add 30 minutes</MenuItem>
            <MenuItem onClick={() => toast({ title: "Message composer opened" })}>Send message</MenuItem>
            <MenuItem destructive onClick={() => toast({ title: "Force logout queued", description: "Simulated · agent required" })}>
              Force logout
            </MenuItem>
          </Menu>
          <Popover
            label="Quick filters"
            trigger={<Button variant="secondary" size="small" leadingIcon={<Filter size={13} />}>Filters</Button>}
          >
            <div className="w-52 space-y-2 p-1">
              <p className="eyebrow">Filter stations</p>
              <Checkbox label="In session" defaultChecked />
              <Checkbox label="Has alerts" />
              <Checkbox label="Locked" />
              <Button size="small" variant="primary" className="mt-1 w-full">Apply filters</Button>
            </div>
          </Popover>
          <Menu
            label="Row actions"
            trigger={<IconButton aria-label="More"><MoreHorizontal size={15} /></IconButton>}
          >
            <MenuItem>Duplicate layout</MenuItem>
            <MenuItem>Save as preset</MenuItem>
            <MenuItem destructive>Delete zone</MenuItem>
          </Menu>
        </div>
        <div className="mt-4 space-y-2">
          <Banner
            title="2 stations are running outdated client agents"
            action={<Button variant="quiet" size="small">Update all</Button>}
            dismissible
            onDismiss={() => setBannerOpen(false)}
          >
            {bannerOpen ? "Agent 2.7.4 is below the recommended 2.8.1." : null}
          </Banner>
          <Alert title="Session conflict detected" tone="warning">
            VIP-03 is reserved at 20:00 but the current session runs until 20:40.
          </Alert>
          <Alert title="Order settled" tone="positive">
            $42.50 charged to Aria Chen’s wallet · receipt #NX-8821.
          </Alert>
          <Alert title="Agent disconnected" tone="danger" onDismiss={() => toast({ title: "Alert dismissed" })}>
            AR-12 stopped reporting telemetry 4 minutes ago.
          </Alert>
        </div>
      </Lab>
    </div>
  );

  const data = (
    <div className="grid gap-3 xl:grid-cols-2">
      <Lab title="Data display" hint="Metrics, progress and tables share one type scale">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Occupancy" value="68%" change="+6 pts" tone="positive" />
          <Stat label="Open sessions" value="17" change="+3" tone="neutral" />
        </div>
        <div className="mt-3 grid gap-2">
          <Progress label="Floor occupancy" value={68} max={100} />
          <Progress label="Cafe stock health" value={82} max={100} />
          <Meter label="GPU thermal envelope" value={74} min={0} max={100} low={30} high={80} optimum={60} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Spinner label="Syncing telemetry" />
          <Skeleton width="120px" />
          <Skeleton width="72px" />
          <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.35)]">loading states</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table w-full min-w-[420px]">
            <thead>
              <tr>
                <th>Member</th>
                <th>Station</th>
                <th className="num">Spend</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Aria Chen", "AR-01", "$184.20", "In session"],
                ["Marcus Vale", "VIP-02", "$96.40", "In session"],
                ["Yuki Tanaka", "MH-07", "$41.00", "Reserved"],
                ["Dev Patel", "AR-07", "$218.90", "In session"],
              ].map(([name, id, spend, status]) => (
                <tr key={id}>
                  <td>{name}</td>
                  <td className="num">{id}</td>
                  <td className="num">{spend}</td>
                  <td>
                    <Badge tone={status === "In session" ? "accent" : "warning"}>{status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Lab>

      <Lab title="Station card laboratory" hint="Density adapts without hiding the essentials">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            aria-label="Station card density"
            value={density}
            onValueChange={(value) => setDensity(value as typeof density)}
            items={[
              { value: "compact", label: "Compact" },
              { value: "standard", label: "Standard" },
              { value: "detailed", label: "Detailed" },
            ]}
          />
          <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">Applies to the floor and monitoring grids.</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { id: "MH-04", member: "Aria Chen", status: "in session", cpu: 71, gpu: 82, ping: 9 },
            { id: "VIP-01", member: "Marcus Vale", status: "in session", cpu: 64, gpu: 77, ping: 11 },
            { id: "AR-05", member: "Open", status: "ready", cpu: 32, gpu: 28, ping: 7 },
            { id: "CS-03", member: "Yuki Tanaka", status: "reserved", cpu: 41, gpu: 39, ping: 14 },
            { id: "AR-12", member: "Offline", status: "maintenance", cpu: 0, gpu: 0, ping: 0 },
            { id: "MH-09", member: "Dev Patel", status: "in session", cpu: 58, gpu: 66, ping: 8 },
          ].map((item) => (
            <div
              key={item.id}
              className="rounded-xl border p-2.5"
              style={{
                borderColor: "var(--hairline)",
                background: "rgb(var(--ink-rgb) / 0.028)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="num text-[11.5px] font-medium">{item.id}</span>
                <span
                  className="dot"
                  style={{
                    background:
                      item.status === "ready"
                        ? "#34d399"
                        : item.status === "maintenance"
                          ? "#f87171"
                          : item.status === "reserved"
                            ? "#f59e0b"
                            : "var(--theme-primary)",
                  }}
                />
              </div>
              <p className="mt-0.5 truncate text-[9.5px] text-[rgb(var(--ink-rgb)/0.35)]">{item.member}</p>
              {density === "compact" ? (
                <p className="num mt-1.5 text-[11px] text-[rgb(var(--ink-rgb)/0.7)]">{item.cpu}° / {item.gpu}°</p>
              ) : (
                <div className="mt-1.5 flex items-end justify-between">
                  <span className="num text-[16px] text-[rgb(var(--ink-rgb)/0.85)]">{item.cpu}°</span>
                  <span className="num text-[9px] text-[rgb(var(--ink-rgb)/0.35)]">{item.ping}ms</span>
                </div>
              )}
              {density === "detailed" && (
                <div className="mt-1.5 flex gap-1 border-t border-[color:var(--hairline)] pt-1.5">
                  <span className="mini-meter flex-1"><span style={{ width: `${item.cpu}%`, background: "var(--theme-primary)" }} /></span>
                  <span className="mini-meter flex-1"><span style={{ width: `${item.gpu}%`, background: "var(--theme-secondary)" }} /></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Lab>

      <Lab title="Navigation" hint="Breadcrumbs, pagination, accordion and tabs">
        <Breadcrumbs items={[{ label: "Operations", href: "#" }, { label: "Monitoring", href: "#" }, { label: "AR-04" }]} />
        <div className="mt-3">
          <Accordion
            multiple
            defaultOpenIds={["thermal"]}
            headingLevel={4}
            items={[
              {
                id: "thermal",
                title: "Thermal policy",
                content: (
                  <p className="text-[11px] leading-relaxed text-[rgb(var(--ink-rgb)/0.55)]">
                    Warn at 80°C, throttle at 86°C, and raise a critical alert at 90°C. VIP stations keep a
                    +5°C margin before throttling.
                  </p>
                ),
              },
              {
                id: "billing",
                title: "Billing rules",
                content: (
                  <p className="text-[11px] leading-relaxed text-[rgb(var(--ink-rgb)/0.55)]">
                    Sessions round to the next 15 minutes. Member wallet debits happen at session end, with a
                    pre-authorisation hold for VIP bookings.
                  </p>
                ),
              },
              {
                id: "handover",
                title: "Shift handover",
                content: (
                  <p className="text-[11px] leading-relaxed text-[rgb(var(--ink-rgb)/0.55)]">
                    Reconcile cash, close open tabs, and snapshot the floor layout before handing over.
                  </p>
                ),
              },
            ]}
          />
        </div>
        <div className="mt-3">
          <Pagination page={page} count={9} onPageChange={setPage} />
        </div>
      </Lab>
    </div>
  );

  const overlays = (
    <div className="grid gap-3 xl:grid-cols-2">
      <Lab title="Overlays" hint="Contained focus · scrollable content · safe escape">
        <div className="flex flex-wrap gap-2">
          <Dialog
            title="Start session"
            description="Assign this station and open a billing block."
            triggerLabel="Open dialog"
            closeOnBackdrop
          >
            <div className="space-y-3">
              <TextField label="Member" defaultValue="Aria Chen" />
              <Select
                label="Duration"
                defaultValue="120"
                options={[
                  { value: "60", label: "1 hour" },
                  { value: "120", label: "2 hours" },
                  { value: "180", label: "3 hours" },
                ]}
              />
              <div className="flex justify-end gap-2">
                <Button variant="quiet" size="small">Cancel</Button>
                <Button variant="primary" size="small">Start session</Button>
              </div>
            </div>
          </Dialog>
          <Drawer
            title="Station AR-04"
            description="Live controls, telemetry and history."
            triggerLabel="Open drawer"
          >
            <div className="space-y-3">
              <Alert title="Client agent online" tone="positive">Telemetry is current within 2 seconds.</Alert>
              <TextField label="Overlay message" placeholder="Match starts in 5 minutes" />
              <div className="flex gap-2">
                <Button variant="secondary" size="small">Lock</Button>
                <Button variant="secondary" size="small">Restart</Button>
                <Button variant="danger" size="small">Force logout</Button>
              </div>
            </div>
          </Drawer>
          <Button
            variant="primary"
            size="small"
            leadingIcon={<Bell size={13} />}
            onClick={() =>
              toast({
                title: "Session started · NH-04",
                description: "2 hours · Aria Chen",
                actionLabel: "Undo",
                onAction: () => toast({ title: "Session reverted" }),
              })
            }
          >
            Trigger toast
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          <MessageSquare size={13} className="text-[rgb(var(--ink-rgb)/0.35)]" />
          <p className="text-[11px] leading-relaxed text-[rgb(var(--ink-rgb)/0.45)]">
            Destructive actions always ask for confirmation. Overlays trap focus and return it to the
            trigger; Escape dismisses the topmost layer first.
          </p>
        </div>
      </Lab>

      <Lab title="Empty, loading & error states" hint="Never show a spinner without a label">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-dashed border-[color:var(--hairline-strong)] p-4 text-center">
            <Gamepad2 size={22} className="mx-auto text-[rgb(var(--ink-rgb)/0.3)]" />
            <p className="mt-2 text-[11.5px] font-medium">No sessions today</p>
            <p className="mt-0.5 text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">Start a session from the floor map.</p>
            <Button variant="secondary" size="small" className="mt-2">Open floor map</Button>
          </div>
          <div className="rounded-xl border border-[color:var(--hairline)] p-4">
            <Spinner label="Loading telemetry" />
            <div className="mt-3 space-y-2">
              <Skeleton width="80%" />
              <Skeleton width="60%" />
              <Skeleton width="72%" />
            </div>
          </div>
        </div>
        <Alert title="Could not refresh telemetry" tone="danger" onDismiss={() => toast({ title: "Dismissed" })}>
          The agent gateway timed out after 8 seconds. The last known values are shown.
        </Alert>
      </Lab>
    </div>
  );

  const materials = (
    <div className="grid gap-3 xl:grid-cols-2">
      <Lab title="Glass materials" hint="Same content, four optics profiles">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["clear", "Minimal frost, high clarity"],
              ["frosted", "Soft diffusion, lower contrast"],
              ["tinted", "Strong surface tint"],
              ["highlights", "Edge lensing and specular rim"],
            ] as const
          ).map(([name, hint], index) => (
            <div
              key={name}
              className="relative overflow-hidden rounded-xl border border-[color:var(--hairline)] p-3"
              style={{
                background:
                  index === 0
                    ? "rgb(var(--ink-rgb) / 0.02)"
                    : index === 1
                      ? "rgb(var(--ink-rgb) / 0.08)"
                      : index === 2
                        ? "color-mix(in srgb, var(--theme-primary) 16%, transparent)"
                        : `linear-gradient(135deg, color-mix(in srgb, ${preset.colors[0]} 26%, transparent), color-mix(in srgb, ${preset.colors[1]} 12%, transparent))`,
                backdropFilter: index === 1 ? "blur(18px)" : undefined,
                boxShadow: index === 3 ? "inset 0 1px 0 rgb(var(--ink-rgb) / .25), 0 10px 30px rgb(0 0 0 / .25)" : undefined,
              }}
            >
              <p className="text-[11px] font-medium capitalize">{name}</p>
              <p className="mt-0.5 text-[9.5px] text-[rgb(var(--ink-rgb)/0.45)]">{hint}</p>
              <div className="mt-2 flex gap-1">
                <span className="h-1.5 w-8 rounded-full bg-[color:color-mix(in_srgb,var(--theme-primary)_55%,transparent)]" />
                <span className="h-1.5 w-4 rounded-full bg-[rgb(var(--ink-rgb)/0.2)]" />
              </div>
            </div>
          ))}
        </div>
      </Lab>

      <Lab title="Motion principles" hint="120–320ms · one focal movement per surface">
        <div className="space-y-2">
          {[
            ["Press feedback", "120ms scale 0.97", "Buttons, cards, menu rows"],
            ["Hover lift", "160ms translateY(-1px)", "Station tiles, data rows"],
            ["Drawer entry", "320ms cubic-bezier(.22,1,.36,1)", "Right-hand station drawer"],
            ["Menu pop", "140ms scale(.96) → 1", "Context menus and popovers"],
            ["Layout drag", "no transition while dragging", "Frame-perfect pointer tracking"],
          ].map(([name, timing, usage]) => (
            <div key={name} className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--hairline)] px-2.5 py-1.5">
              <div>
                <p className="text-[11px] font-medium">{name}</p>
                <p className="num text-[9px] text-[rgb(var(--ink-rgb)/0.35)]">{timing}</p>
              </div>
              <span className="text-right text-[9px] text-[rgb(var(--ink-rgb)/0.4)]">{usage}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-[color:var(--hairline)] bg-[rgb(var(--ink-rgb)/0.03)] p-2.5">
          <p className="text-[10px] leading-relaxed text-[rgb(var(--ink-rgb)/0.45)]">
            <Palette size={10} className="mr-1 inline" />
            All motion honours <span className="num">prefers-reduced-motion</span> at the provider level;
            functional transitions still complete instantly.
          </p>
        </div>
      </Lab>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Component laboratory"
        title="UI showcase"
        meta={
          <span className="flex flex-wrap items-center gap-2">
            <span>Every primitive used in this platform, in one interactive place.</span>
            <span className="chip !h-5">{preset.name}</span>
            <span className="chip !h-5">{font.name.split(" + ")[0]}</span>
            <span className="chip !h-5 uppercase">{mode}</span>
          </span>
        }
        actions={
          <Button
            variant="secondary"
            size="small"
            leadingIcon={<RefreshCw size={13} />}
            onClick={() => toast({ title: "Showcase refreshed", description: "Component states re-mounted." })}
          >
            Refresh states
          </Button>
        }
      />

      <Tabs
        label="Showcase sections"
        defaultValue="foundations"
        items={[
          { value: "foundations", label: "Foundations", content: foundations },
          { value: "forms", label: "Forms", content: forms },
          { value: "actions", label: "Actions", content: actions },
          { value: "data", label: "Data & cards", content: data },
          { value: "overlays", label: "Overlays & states", content: overlays },
          { value: "materials", label: "Materials & motion", content: materials },
        ]}
      />

      <div className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-[10.5px] text-[rgb(var(--ink-rgb)/0.45)]">
          <Check size={13} style={{ color: "#34d399" }} />
          Interactive playground — no dead controls. Every action gives feedback.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="quiet"
            size="small"
            leadingIcon={<Upload size={12} />}
            onClick={() => toast({ title: "Export queued", description: "Simulated design-token export." })}
          >
            Export tokens
          </Button>
          <Button
            variant="quiet"
            size="small"
            leadingIcon={<Sparkles size={12} />}
            onClick={() => toast({ title: "Appearance studio is in the header", description: "Open the palette button to tune glass optics." })}
          >
            Tune glass
          </Button>
        </div>
      </div>
    </div>
  );
}
