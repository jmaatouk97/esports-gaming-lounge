import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button, useToast } from "open-glass-ui";
import {
  AppWindow,
  Ban,
  ChevronRight,
  Clock3,
  Cpu,
  Gamepad2,
  Lock,
  LogOut,
  MessageSquare,
  MonitorPlay,
  MoveRight,
  Pencil,
  Power,
  RefreshCw,
  Send,
  Trash2,
  Unlock,
  UserPlus,
  UtensilsCrossed,
  X,
  Zap,
} from "lucide-react";
import { useApp } from "../../store";
import { ConfirmDialog } from "./StationDrawer";

type MenuRow =
  | { kind: "label"; label: string }
  | { kind: "sep" }
  | {
      kind: "item";
      icon: ReactNode;
      label: string;
      shortcut?: string;
      danger?: boolean;
      onClick?: () => void;
      submenu?: "session" | "add" | "remove" | "member" | "zone";
    };

const ZONES = ["Main Hall", "VIP Room", "Console Zone", "Esports Arena"];

export function StationContextMenu() {
  const { toast } = useToast();
  const menu = useApp((s) => s.contextMenu);
  const close = useApp((s) => s.closeContextMenu);
  const stations = useApp((s) => s.stations);
  const members = useApp((s) => s.members);
  const selectedIds = useApp((s) => s.selectedIds);
  const openStation = useApp((s) => s.openStation);
  const startSession = useApp((s) => s.startSession);
  const extendSession = useApp((s) => s.extendSession);
  const endSession = useApp((s) => s.endSession);
  const lockStations = useApp((s) => s.lockStations);
  const moveToZone = useApp((s) => s.moveToZone);
  const renameStation = useApp((s) => s.renameStation);
  const deleteSelected = useApp((s) => s.deleteSelected);
  const setCafeMode = useApp((s) => s.setCafeMode);
  const setCartTarget = useApp((s) => s.setCartTarget);
  const pushNotification = useApp((s) => s.pushNotification);

  const [submenu, setSubmenu] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [confirm, setConfirm] = useState<null | { title: string; detail: string; action: () => void }>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const station = stations.find((s) => s.id === menu?.stationId);
  const multi = selectedIds.length > 1 && station && selectedIds.includes(station.id);

  useLayoutEffect(() => {
    if (!menu || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const left = Math.min(menu.x, window.innerWidth - rect.width - 12);
    const top = Math.min(menu.y, window.innerHeight - rect.height - 12);
    setPos({ left: Math.max(12, left), top: Math.max(12, top) });
  }, [menu, submenu, renaming]);

  useEffect(() => {
    if (!menu) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, close]);

  useEffect(() => {
    if (menu) {
      setSubmenu(null);
      setRenaming(false);
      setRenameValue(station?.name ?? "");
    }
  }, [menu, station?.name]);

  if (!menu) return null;

  const isMulti = !!multi;
  const targetIds = isMulti ? selectedIds : station ? [station.id] : [];
  const count = targetIds.length;

  const simulate = (label: string, detail: string) => {
    toast({
      title: `${label}${count > 1 ? ` · ${count} stations` : ""}`,
      description: `${detail} · simulated, requires Windows client agent`,
      duration: 4200,
    });
    pushNotification({ title: label, detail, tone: "info" });
    close();
  };

  const rows: MenuRow[] = isMulti
    ? [
        { kind: "label", label: `${count} stations selected` },
        { kind: "item", icon: <Lock size={13} />, label: `Lock selected`, onClick: () => { lockStations(targetIds, true); close(); toast({ title: `${count} stations locked` }); } },
        { kind: "item", icon: <Unlock size={13} />, label: `Unlock selected`, onClick: () => { lockStations(targetIds, false); close(); toast({ title: `${count} stations unlocked` }); } },
        { kind: "sep" },
        { kind: "item", icon: <RefreshCw size={13} />, label: "Restart selected", onClick: () => setConfirm({ title: `Restart ${count} stations?`, detail: "All selected clients will reboot. Sessions are preserved but players are disconnected briefly.", action: () => simulate("Restart", "Restart commands queued") }) },
        { kind: "item", icon: <Power size={13} />, label: "Shutdown selected", danger: true, onClick: () => setConfirm({ title: `Shut down ${count} stations?`, detail: "This ends every session on the selected stations and powers them off.", action: () => simulate("Shutdown", "Shutdown commands queued") }) },
        { kind: "sep" },
        { kind: "item", icon: <MessageSquare size={13} />, label: "Send message", onClick: () => document.dispatchEvent(new CustomEvent("nexus:batch-message")) },
        { kind: "item", icon: <Zap size={13} />, label: "Wake on LAN", onClick: () => simulate("Wake on LAN", "Magic packet broadcast") },
        { kind: "item", icon: <MoveRight size={13} />, label: "Move to zone", submenu: "zone" },
        { kind: "sep" },
        { kind: "item", icon: <X size={13} />, label: "Clear selection", onClick: () => { useApp.getState().clearSelection(); close(); } },
      ]
    : station
      ? [
          { kind: "label", label: `${station.id} · ${station.zone}` },
          { kind: "item", icon: <AppWindow size={13} />, label: "View station details", shortcut: "⏎", onClick: () => { openStation(station.id); close(); } },
          { kind: "item", icon: <MonitorPlay size={13} />, label: "View live screen", onClick: () => simulate("Live screen", "Thumbnail stream requested") },
          { kind: "item", icon: <Cpu size={13} />, label: "Hardware information", onClick: () => { openStation(station.id); close(); } },
          { kind: "sep" },
          { kind: "label", label: "Session" },
          { kind: "item", icon: <Clock3 size={13} />, label: "Start session", submenu: "session", onClick: () => setSubmenu(submenu === "session" ? null : "session") },
          { kind: "item", icon: <Clock3 size={13} />, label: "Add time", submenu: "add", onClick: () => setSubmenu(submenu === "add" ? null : "add") },
          { kind: "item", icon: <Clock3 size={13} />, label: "Remove time", submenu: "remove", onClick: () => setSubmenu(submenu === "remove" ? null : "remove") },
          { kind: "item", icon: <UserPlus size={13} />, label: "Assign member", submenu: "member", onClick: () => setSubmenu(submenu === "member" ? null : "member") },
          { kind: "item", icon: <LogOut size={13} />, label: "End session", danger: true, onClick: () => setConfirm({ title: `End session on ${station.id}?`, detail: `${station.member ?? "Walk-in"} will be signed out immediately.`, action: () => { endSession(station.id); close(); toast({ title: `Session ended · ${station.id}` }); } }) },
          { kind: "sep" },
          { kind: "label", label: "Remote control" },
          { kind: "item", icon: <MonitorPlay size={13} />, label: "Remote desktop", onClick: () => simulate("Remote desktop", "VNC handshake requested") },
          { kind: "item", icon: <Lock size={13} />, label: "Lock", onClick: () => { lockStations([station.id], true); close(); toast({ title: `${station.id} locked` }); } },
          { kind: "item", icon: <Unlock size={13} />, label: "Unlock", onClick: () => { lockStations([station.id], false); close(); toast({ title: `${station.id} unlocked` }); } },
          { kind: "item", icon: <MessageSquare size={13} />, label: "Send message", onClick: () => { openStation(station.id); close(); toast({ title: "Message composer", description: "Open the Message action inside the station drawer." }); } },
          { kind: "item", icon: <LogOut size={13} />, label: "Force logout", danger: true, onClick: () => setConfirm({ title: `Force logout ${station.id}?`, detail: "The client returns to the lock screen and the session closes.", action: () => { endSession(station.id); close(); toast({ title: `Logged out · ${station.id}` }); } }) },
          { kind: "sep" },
          { kind: "label", label: "Power" },
          { kind: "item", icon: <Zap size={13} />, label: "Wake on LAN", onClick: () => simulate("Wake on LAN", "Magic packet broadcast") },
          { kind: "item", icon: <RefreshCw size={13} />, label: "Restart", onClick: () => setConfirm({ title: `Restart ${station.id}?`, detail: "The client reboots. The player is disconnected for about 60 seconds.", action: () => simulate("Restart", "Restart command queued") }) },
          { kind: "item", icon: <Power size={13} />, label: "Shutdown", danger: true, onClick: () => setConfirm({ title: `Shut down ${station.id}?`, detail: "The session ends and the machine powers off.", action: () => simulate("Shutdown", "Shutdown command queued") }) },
          { kind: "sep" },
          { kind: "label", label: "POS & orders" },
          { kind: "item", icon: <UtensilsCrossed size={13} />, label: "Order food / drinks", onClick: () => { setCartTarget(station.id); setCafeMode("pos"); close(); } },
          { kind: "item", icon: <Gamepad2 size={13} />, label: "View active orders", onClick: () => { setCartTarget(station.id); setCafeMode("pos"); close(); } },
          { kind: "sep" },
          { kind: "label", label: "Organisation" },
          { kind: "item", icon: <MoveRight size={13} />, label: "Move to zone", submenu: "zone" },
          { kind: "item", icon: <Pencil size={13} />, label: "Rename station", onClick: () => setRenaming(true) },
          { kind: "item", icon: <Trash2 size={13} />, label: "Delete station", danger: true, onClick: () => setConfirm({ title: `Delete ${station.id}?`, detail: "The station will be removed from this floor layout. This cannot be undone without Undo.", action: () => { useApp.getState().setSelection([station.id]); setTimeout(() => deleteSelected(), 0); close(); } }) },
        ]
      : [];

  const renderSubmenu = () => {
    if (!station) return null;
    if (!submenu) return null;
    const options =
      submenu === "session"
        ? [1, 2, 3].map((h) => ({ label: `${h} hour${h > 1 ? "s" : ""}`, run: () => { startSession(station.id, h * 60, station.member ?? "Walk-in"); close(); toast({ title: `Session started · ${station.id}` }); } }))
        : submenu === "add"
          ? [15, 30, 60].map((m) => ({ label: `+${m} minutes`, run: () => { extendSession(station.id, m); close(); toast({ title: `+${m} min · ${station.id}` }); } }))
          : submenu === "remove"
            ? [15, 30].map((m) => ({ label: `−${m} minutes`, run: () => { extendSession(station.id, -m); close(); toast({ title: `−${m} min · ${station.id}` }); } }))
            : submenu === "member"
              ? members.slice(0, 6).map((m) => ({ label: `${m.name} · ${m.tier}`, run: () => { startSession(station.id, 60, m.name); close(); toast({ title: `${m.name} assigned`, description: `${station.id} · 1h block` }); } }))
              : submenu === "zone"
                ? ZONES.map((zone) => ({ label: zone, run: () => { moveToZone(targetIds, zone); close(); toast({ title: `${count} station${count > 1 ? "s" : ""} moved`, description: zone }); } }))
                : [];
    return (
      <div
        className="context-menu"
        style={{ position: "absolute", left: "calc(100% + 4px)", top: 0, minWidth: 190, maxHeight: 320 }}
        onMouseLeave={() => setSubmenu(null)}
      >
        {options.map((option) => (
          <button key={option.label} type="button" className="cm-item" onClick={option.run}>
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="context-menu"
        role="menu"
        aria-label="Station actions"
        style={{ left: pos.left, top: pos.top }}
        onContextMenu={(event) => event.preventDefault()}
      >
        {renaming && station && (
          <form
            className="mb-1 flex items-center gap-1.5 rounded-lg border border-[color:var(--hairline)] p-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              if (renameValue.trim()) {
                renameStation(station.id, renameValue.trim());
                toast({ title: "Station renamed", description: renameValue.trim() });
                close();
              }
            }}
          >
            <input
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-1 text-[11.5px] outline-none"
              aria-label="Station name"
            />
            <button type="submit" className="grid size-6 place-items-center rounded-md bg-[color:color-mix(in_srgb,var(--theme-primary)_22%,transparent)]" aria-label="Save name">
              <Send size={11} />
            </button>
          </form>
        )}

        {rows.map((row, index) => {
          if (row.kind === "label") return <div key={`l-${index}`} className="cm-label">{row.label}</div>;
          if (row.kind === "sep") return <div key={`s-${index}`} className="cm-sep" />;
          return (
            <div key={`${row.label}-${index}`} className="relative" onMouseEnter={() => row.submenu && setSubmenu(row.submenu)}>
              <button
                type="button"
                role="menuitem"
                className="cm-item"
                data-danger={row.danger}
                onClick={row.onClick}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") row.onClick?.();
                }}
              >
                <span className="grid size-4 place-items-center opacity-80">{row.icon}</span>
                <span className="flex-1 text-left">{row.label}</span>
                {row.submenu && <ChevronRight size={11} className="opacity-50" />}
                {row.shortcut && <span className="num text-[9px] opacity-40">{row.shortcut}</span>}
              </button>
              {row.submenu === submenu && renderSubmenu()}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ""}
        detail={confirm?.detail ?? ""}
        confirmLabel="Confirm"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
      />
    </>
  );
}

export function BatchToolbar() {
  const { toast } = useToast();
  const selectedIds = useApp((s) => s.selectedIds);
  const editorMode = useApp((s) => s.editorMode);
  const stations = useApp((s) => s.stations);
  const lockStations = useApp((s) => s.lockStations);
  const endSession = useApp((s) => s.endSession);
  const clearSelection = useApp((s) => s.clearSelection);
  const pushNotification = useApp((s) => s.pushNotification);
  const [confirm, setConfirm] = useState<null | { title: string; detail: string; action: () => void }>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const open = () => setMessageOpen(true);
    document.addEventListener("nexus:batch-message", open);
    return () => document.removeEventListener("nexus:batch-message", open);
  }, []);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setMessageOpen(false);
      setMessage("");
    }
  }, [selectedIds.length]);

  if (editorMode !== "live" || selectedIds.length === 0) return null;
  const count = selectedIds.length;
  const selected = stations.filter((s) => selectedIds.includes(s.id));

  const simulate = (label: string, detail: string) => {
    toast({
      title: `${label} · ${count} station${count > 1 ? "s" : ""}`,
      description: `${detail} · simulated, requires Windows client agent`,
      duration: 4200,
    });
    pushNotification({ title: label, detail, tone: "info" });
  };

  return (
    <>
      <div
        className="fixed bottom-[74px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl border px-2 py-1.5"
        style={{
          borderColor: "var(--hairline-strong)",
          background: "color-mix(in srgb, var(--app-bg) 82%, transparent)",
          backdropFilter: "blur(26px) saturate(1.35)",
          boxShadow: "0 20px 60px rgb(0 0 0 / 0.4), inset 0 1px 0 rgb(var(--ink-rgb) / 0.1)",
          animation: "menu-pop 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
        role="toolbar"
        aria-label="Batch station actions"
      >
        <span className="num px-2 text-[11px] font-medium">
          {count} selected
        </span>
        <span className="mx-1 h-5 w-px bg-[color:var(--hairline-strong)]" />
        <BatchButton icon={<Lock size={13} />} label="Lock" onClick={() => { lockStations(selectedIds, true); toast({ title: `${count} locked` }); }} />
        <BatchButton icon={<Unlock size={13} />} label="Unlock" onClick={() => { lockStations(selectedIds, false); toast({ title: `${count} unlocked` }); }} />
        <BatchButton icon={<RefreshCw size={13} />} label="Restart" onClick={() => setConfirm({ title: `Restart ${count} stations?`, detail: "Selected clients reboot. Players are briefly disconnected.", action: () => simulate("Restart", "Restart commands queued") })} />
        <BatchButton icon={<Power size={13} />} label="Shutdown" onClick={() => setConfirm({ title: `Shut down ${count} stations?`, detail: "All sessions on the selected stations end and the machines power off.", action: () => simulate("Shutdown", "Shutdown commands queued") })} />
        <BatchButton icon={<MessageSquare size={13} />} label="Message" onClick={() => setMessageOpen((v) => !v)} />
        <BatchButton icon={<Zap size={13} />} label="Wake" onClick={() => simulate("Wake on LAN", "Magic packet broadcast")} />
        <BatchButton icon={<LogOut size={13} />} label="Force logout" onClick={() => setConfirm({ title: `Force logout ${count} stations?`, detail: "Every active session in the selection is closed.", action: () => { selected.forEach((s) => endSession(s.id)); toast({ title: `${count} sessions ended` }); } })} />
        <span className="mx-1 h-5 w-px bg-[color:var(--hairline-strong)]" />
        <BatchButton icon={<Ban size={13} />} label="Clear" onClick={clearSelection} />
      </div>

      {messageOpen && (
        <>
          <button type="button" className="glass-backdrop" style={{ zIndex: 58 }} aria-label="Close message" onClick={() => setMessageOpen(false)} />
          <form
            className="fixed left-1/2 top-1/2 z-[60] w-[min(420px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-4"
            style={{
              borderColor: "var(--hairline-strong)",
              background: "color-mix(in srgb, var(--app-bg) 88%, transparent)",
              backdropFilter: "blur(30px)",
              boxShadow: "0 30px 90px rgb(0 0 0 / 0.5)",
            }}
            onSubmit={(event) => {
              event.preventDefault();
              simulate("Message sent", message.trim() || "Broadcast to selection");
              setMessage("");
              setMessageOpen(false);
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold">Message {count} stations</h3>
              <button type="button" onClick={() => setMessageOpen(false)} aria-label="Close" className="grid size-7 place-items-center rounded-lg hover:bg-[rgb(var(--ink-rgb)/0.06)]">
                <X size={14} />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[rgb(var(--ink-rgb)/0.45)]">
              Shown as a client overlay. Simulated until the Windows agent is connected.
            </p>
            <textarea
              autoFocus
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              className="mt-3 w-full resize-none rounded-xl border border-[color:var(--hairline)] bg-[rgb(var(--ink-rgb)/0.03)] p-2.5 text-[12px] outline-none"
              placeholder="Your match starts in 5 minutes — please save your game."
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="quiet" size="small" onClick={() => setMessageOpen(false)}>Cancel</Button>
              <Button variant="primary" size="small" type="submit">Send broadcast</Button>
            </div>
          </form>
        </>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ""}
        detail={confirm?.detail ?? ""}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
      />
    </>
  );
}

function BatchButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[10.5px] text-[rgb(var(--ink-rgb)/0.62)] transition hover:bg-[rgb(var(--ink-rgb)/0.07)] hover:text-[rgb(var(--ink-rgb)/0.92)] active:scale-95"
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}
