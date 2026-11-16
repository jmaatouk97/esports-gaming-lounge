import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  Popover,
  Tooltip,
  useToast,
} from "open-glass-ui";
import {
  Activity,
  Bell,
  Boxes,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileBarChart2,
  FlaskConical,
  Gamepad2,
  LayoutDashboard,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  UtensilsCrossed,
  Users,
  Wallet,
  X,
} from "lucide-react";
import AppearanceStudio from "./AppearanceStudio";
import { useApp } from "../store";
import { alerts } from "../data";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/cafe", label: "Cafe & Floor", icon: UtensilsCrossed },
  { to: "/stock", label: "Stock", icon: Boxes },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/members", label: "Members", icon: Users },
  { to: "/monitoring", label: "Monitoring", icon: Activity },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/reports", label: "Shift Reports", icon: FileBarChart2 },
  { to: "/ui-showcase", label: "UI Showcase", icon: FlaskConical },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/cafe": "Cafe & Floor",
  "/stock": "Stock & Inventory",
  "/finance": "Finance",
  "/members": "Members",
  "/monitoring": "Monitoring",
  "/events": "Events",
  "/reports": "Shift Reports",
  "/settings": "Settings",
  "/ui-showcase": "UI Showcase",
};

function OccupancyRail() {
  const stations = useApp((s) => s.stations);
  const occupied = stations.filter((s) => s.status === "in-use").length;
  const pct = (occupied / stations.length) * 100;

  return (
    <div className="rounded-xl border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.03)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[rgb(var(--ink-rgb)/0.55)]">Floor live</span>
        <span className="num text-[11px] text-[rgb(var(--ink-rgb)/0.80)]">
          {occupied}/{stations.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--ink-rgb)/0.08)]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, var(--theme-primary), var(--theme-secondary))",
            boxShadow: "0 0 12px color-mix(in srgb, var(--theme-primary) 55%, transparent)",
          }}
        />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="dot dot-live" />
        <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.40)]">Telemetry synced · 2s</span>
      </div>
    </div>
  );
}

export default function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const collapsed = useApp((s) => s.sidebarCollapsed);
  const toggleSidebar = useApp((s) => s.toggleSidebar);
  const mobileNav = useApp((s) => s.mobileNav);
  const setMobileNav = useApp((s) => s.setMobileNav);
  const stations = useApp((s) => s.stations);
  const members = useApp((s) => s.members);
  const openStation = useApp((s) => s.openStation);
  const notifications = useApp((s) => s.notifications);
  const dismissNotification = useApp((s) => s.dismissNotification);
  const markAllRead = useApp((s) => s.markAllRead);
  const activeSessions = stations.filter((s) => s.status === "in-use").length;
  const unread = notifications.filter((item) => !item.read).length;
  const [clock, setClock] = useState(() => new Date());
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const query = commandQuery.trim().toLowerCase();
  const stationHits = query
    ? stations.filter((s) =>
        `${s.id} ${s.name} ${s.zone} ${s.member ?? ""} ${s.game}`.toLowerCase().includes(query),
      ).slice(0, 6)
    : [];
  const memberHits = query
    ? members.filter((m) => `${m.name} ${m.id} ${m.tier}`.toLowerCase().includes(query)).slice(0, 4)
    : [];
  const pageHits = query
    ? NAV.filter((item) => item.label.toLowerCase().includes(query)).slice(0, 4)
    : NAV.slice(0, 5);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setMobileNav(false);
  }, [location.pathname, setMobileNav]);

  const title = TITLES[location.pathname] ?? "Overview";
  const time = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="ambient" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {mobileNav && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      <aside className="sidebar" data-collapsed={collapsed} data-open={mobileNav}>
        <div
          className={`flex h-[70px] shrink-0 items-center border-b border-[rgb(var(--ink-rgb)/0.06)] ${
            collapsed ? "justify-center px-0" : "gap-3 px-[18px]"
          }`}
        >
          <div
            className="grid size-9 shrink-0 place-items-center rounded-[11px] text-[#07101d]"
            style={{
              background:
                "linear-gradient(145deg, var(--theme-secondary), var(--theme-primary) 65%)",
              boxShadow:
                "0 0 20px color-mix(in srgb, var(--theme-primary) 35%, transparent), inset 0 1px 0 rgb(var(--ink-rgb) / 0.5)",
            }}
          >
            <Gamepad2 size={18} strokeWidth={2.4} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold tracking-[0.08em] text-[rgb(var(--ink-rgb)/0.95)]">
                  NEXUS
                </span>
                <span className="rounded border border-[rgb(var(--ink-rgb)/0.10)] bg-[rgb(var(--ink-rgb)/0.05)] px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.14em] text-[rgb(var(--ink-rgb)/0.45)]">
                  OS
                </span>
              </div>
              <p className="truncate text-[10px] tracking-[0.02em] text-[rgb(var(--ink-rgb)/0.35)]">
                Gaming Lounge · Zone A
              </p>
            </div>
          )}
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4">
          {!collapsed && <p className="eyebrow mb-2 px-2.5">Workspace</p>}
          <nav className="flex flex-col gap-1" aria-label="Main navigation">
            {NAV.map((item) => {
              const Icon = item.icon;
              const link = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className="nav-item"
                  data-active={
                    item.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.to)
                  }
                  aria-label={item.label}
                  onClick={() => setMobileNav(false)}
                >
                  <Icon size={17} strokeWidth={1.85} />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && location.pathname.startsWith(item.to) && item.to !== "/" && (
                    <ChevronRight size={13} className="ml-auto text-[rgb(var(--ink-rgb)/0.35)]" />
                  )}
                </NavLink>
              );
              return collapsed ? (
                <Tooltip key={item.to} label={item.label} placement="top">
                  {link}
                </Tooltip>
              ) : (
                link
              );
            })}
          </nav>

          {!collapsed && (
            <div className="mt-5 px-2.5">
              <p className="eyebrow mb-2">Today</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[rgb(var(--ink-rgb)/0.45)]">Revenue</span>
                  <span className="num text-[rgb(var(--ink-rgb)/0.80)]">$4,286.50</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[rgb(var(--ink-rgb)/0.45)]">Sessions</span>
                  <span className="num text-[rgb(var(--ink-rgb)/0.80)]">{activeSessions} active</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[rgb(var(--ink-rgb)/0.45)]">Shift</span>
                  <span className="text-[rgb(var(--ink-rgb)/0.80)]">Night · Ivy M.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t border-[rgb(var(--ink-rgb)/0.06)] p-2.5">
          {!collapsed && <OccupancyRail />}
          <div
            className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Avatar name="Omar Khaled" size="small" />
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-[rgb(var(--ink-rgb)/0.85)]">Omar Khaled</p>
                  <p className="text-[10px] text-[rgb(var(--ink-rgb)/0.35)]">Shift manager</p>
                </div>
                <span className="dot dot-live" />
              </>
            )}
          </div>
        </div>

      </aside>

      <div className="main-shell" data-collapsed={collapsed}>
        <header className="topbar">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.04)] text-[rgb(var(--ink-rgb)/0.60)] lg:hidden"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <MenuIcon size={16} />
          </button>

          <button
            type="button"
            className="hidden size-8 place-items-center rounded-lg border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.04)] text-[rgb(var(--ink-rgb)/0.55)] transition hover:bg-[rgb(var(--ink-rgb)/0.08)] hover:text-[rgb(var(--ink-rgb)/0.90)] lg:grid"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>

          <div className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[12px]">
            <span className="hidden text-[rgb(var(--ink-rgb)/0.35)] sm:inline">Nexus</span>
            <ChevronRight size={12} className="hidden shrink-0 text-[rgb(var(--ink-rgb)/0.20)] sm:block" />
            <span className="truncate font-medium text-[rgb(var(--ink-rgb)/0.85)]">{title}</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="mr-1 hidden h-8 items-center gap-2 rounded-lg border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.04)] px-2.5 text-[11px] text-[rgb(var(--ink-rgb)/0.4)] transition hover:border-[rgb(var(--ink-rgb)/0.16)] hover:text-[rgb(var(--ink-rgb)/0.7)] md:flex"
              aria-label="Search stations and members"
            >
              <Search size={13} />
              <span className="hidden lg:inline">Search stations, members…</span>
              <kbd className="ml-2 hidden rounded border border-[rgb(var(--ink-rgb)/0.12)] px-1 py-0.5 text-[9px] lg:inline">
                ⌘K
              </kbd>
            </button>
            <span className="num mr-2 hidden text-[11px] text-[rgb(var(--ink-rgb)/0.35)] md:inline">{time}</span>

            <AppearanceStudio />

            <Popover
              label="Alerts"
              placement="end"
              trigger={
                <Button variant="quiet" size="small" className="relative px-2.5" aria-label="Alerts">
                  <Bell size={15} strokeWidth={1.9} />
                  {unread > 0 && (
                    <span
                      className="absolute right-1 top-1 grid size-3.5 place-items-center rounded-full text-[8px] font-semibold text-[#07101d]"
                      style={{ background: "var(--theme-primary)" }}
                    >
                      {unread}
                    </span>
                  )}
                </Button>
              }
            >
              <div className="w-[320px] p-1">
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="eyebrow">Notifications</span>
                  <span className="flex items-center gap-1.5">
                    {unread > 0 && <span className="chip !h-5 !text-[9px]">{unread} new</span>}
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[9.5px] text-[rgb(var(--ink-rgb)/0.4)] transition hover:text-[rgb(var(--ink-rgb)/0.8)]"
                    >
                      Mark all read
                    </button>
                  </span>
                </div>
                <div className="space-y-0.5">
                  {notifications.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-start gap-2.5 rounded-lg px-2 py-2 transition hover:bg-[rgb(var(--ink-rgb)/0.05)]"
                      style={{ opacity: item.read ? 0.62 : 1 }}
                    >
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full"
                        style={{
                          background:
                            item.tone === "danger"
                              ? "#f87171"
                              : item.tone === "warn"
                                ? "#f59e0b"
                                : item.tone === "success"
                                  ? "#34d399"
                                  : "var(--theme-primary)",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] text-[rgb(var(--ink-rgb)/0.82)]">{item.title}</span>
                          <span className="shrink-0 text-[9px] text-[rgb(var(--ink-rgb)/0.30)]">{item.at}</span>
                        </div>
                        <p className="truncate text-[10.5px] text-[rgb(var(--ink-rgb)/0.48)]">{item.detail}</p>
                      </div>
                      <button
                        type="button"
                        aria-label="Dismiss notification"
                        onClick={() => dismissNotification(item.id)}
                        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded text-[rgb(var(--ink-rgb)/0.25)] opacity-0 transition hover:text-[rgb(var(--ink-rgb)/0.7)] group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="px-2 py-6 text-center text-[10.5px] text-[rgb(var(--ink-rgb)/0.35)]">
                      You are all caught up.
                    </p>
                  )}
                </div>
                <div className="mt-1 border-t border-[rgb(var(--ink-rgb)/0.08)] pt-1">
                  <Button
                    variant="quiet"
                    size="small"
                    className="w-full"
                    trailingIcon={<ChevronRight size={12} />}
                    onClick={() => navigate("/monitoring")}
                  >
                    Open monitoring
                  </Button>
                </div>
              </div>
            </Popover>

            <div className="mx-1.5 h-5 w-px bg-[rgb(var(--ink-rgb)/0.08)]" />

            <Menu
              label="Account"
              placement="end"
              trigger={
                <Button variant="quiet" size="small" className="h-9 gap-2 !px-1.5">
                  <Avatar name="Omar Khaled" size="small" />
                  <span className="hidden text-[12px] font-medium text-[rgb(var(--ink-rgb)/0.80)] xl:inline">
                    Omar K.
                  </span>
                  <ChevronDown size={12} className="hidden text-[rgb(var(--ink-rgb)/0.35)] xl:block" />
                </Button>
              }
            >
              <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
              <MenuItem onClick={() => navigate("/reports")}>Shift reports</MenuItem>
              <MenuItem
                destructive
                onClick={() =>
                  toast({ title: "Signed out", description: "Demo session closed." })
                }
              >
                Sign out
              </MenuItem>
            </Menu>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>

      <button
        type="button"
        aria-label="Close navigation"
        className="fixed right-3 top-3 z-50 grid size-8 place-items-center rounded-full border border-[rgb(var(--ink-rgb)/0.10)] bg-black/50 text-[rgb(var(--ink-rgb)/0.70)] lg:hidden"
        style={{ display: mobileNav ? "grid" : "none" }}
        onClick={() => setMobileNav(false)}
      >
        <X size={15} />
      </button>
      {commandOpen && (
        <>
          <button
            type="button"
            aria-label="Close search"
            className="glass-backdrop"
            onClick={() => setCommandOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            className="fixed left-1/2 top-[12vh] z-[75] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-[color:var(--hairline-strong)]"
            style={{
              background: "color-mix(in srgb, var(--app-bg) 88%, transparent)",
              backdropFilter: "blur(32px) saturate(1.4)",
              boxShadow: "0 34px 100px rgb(0 0 0 / 0.55), inset 0 1px 0 rgb(var(--ink-rgb) / 0.1)",
              animation: "menu-pop 160ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div className="flex items-center gap-2.5 border-b border-[color:var(--hairline)] px-3.5 py-3">
              <Search size={15} className="text-[rgb(var(--ink-rgb)/0.4)]" />
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Search stations, members, pages…"
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[rgb(var(--ink-rgb)/0.3)]"
                aria-label="Search query"
              />
              <kbd className="rounded border border-[color:var(--hairline)] px-1.5 py-0.5 text-[9px] text-[rgb(var(--ink-rgb)/0.35)]">
                ESC
              </kbd>
            </div>
            <div className="max-h-[58vh] overflow-y-auto p-1.5">
              {stationHits.length > 0 && (
                <>
                  <div className="cm-label">Stations</div>
                  {stationHits.map((station) => (
                    <button
                      key={station.id}
                      type="button"
                      className="cm-item"
                      onClick={() => {
                        navigate("/cafe");
                        openStation(station.id);
                        setCommandOpen(false);
                        setCommandQuery("");
                      }}
                    >
                      <span className="num text-[11px]">{station.id}</span>
                      <span className="truncate text-[11px] text-[rgb(var(--ink-rgb)/0.55)]">
                        {station.zone} · {station.member ?? "vacant"} · {station.game}
                      </span>
                      <span className="ml-auto dot" style={{ background: station.status === "maintenance" ? "#f87171" : station.status === "available" ? "#34d399" : "var(--theme-primary)" }} />
                    </button>
                  ))}
                </>
              )}
              {memberHits.length > 0 && (
                <>
                  <div className="cm-label">Members</div>
                  {memberHits.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      className="cm-item"
                      onClick={() => {
                        navigate("/members");
                        setCommandOpen(false);
                        setCommandQuery("");
                      }}
                    >
                      <span className="text-[11px]">{member.name}</span>
                      <span className="num ml-1 text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">{member.id}</span>
                      <span className="chip ml-auto !h-5 !text-[9px]">{member.tier}</span>
                    </button>
                  ))}
                </>
              )}
              <div className="cm-label">Pages</div>
              {pageHits.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  className="cm-item"
                  onClick={() => {
                    navigate(item.to);
                    setCommandOpen(false);
                    setCommandQuery("");
                  }}
                >
                  <item.icon size={13} />
                  <span>{item.label}</span>
                  <ChevronRight size={11} className="ml-auto opacity-40" />
                </button>
              ))}
              {!stationHits.length && !memberHits.length && query && (
                <p className="px-3 py-6 text-center text-[11px] text-[rgb(var(--ink-rgb)/0.35)]">
                  No matches for “{commandQuery}”. Try a station ID like AR-04 or a member name.
                </p>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-[color:var(--hairline)] px-3 py-1.5 text-[9px] text-[rgb(var(--ink-rgb)/0.3)]">
              <span>{stations.length} stations · {members.length} members indexed</span>
              <span>⌘K to toggle · simulated data</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
