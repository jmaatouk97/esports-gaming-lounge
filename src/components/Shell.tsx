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
  ChevronDown,
  ChevronRight,
  FileBarChart2,
  Gamepad2,
  LayoutDashboard,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  UtensilsCrossed,
  Users,
  Wallet,
  X,
} from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import { useApp } from "../store";
import { alerts } from "../data";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/cafe", label: "Cafe & Floor", icon: UtensilsCrossed },
  { to: "/stock", label: "Stock", icon: Boxes },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/members", label: "Members", icon: Users },
  { to: "/monitoring", label: "Monitoring", icon: Activity },
  { to: "/reports", label: "Shift Reports", icon: FileBarChart2 },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/cafe": "Cafe & Floor",
  "/stock": "Stock & Inventory",
  "/finance": "Finance",
  "/members": "Members",
  "/monitoring": "Monitoring",
  "/reports": "Shift Reports",
  "/settings": "Settings",
};

function OccupancyRail() {
  const stations = useApp((s) => s.stations);
  const occupied = stations.filter((s) => s.status === "in-use").length;
  const pct = (occupied / stations.length) * 100;

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/55">Floor live</span>
        <span className="num text-[11px] text-white/80">
          {occupied}/{stations.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
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
        <span className="text-[10px] text-white/40">Telemetry synced · 2s</span>
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
  const activeSessions = stations.filter((s) => s.status === "in-use").length;
  const [clock, setClock] = useState(() => new Date());

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
          className={`flex h-[70px] shrink-0 items-center border-b border-white/6 ${
            collapsed ? "justify-center px-0" : "gap-3 px-[18px]"
          }`}
        >
          <div
            className="grid size-9 shrink-0 place-items-center rounded-[11px] text-[#07101d]"
            style={{
              background:
                "linear-gradient(145deg, var(--theme-secondary), var(--theme-primary) 65%)",
              boxShadow:
                "0 0 20px color-mix(in srgb, var(--theme-primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.5)",
            }}
          >
            <Gamepad2 size={18} strokeWidth={2.4} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold tracking-[0.08em] text-white">
                  NEXUS
                </span>
                <span className="rounded border border-white/10 bg-white/5 px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.14em] text-white/45">
                  OS
                </span>
              </div>
              <p className="truncate text-[10px] tracking-[0.02em] text-white/35">
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
                    <ChevronRight size={13} className="ml-auto text-white/35" />
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
                  <span className="text-white/45">Revenue</span>
                  <span className="num text-white/80">$4,286.50</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/45">Sessions</span>
                  <span className="num text-white/80">{activeSessions} active</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/45">Shift</span>
                  <span className="text-white/80">Night · Ivy M.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t border-white/6 p-2.5">
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
                  <p className="truncate text-[12px] font-medium text-white/85">Omar Khaled</p>
                  <p className="text-[10px] text-white/35">Shift manager</p>
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
            className="grid size-8 place-items-center rounded-lg border border-white/8 bg-white/4 text-white/60 lg:hidden"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <MenuIcon size={16} />
          </button>

          <button
            type="button"
            className="hidden size-8 place-items-center rounded-lg border border-white/8 bg-white/4 text-white/55 transition hover:bg-white/8 hover:text-white/90 lg:grid"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>

          <div className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[12px]">
            <span className="hidden text-white/35 sm:inline">Nexus</span>
            <ChevronRight size={12} className="hidden shrink-0 text-white/20 sm:block" />
            <span className="truncate font-medium text-white/85">{title}</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="num mr-2 hidden text-[11px] text-white/35 md:inline">{time}</span>

            <ThemeSwitcher />

            <Popover
              label="Alerts"
              placement="end"
              trigger={
                <Button variant="quiet" size="small" className="relative px-2.5" aria-label="Alerts">
                  <Bell size={15} strokeWidth={1.9} />
                  <span
                    className="absolute right-1.5 top-1.5 size-1.5 rounded-full"
                    style={{ background: "var(--theme-primary)" }}
                  />
                </Button>
              }
            >
              <div className="w-[300px] p-1">
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="eyebrow">Attention queue</span>
                  <span className="chip !h-5 !text-[9px]">3 critical</span>
                </div>
                <div className="space-y-0.5">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-2.5 rounded-lg px-2 py-2 transition hover:bg-white/5"
                    >
                      <span
                        className="mt-1.5 size-1.5 rounded-full"
                        style={{
                          background:
                            alert.severity === "critical"
                              ? "#f87171"
                              : alert.severity === "warning"
                                ? "#f59e0b"
                                : "#64748b",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="num text-[11px] text-white/80">{alert.station}</span>
                          <span className="text-[9px] text-white/30">{alert.at}</span>
                        </div>
                        <p className="truncate text-[11px] text-white/50">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-1 border-t border-white/8 pt-1">
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

            <div className="mx-1.5 h-5 w-px bg-white/8" />

            <Menu
              label="Account"
              placement="end"
              trigger={
                <Button variant="quiet" size="small" className="h-9 gap-2 !px-1.5">
                  <Avatar name="Omar Khaled" size="small" />
                  <span className="hidden text-[12px] font-medium text-white/80 xl:inline">
                    Omar K.
                  </span>
                  <ChevronDown size={12} className="hidden text-white/35 xl:block" />
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
        className="fixed right-3 top-3 z-50 grid size-8 place-items-center rounded-full border border-white/10 bg-black/50 text-white/70 lg:hidden"
        style={{ display: mobileNav ? "grid" : "none" }}
        onClick={() => setMobileNav(false)}
      >
        <X size={15} />
      </button>
    </>
  );
}
