import { useMemo, useState } from "react";
import {
  Button,
  SegmentedControl,
  Select,
  Tabs,
  TextField,
  useToast,
} from "open-glass-ui";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Gamepad2,
  Medal,
  Plus,
  Swords,
  Trophy,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { PageHeader, SectionHead, StatusPill, usd } from "../components/Bits";
import { useApp } from "../store";

type BookingStatus = "pending" | "confirmed" | "checked-in" | "cancelled";

interface Booking {
  id: string;
  date: string;
  start: string;
  duration: number;
  member: string;
  zone: string;
  station: string;
  guests: number;
  deposit: number;
  status: BookingStatus;
  note?: string;
}

const TODAY = "2026-11-16";

const SEED_BOOKINGS: Booking[] = [
  { id: "BK-1041", date: TODAY, start: "18:00", duration: 120, member: "Aria Chen", zone: "VIP Room", station: "VIP-01", guests: 2, deposit: 40, status: "checked-in" },
  { id: "BK-1042", date: TODAY, start: "19:00", duration: 90, member: "Marcus Vale", zone: "Esports Arena", station: "AR-04", guests: 1, deposit: 20, status: "confirmed" },
  { id: "BK-1043", date: TODAY, start: "20:00", duration: 180, member: "Yuki Tanaka", zone: "VIP Room", station: "VIP-03", guests: 4, deposit: 80, status: "pending", note: "Birthday group — cake at 21:00" },
  { id: "BK-1044", date: TODAY, start: "16:30", duration: 60, member: "Dev Patel", zone: "Main Hall", station: "MH-09", guests: 1, deposit: 0, status: "cancelled" },
  { id: "BK-1045", date: "2026-11-17", start: "17:00", duration: 120, member: "Sofia Reyes", zone: "Console Zone", station: "CS-02", guests: 3, deposit: 30, status: "confirmed" },
  { id: "BK-1046", date: "2026-11-18", start: "19:30", duration: 150, member: "Zara Ali", zone: "Esports Arena", station: "AR-07", guests: 5, deposit: 100, status: "confirmed" },
  { id: "BK-1047", date: "2026-11-21", start: "15:00", duration: 180, member: "Lina Haddad", zone: "VIP Room", station: "VIP-02", guests: 2, deposit: 60, status: "pending" },
  { id: "BK-1048", date: "2026-11-22", start: "14:00", duration: 240, member: "Noah Kim", zone: "Esports Arena", station: "AR-01", guests: 6, deposit: 120, status: "confirmed" },
];

const STATUS_TONE: Record<BookingStatus, "green" | "blue" | "amber" | "red"> = {
  "checked-in": "green",
  confirmed: "blue",
  pending: "amber",
  cancelled: "red",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  "checked-in": "Checked in",
  confirmed: "Confirmed",
  pending: "Pending",
  cancelled: "Cancelled",
};

const ZONES = ["Main Hall", "VIP Room", "Console Zone", "Esports Arena"];

function minutesOf(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function timeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function calendarCells() {
  const first = new Date(2026, 10, 1);
  const offset = first.getDay();
  return Array.from({ length: 35 }, (_, index) => {
    const day = index - offset + 1;
    if (day < 1 || day > 30) return null;
    return {
      day,
      iso: `2026-11-${String(day).padStart(2, "0")}`,
    };
  });
}

const TEAMS = [
  "Team Vortex",
  "Neon Wolves",
  "Ascent Five",
  "Crimson Owls",
  "Nova Syndicate",
  "Iron Circuit",
  "Pixel Phantoms",
  "Zero Latency",
];

const TOURNAMENTS = [
  {
    id: "t1",
    name: "Nexus Valorant Open",
    game: "Valorant",
    format: "Single elimination",
    teams: 8,
    prize: 2400,
    date: "Nov 21–22",
    status: "live",
    entry: 25,
  },
  {
    id: "t2",
    name: "CS2 Midnight Cup",
    game: "Counter-Strike 2",
    format: "Double elimination",
    teams: 8,
    prize: 1800,
    date: "Nov 28",
    status: "registration",
    entry: 20,
  },
  {
    id: "t3",
    name: "FC 26 Lounge League",
    game: "EA FC 26",
    format: "Single elimination",
    teams: 8,
    prize: 900,
    date: "Dec 5",
    status: "draft",
    entry: 12,
  },
];

interface MatchState {
  scores: Record<string, [number, number]>;
  winners: Record<string, string>;
}

export default function Events() {
  const { toast } = useToast();
  const members = useApp((s) => s.members);
  const pushNotification = useApp((s) => s.pushNotification);

  const [tab, setTab] = useState<"reservations" | "tournaments">("reservations");

  // Reservations
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    member: members[0]?.name ?? "Walk-in",
    zone: "VIP Room",
    station: "VIP-01",
    date: TODAY,
    start: "20:00",
    duration: 120,
    guests: 2,
    deposit: 40,
    note: "",
  });

  const cells = useMemo(calendarCells, []);
  const dayBookings = bookings
    .filter((booking) => booking.date === selectedDate)
    .filter((booking) => statusFilter === "all" || booking.status === statusFilter)
    .sort((a, b) => minutesOf(a.start) - minutesOf(b.start));

  const upcoming = bookings
    .filter((booking) => booking.date >= TODAY && booking.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));

  const expected = upcoming.reduce((sum, booking) => sum + booking.deposit, 0);
  const todayChecked = bookings.filter((booking) => booking.date === TODAY && booking.status === "checked-in").length;

  const addBooking = () => {
    if (!form.member.trim()) {
      toast({ title: "Member name is required", duration: 2400 });
      return;
    }
    const booking: Booking = {
      id: `BK-${1049 + bookings.length}`,
      date: form.date,
      start: form.start,
      duration: Number(form.duration),
      member: form.member,
      zone: form.zone,
      station: form.station,
      guests: Number(form.guests),
      deposit: Number(form.deposit),
      status: "pending",
      note: form.note || undefined,
    };
    setBookings((current) => [...current, booking]);
    setSelectedDate(form.date);
    setFormOpen(false);
    pushNotification({
      title: "Reservation created",
      detail: `${booking.member} · ${booking.zone} · ${timeLabel(booking.start)}`,
      tone: "success",
    });
    toast({ title: "Reservation created", description: `${booking.id} · ${booking.station} · ${timeLabel(booking.start)}` });
  };

  const setBookingStatus = (id: string, status: BookingStatus) => {
    setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
    toast({
      title: status === "checked-in" ? "Guest checked in" : status === "cancelled" ? "Reservation cancelled" : "Reservation updated",
      description: `${id} · ${STATUS_LABEL[status]}`,
      actionLabel: "Undo",
      onAction: () => {
        setBookings((current) =>
          current.map((booking) => (booking.id === id ? { ...booking, status: bookings.find((b) => b.id === id)?.status ?? "pending" } : booking)),
        );
      },
    });
  };

  // Tournaments
  const [tournamentId, setTournamentId] = useState("t1");
  const [format, setFormat] = useState<"single" | "double">("single");
  const [matchState, setMatchState] = useState<MatchState>({ scores: {}, winners: {} });
  const [createOpen, setCreateOpen] = useState(false);
  const [tournamentForm, setTournamentForm] = useState({ name: "", game: "Valorant", teams: 8, prize: 1200 });
  const [created, setCreated] = useState<typeof TOURNAMENTS>([]);
  const tournament = [...TOURNAMENTS, ...created].find((item) => item.id === tournamentId) ?? TOURNAMENTS[0];

  const quarter = [0, 1, 2, 3].map((index) => ({
    id: `q${index + 1}`,
    a: TEAMS[index * 2],
    b: TEAMS[index * 2 + 1],
  }));
  const semi = [0, 1].map((index) => ({
    id: `s${index + 1}`,
    a: matchState.winners[`q${index * 2 + 1}`] ?? `Winner Q${index * 2 + 1}`,
    b: matchState.winners[`q${index * 2 + 2}`] ?? `Winner Q${index * 2 + 2}`,
  }));
  const final = {
    id: "f1",
    a: matchState.winners.s1 ?? "Winner SF1",
    b: matchState.winners.s2 ?? "Winner SF2",
  };

  const roundTotal = [0, 1].map((round) => [0, 1, 2, 3].filter((index) => matchState.winners[`q${index + 1}`]).length)[0] ?? 0;
  const siCompleted = [0, 1].filter((index) => matchState.winners[`s${index + 1}`]).length;
  const completed = roundTotal + siCompleted + (matchState.winners.f1 ? 1 : 0);
  const champion = matchState.winners.f1;

  const score = (id: string, side: 0 | 1) => {
    setMatchState((current) => {
      const existing = current.scores[id] ?? [0, 0];
      const next: [number, number] = [...existing] as [number, number];
      next[side] = Math.max(0, next[side] + 1);
      return { ...current, scores: { ...current.scores, [id]: next } };
    });
  };

  const decide = (id: string, team: string) => {
    setMatchState((current) => ({ ...current, winners: { ...current.winners, [id]: team } }));
    toast({ title: `${team} advanced`, description: `Match ${id.toUpperCase()} result saved` });
  };

  const reservationsTab = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: "Today", value: `${bookings.filter((b) => b.date === TODAY).length}`, hint: "reservations", icon: CalendarDays },
          { label: "Checked in", value: `${todayChecked}`, hint: "of today", icon: UserCheck },
          { label: "Deposits held", value: usd(expected), hint: "upcoming", icon: Clock3 },
          { label: "Guests booked", value: `${upcoming.reduce((sum, b) => sum + b.guests, 0)}`, hint: "upcoming", icon: Users },
        ].map((item) => (
          <div key={item.label} className="panel p-3.5">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{item.label}</p>
              <item.icon size={13} className="text-[rgb(var(--ink-rgb)/0.3)]" />
            </div>
            <p className="num mt-1 text-[22px] font-medium tracking-[-0.03em]">{item.value}</p>
            <p className="text-[9.5px] text-[rgb(var(--ink-rgb)/0.35)]">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section className="panel p-4">
          <SectionHead
            title="Reservations calendar"
            hint={view === "month" ? "November 2026" : "Nov 16–22"}
            actions={
              <SegmentedControl
                aria-label="Calendar view"
                value={view}
                onValueChange={(value) => setView(value as "month" | "week")}
                items={[
                  { value: "month", label: "Month" },
                  { value: "week", label: "Week" },
                ]}
                className="!scale-90"
              />
            }
          />
          {view === "month" ? (
            <>
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.32)]">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <span key={day} className="py-1">{day}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((cell, index) => {
                  if (!cell) return <span key={`blank-${index}`} />;
                  const count = bookings.filter((booking) => booking.date === cell.iso && booking.status !== "cancelled").length;
                  const active = cell.iso === selectedDate;
                  const today = cell.iso === TODAY;
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      onClick={() => setSelectedDate(cell.iso)}
                      className="relative grid aspect-square place-items-center rounded-lg border text-[11px] transition"
                      style={{
                        borderColor: active
                          ? "color-mix(in srgb, var(--theme-primary) 52%, transparent)"
                          : today
                            ? "color-mix(in srgb, var(--theme-secondary) 40%, transparent)"
                            : "transparent",
                        background: active
                          ? "color-mix(in srgb, var(--theme-primary) 16%, transparent)"
                          : today
                            ? "color-mix(in srgb, var(--theme-secondary) 7%, transparent)"
                            : "transparent",
                        color: active ? "var(--ink)" : "rgb(var(--ink-rgb) / 0.6)",
                      }}
                      aria-label={`November ${cell.day}, ${count} reservations`}
                    >
                      {cell.day}
                      {count > 0 && (
                        <span className="absolute bottom-1 flex gap-0.5">
                          {Array.from({ length: Math.min(3, count) }).map((_, dot) => (
                            <span key={dot} className="size-[3px] rounded-full" style={{ background: "var(--theme-primary)" }} />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[color:var(--hairline)] pt-2">
                <button type="button" className="flex items-center gap-1 text-[10px] text-[rgb(var(--ink-rgb)/0.45)]" onClick={() => setSelectedDate(TODAY)}>
                  <ChevronLeft size={11} /> Today
                </button>
                <span className="text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">
                  {bookings.filter((b) => b.date === selectedDate && b.status !== "cancelled").length} on the selected day
                </span>
                <ChevronRight size={11} className="text-[rgb(var(--ink-rgb)/0.3)]" />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              {Array.from({ length: 7 }, (_, index) => {
                const day = 16 + index;
                const iso = `2026-11-${String(day).padStart(2, "0")}`;
                const items = bookings.filter((booking) => booking.date === iso && booking.status !== "cancelled");
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelectedDate(iso)}
                    className="flex w-full items-center gap-3 rounded-lg border px-2 py-1.5 text-left"
                    style={{
                      borderColor: iso === selectedDate ? "color-mix(in srgb, var(--theme-primary) 48%, transparent)" : "var(--hairline)",
                      background: iso === selectedDate ? "color-mix(in srgb, var(--theme-primary) 10%, transparent)" : "transparent",
                    }}
                  >
                    <span className="num w-6 text-[11px] text-[rgb(var(--ink-rgb)/0.5)]">{day}</span>
                    <span className="flex-1 text-[10.5px] text-[rgb(var(--ink-rgb)/0.6)]">
                      {items.length === 0 ? "No reservations" : items.map((item) => `${timeLabel(item.start)} ${item.member}`).join(" · ")}
                    </span>
                    <span className="num text-[9px] text-[rgb(var(--ink-rgb)/0.3)]">{items.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          <Button
            variant="primary"
            size="small"
            className="mt-3 w-full"
            leadingIcon={<Plus size={13} />}
            onClick={() => setFormOpen((value) => !value)}
          >
            {formOpen ? "Close form" : "New reservation"}
          </Button>

          {formOpen && (
            <div className="mt-3 space-y-2.5 rounded-xl border border-[color:var(--hairline)] p-3">
              <Select
                label="Member"
                value={form.member}
                onChange={(event) => setForm({ ...form, member: event.target.value })}
                options={[...members.slice(0, 8).map((member) => ({ value: member.name, label: member.name })), { value: "Walk-in", label: "Walk-in" }]}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                <TextField label="Start" type="time" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="Zone"
                  value={form.zone}
                  onChange={(event) => setForm({ ...form, zone: event.target.value })}
                  options={ZONES.map((zone) => ({ value: zone, label: zone }))}
                />
                <Select
                  label="Station"
                  value={form.station}
                  onChange={(event) => setForm({ ...form, station: event.target.value })}
                  options={[
                    { value: "VIP-01", label: "VIP-01" },
                    { value: "VIP-03", label: "VIP-03" },
                    { value: "AR-04", label: "AR-04" },
                    { value: "MH-09", label: "MH-09" },
                    { value: "CS-02", label: "CS-02" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <TextField label="Minutes" type="number" value={form.duration} onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })} />
                <TextField label="Guests" type="number" value={form.guests} onChange={(event) => setForm({ ...form, guests: Number(event.target.value) })} />
                <TextField label="Deposit" type="number" value={form.deposit} onChange={(event) => setForm({ ...form, deposit: Number(event.target.value) })} />
              </div>
              <TextField label="Note" placeholder="Birthday, equipment needs…" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
              <div className="flex justify-end gap-2">
                <Button variant="quiet" size="small" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button variant="primary" size="small" onClick={addBooking}>Create reservation</Button>
              </div>
            </div>
          )}
        </section>

        <div className="space-y-3">
          <section className="panel p-4">
            <SectionHead
              title={`Bookings · ${selectedDate}`}
              hint={`${dayBookings.length} shown`}
              actions={
                <Select
                  label=""
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                  options={[
                    { value: "all", label: "All statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "checked-in", label: "Checked in" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                  className="!w-[136px]"
                />
              }
            />
            <div className="space-y-1.5">
              {dayBookings.length === 0 && (
                <div className="rounded-xl border border-dashed border-[color:var(--hairline-strong)] px-4 py-8 text-center">
                  <CalendarDays size={20} className="mx-auto text-[rgb(var(--ink-rgb)/0.28)]" />
                  <p className="mt-2 text-[11.5px] font-medium">No reservations on this day</p>
                  <p className="text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">Create one from the calendar panel.</p>
                </div>
              )}
              {dayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5"
                  style={{
                    borderColor: "var(--hairline)",
                    background: booking.status === "cancelled" ? "transparent" : "rgb(var(--ink-rgb) / 0.022)",
                    opacity: booking.status === "cancelled" ? 0.55 : 1,
                  }}
                >
                  <div className="w-16">
                    <p className="num text-[12px] font-medium">{booking.start}</p>
                    <p className="text-[9px] text-[rgb(var(--ink-rgb)/0.32)]">{booking.duration} min</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12px] font-medium">{booking.member}</span>
                      <StatusPill tone={STATUS_TONE[booking.status]}>{STATUS_LABEL[booking.status]}</StatusPill>
                      <span className="chip !h-5 !text-[9px]">{booking.station}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-[rgb(var(--ink-rgb)/0.4)]">
                      {booking.zone} · {booking.guests} guest{booking.guests > 1 ? "s" : ""} · deposit {usd(booking.deposit)}
                      {booking.note ? ` · ${booking.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {booking.status !== "checked-in" && booking.status !== "cancelled" && (
                      <Button variant="secondary" size="small" onClick={() => setBookingStatus(booking.id, "checked-in")}>
                        Check in
                      </Button>
                    )}
                    {booking.status === "pending" && (
                      <Button variant="quiet" size="small" onClick={() => setBookingStatus(booking.id, "confirmed")}>
                        Confirm
                      </Button>
                    )}
                    {booking.status !== "cancelled" && (
                      <button
                        type="button"
                        aria-label={`Cancel ${booking.id}`}
                        className="grid size-7 place-items-center rounded-lg border border-[color:var(--hairline)] text-[rgb(var(--ink-rgb)/0.4)] transition hover:text-[#f87171]"
                        onClick={() => setBookingStatus(booking.id, "cancelled")}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-4">
            <SectionHead title="Day timeline" hint="16 Nov · 10:00 → 02:00" />
            <div className="relative h-14 overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-[rgb(var(--ink-rgb)/0.02)]">
              {Array.from({ length: 17 }, (_, index) => (
                <span
                  key={index}
                  className="absolute top-0 h-full border-l border-[color:var(--hairline)]"
                  style={{ left: `${(index / 16) * 100}%` }}
                />
              ))}
              {bookings
                .filter((booking) => booking.date === TODAY && booking.status !== "cancelled")
                .map((booking) => {
                  const start = minutesOf(booking.start);
                  const left = ((start - 600) / 960) * 100;
                  const width = (booking.duration / 960) * 100;
                  if (left < 0) return null;
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => toast({ title: `${booking.member} · ${booking.station}`, description: `${timeLabel(booking.start)} · ${booking.duration} min` })}
                      className="absolute top-2 h-10 overflow-hidden rounded-md border px-1.5 text-left text-[8px]"
                      style={{
                        left: `${Math.min(94, left)}%`,
                        width: `${Math.max(4, Math.min(100 - Math.min(94, left), width))}%`,
                        borderColor: "color-mix(in srgb, var(--theme-primary) 42%, transparent)",
                        background: "color-mix(in srgb, var(--theme-primary) 18%, transparent)",
                      }}
                    >
                      <span className="block truncate font-medium">{booking.member}</span>
                      <span className="num block truncate opacity-60">{booking.start}</span>
                    </button>
                  );
                })}
              <span className="absolute bottom-0 left-[41%] top-0 w-px bg-[color:var(--theme-secondary)]" />
            </div>
            <div className="mt-1 flex justify-between text-[8.5px] text-[rgb(var(--ink-rgb)/0.3)]">
              {["10:00", "14:00", "18:00", "22:00", "02:00"].map((time) => (
                <span key={time}>{time}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const tournamentsTab = (
    <div className="grid gap-3 xl:grid-cols-[290px_minmax(0,1fr)]">
      <div className="space-y-3">
        <section className="panel p-4">
          <SectionHead title="Tournaments" hint={`${TOURNAMENTS.length + created.length} scheduled`} />
          <div className="space-y-1.5">
            {[...TOURNAMENTS, ...created].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTournamentId(item.id)}
                className="w-full rounded-xl border px-2.5 py-2 text-left transition"
                style={{
                  borderColor:
                    tournamentId === item.id
                      ? "color-mix(in srgb, var(--theme-primary) 50%, transparent)"
                      : "var(--hairline)",
                  background:
                    tournamentId === item.id
                      ? "color-mix(in srgb, var(--theme-primary) 10%, transparent)"
                      : "transparent",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11.5px] font-medium">{item.name}</span>
                  <Trophy size={11} className="shrink-0 text-[rgb(var(--ink-rgb)/0.35)]" />
                </div>
                <p className="mt-0.5 text-[9.5px] text-[rgb(var(--ink-rgb)/0.4)]">
                  {item.game} · {item.teams} teams · {item.date}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="num text-[9.5px] text-[rgb(var(--ink-rgb)/0.55)]">{usd(item.prize)}</span>
                  <StatusPill tone={item.status === "live" ? "green" : item.status === "registration" ? "amber" : "slate"}>
                    {item.status}
                  </StatusPill>
                </div>
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="small"
            className="mt-3 w-full"
            leadingIcon={<Plus size={13} />}
            onClick={() => setCreateOpen((value) => !value)}
          >
            {createOpen ? "Close" : "New tournament"}
          </Button>
          {createOpen && (
            <div className="mt-3 space-y-2.5 rounded-xl border border-[color:var(--hairline)] p-3">
              <TextField label="Name" placeholder="Friday Night Cup" value={tournamentForm.name} onChange={(event) => setTournamentForm({ ...tournamentForm, name: event.target.value })} />
              <Select
                label="Game"
                value={tournamentForm.game}
                onChange={(event) => setTournamentForm({ ...tournamentForm, game: event.target.value })}
                options={["Valorant", "Counter-Strike 2", "EA FC 26", "League of Legends", "Fortnite"].map((game) => ({ value: game, label: game }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Teams" type="number" value={tournamentForm.teams} onChange={(event) => setTournamentForm({ ...tournamentForm, teams: Number(event.target.value) })} />
                <TextField label="Prize pool" type="number" value={tournamentForm.prize} onChange={(event) => setTournamentForm({ ...tournamentForm, prize: Number(event.target.value) })} />
              </div>
              <Button
                variant="primary"
                size="small"
                className="w-full"
                onClick={() => {
                  if (!tournamentForm.name.trim()) {
                    toast({ title: "Tournament name is required" });
                    return;
                  }
                  const id = `t${Date.now()}`;
                  setCreated((current) => [
                    ...current,
                    {
                      id,
                      name: tournamentForm.name,
                      game: tournamentForm.game,
                      format: format === "single" ? "Single elimination" : "Double elimination",
                      teams: tournamentForm.teams,
                      prize: tournamentForm.prize,
                      date: "TBD",
                      status: "draft",
                      entry: 20,
                    },
                  ]);
                  setTournamentId(id);
                  setCreateOpen(false);
                  toast({ title: "Tournament created", description: tournamentForm.name });
                }}
              >
                Create tournament
              </Button>
            </div>
          )}
        </section>

        <section className="panel p-4">
          <SectionHead title="Prize pool" hint={tournament.name} />
          <p className="num text-[26px] font-medium tracking-[-0.03em]">{usd(tournament.prize)}</p>
          <div className="mt-3 space-y-1.5">
            {[
              ["1st place", 0.5, "🥇"],
              ["2nd place", 0.3, "🥈"],
              ["3rd place", 0.2, "🥉"],
            ].map(([label, share, medal]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-lg border border-[color:var(--hairline)] px-2.5 py-1.5">
                <span className="flex items-center gap-2 text-[10.5px]">
                  <span>{medal}</span> {label}
                </span>
                <span className="num text-[10.5px] text-[rgb(var(--ink-rgb)/0.65)]">
                  {usd(Math.round(tournament.prize * Number(share)))}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[9.5px] text-[rgb(var(--ink-rgb)/0.35)]">
            Entry {usd(tournament.entry)} per player · payouts after the grand final.
          </p>
        </section>
      </div>

      <section className="panel p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em]">{tournament.name}</h2>
              <StatusPill tone={tournament.status === "live" ? "green" : "amber"}>{tournament.status}</StatusPill>
              <span className="chip !h-5">{tournament.game}</span>
            </div>
            <p className="mt-0.5 text-[10.5px] text-[rgb(var(--ink-rgb)/0.4)]">
              {tournament.format} · {tournament.teams} teams · {tournament.date} · bracket {completed}/8 complete
            </p>
          </div>
          <SegmentedControl
            aria-label="Bracket format"
            value={format}
            onValueChange={(value) => setFormat(value as "single" | "double")}
            items={[
              { value: "single", label: "Single elim" },
              { value: "double", label: "Double elim" },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-3 gap-3">
            {[
              { title: "Quarter-finals", matches: quarter, next: false },
              { title: "Semi-finals", matches: semi, next: true },
              { title: "Grand final", matches: [final], next: true },
            ].map((column) => (
              <div key={column.title}>
                <p className="eyebrow mb-2 flex items-center gap-1.5">
                  <Swords size={10} /> {column.title}
                </p>
                <div className={column.matches.length < 4 ? "flex h-full flex-col justify-around gap-2" : "space-y-2"}>
                  {column.matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      id={match.id}
                      a={match.a}
                      b={match.b}
                      scores={matchState.scores[match.id] ?? [0, 0]}
                      winner={matchState.winners[match.id]}
                      onScore={score}
                      onDecide={decide}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {format === "double" && (
          <div className="mt-4 rounded-xl border border-[color:var(--hairline)] p-3">
            <div className="flex items-center justify-between">
              <p className="eyebrow flex items-center gap-1.5">
                <Gamepad2 size={10} /> Lower bracket · losers round 1
              </p>
              <span className="chip !h-5 !text-[9px]">double elimination</span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {[0, 1].map((index) => (
                <div key={index} className="rounded-lg border border-dashed border-[color:var(--hairline-strong)] px-2.5 py-2 text-[10px] text-[rgb(var(--ink-rgb)/0.45)]">
                  Loser Q{index * 2 + 1} vs Loser Q{index * 2 + 2}
                  <span className="ml-1.5 text-[9px] text-[rgb(var(--ink-rgb)/0.28)]">· awaiting result</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--hairline)] pt-3">
          <div className="flex items-center gap-2 text-[10.5px] text-[rgb(var(--ink-rgb)/0.45)]">
            <Crown size={13} style={{ color: champion ? "#fbbf24" : undefined }} />
            {champion ? (
              <span>
                Champion: <span className="font-medium text-[rgb(var(--ink-rgb)/0.85)]">{champion}</span> · {usd(Math.round(tournament.prize * 0.5))} payout
              </span>
            ) : (
              <span>Champion not decided · click a team row to add a map, then decide the match.</span>
            )}
          </div>
          <Button
            variant="quiet"
            size="small"
            leadingIcon={<Medal size={12} />}
            onClick={() => {
              setMatchState({ scores: {}, winners: {} });
              toast({ title: "Bracket reset", description: "Scores and winners cleared." });
            }}
          >
            Reset bracket
          </Button>
        </div>
      </section>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Reservations & competition"
        title="Events"
        meta="Station bookings, deposits and check-in in one calendar — plus tournament brackets and prize pools."
        actions={
          <div className="flex items-center gap-2">
            <span className="chip !h-7">
              <CalendarDays size={11} /> {upcoming.length} upcoming
            </span>
            <Button
              variant="primary"
              size="small"
              leadingIcon={<Plus size={13} />}
              onClick={() => {
                setTab("reservations");
                setFormOpen(true);
              }}
            >
              New booking
            </Button>
          </div>
        }
      />

      <Tabs
        label="Events views"
        value={tab}
        onValueChange={(value) => setTab(value as typeof tab)}
        items={[
          { value: "reservations", label: "Reservations", content: reservationsTab },
          { value: "tournaments", label: "Tournaments", content: tournamentsTab },
        ]}
      />
    </div>
  );
}

function MatchCard({
  id,
  a,
  b,
  scores,
  winner,
  onScore,
  onDecide,
}: {
  id: string;
  a: string;
  b: string;
  scores: [number, number];
  winner?: string;
  onScore: (id: string, side: 0 | 1) => void;
  onDecide: (id: string, team: string) => void;
}) {
  const placeholder = (team: string) => team.startsWith("Winner") || team.startsWith("Loser");
  return (
    <div
      className="rounded-lg border px-2 py-1.5"
      style={{
        borderColor: winner ? "color-mix(in srgb, #34d399 40%, transparent)" : "var(--hairline)",
        background: "rgb(var(--ink-rgb) / 0.022)",
      }}
    >
      {[a, b].map((team, index) => {
        const isWinner = winner === team;
        return (
          <div key={`${team}-${index}`} className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={placeholder(team)}
              onClick={() => onScore(id, index as 0 | 1)}
              className="min-w-0 flex-1 truncate rounded px-1 py-0.5 text-left text-[10px] transition hover:bg-[rgb(var(--ink-rgb)/0.06)] disabled:opacity-35"
              title={placeholder(team) ? "Waiting for the previous round" : "Add a map win"}
            >
              <span className={isWinner ? "font-semibold" : ""} style={{ color: isWinner ? "#34d399" : undefined }}>
                {team}
              </span>
            </button>
            <span className="num w-4 text-center text-[10px] text-[rgb(var(--ink-rgb)/0.6)]">{scores[index]}</span>
            {!placeholder(team) && (
              <button
                type="button"
                aria-label={`Decide ${id}: ${team}`}
                onClick={() => onDecide(id, team)}
                className="grid size-4 place-items-center rounded text-[rgb(var(--ink-rgb)/0.25)] transition hover:text-[#34d399]"
              >
                <CheckCircle2 size={10} />
              </button>
            )}
          </div>
        );
      })}
      <div className="mt-1 flex items-center justify-between border-t border-[color:var(--hairline)] pt-1">
        <span className="num text-[8px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.28)]">{id}</span>
        <span className="text-[8px] text-[rgb(var(--ink-rgb)/0.3)]">BO3</span>
      </div>
    </div>
  );
}
