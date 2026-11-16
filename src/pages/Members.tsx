import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  Drawer,
  NumberField,
  SearchField,
  Select,
  TextField,
  useToast,
} from "open-glass-ui";
import { BadgeCheck, Crown, Plus, UserRound, Wallet } from "lucide-react";
import { PageHeader, SectionHead, StatusPill, usd } from "../components/Bits";
import { useApp } from "../store";
import type { Member } from "../data";

const TIER_STYLE: Record<Member["tier"], { color: string; bg: string; border: string }> = {
  Platinum: { color: "#e2e8f0", bg: "rgb(226 232 240 / 0.1)", border: "rgb(226 232 240 / 0.22)" },
  Gold: { color: "#fbbf24", bg: "rgb(251 191 36 / 0.1)", border: "rgb(251 191 36 / 0.22)" },
  Silver: { color: "#cbd5e1", bg: "rgb(203 213 225 / 0.08)", border: "rgb(203 213 225 / 0.18)" },
  Bronze: { color: "#d97706", bg: "rgb(217 119 6 / 0.1)", border: "rgb(217 119 6 / 0.2)" },
};

function TierBadge({ tier }: { tier: Member["tier"] }) {
  const style = TIER_STYLE[tier];
  return (
    <span
      className="inline-flex h-[22px] items-center gap-1 rounded-full border px-2 text-[9.5px] font-medium"
      style={{ color: style.color, background: style.bg, borderColor: style.border }}
    >
      {tier === "Platinum" && <Crown size={9} />}
      {tier}
    </span>
  );
}

export default function Members() {
  const { toast } = useToast();
  const members = useApp((s) => s.members);
  const stations = useApp((s) => s.stations);
  const activeSessions = stations.filter((s) => s.status === "in-use").length;
  const topUp = useApp((s) => s.topUp);
  const addMember = useApp((s) => s.addMember);

  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState(50);
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", handle: "", tier: "Silver", deposit: 20 });

  const selected = members.find((m) => m.id === selectedId) ?? null;
  const activeNow = members.filter((m) => m.status === "active").length;
  const stored = members.reduce((sum, m) => sum + m.balance, 0);
  const avgSpend = 24.8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(
      (member) =>
        (tier === "All" || member.tier === tier) &&
        (!q ||
          member.name.toLowerCase().includes(q) ||
          member.handle.toLowerCase().includes(q) ||
          member.id.toLowerCase().includes(q)),
    );
  }, [members, query, tier]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="CRM"
        title="Members & logins"
        meta={`${members.length} accounts · ${activeNow} active today`}
        actions={
          <Button
            variant="primary"
            size="small"
            leadingIcon={<Plus size={14} />}
            onClick={() => setNewOpen(true)}
          >
            New member
          </Button>
        }
      />

      <section className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Total members", value: String(members.length), foot: "+6 this week" },
          { label: "Stored balance", value: usd(stored, 0), foot: "liability · reconciled" },
          { label: "Avg. spend / visit", value: usd(avgSpend), foot: "+4.2% vs last month" },
          { label: "Active sessions", value: String(activeSessions), foot: "8 linked to members" },
        ].map((stat) => (
          <div key={stat.label} className="panel p-4">
            <p className="text-[11px] text-[rgb(var(--ink-rgb)/0.40)]">{stat.label}</p>
            <p className="metric mt-2">{stat.value}</p>
            <p className="mt-2 text-[10px] text-[rgb(var(--ink-rgb)/0.28)]">{stat.foot}</p>
          </div>
        ))}
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-end gap-2 border-b border-[rgb(var(--ink-rgb)/0.07)] p-4">
          <div className="min-w-[240px] flex-1">
            <SearchField
              label="Search members"
              value={query}
              onValueChange={setQuery}
              placeholder="Search name, handle or member ID"
            />
          </div>
          <div className="w-[150px]">
            <Select
              label="Tier"
              value={tier}
              onChange={(event) => setTier(event.currentTarget.value)}
              options={["All", "Platinum", "Gold", "Silver", "Bronze"].map((t) => ({
                value: t,
                label: t,
              }))}
            />
          </div>
          <span className="num mb-2 ml-auto hidden text-[10px] text-[rgb(var(--ink-rgb)/0.25)] md:block">
            {filtered.length} accounts
          </span>
        </div>

        <div className="scroll-thin overflow-x-auto">
          <table className="data-table min-w-[960px]">
            <thead>
              <tr>
                <th>Member</th>
                <th>ID</th>
                <th>Tier</th>
                <th className="num">Balance</th>
                <th className="num">Hours</th>
                <th className="num">Visits</th>
                <th>Last visit</th>
                <th>Status</th>
                <th className="num">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member.name} size="small" />
                      <div>
                        <p className="text-[12px] font-medium text-[rgb(var(--ink-rgb)/0.85)]">{member.name}</p>
                        <p className="num text-[9.5px] text-[rgb(var(--ink-rgb)/0.30)]">@{member.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="num text-[10px] text-[rgb(var(--ink-rgb)/0.40)]">{member.id}</td>
                  <td>
                    <TierBadge tier={member.tier} />
                  </td>
                  <td className="num">
                    <span className={member.balance < 10 ? "text-amber-300/90" : ""}>
                      {usd(member.balance)}
                    </span>
                  </td>
                  <td className="num text-[rgb(var(--ink-rgb)/0.55)]">{member.hours}h</td>
                  <td className="num text-[rgb(var(--ink-rgb)/0.55)]">{member.visits}</td>
                  <td className="text-[11px] text-[rgb(var(--ink-rgb)/0.40)]">{member.lastVisit}</td>
                  <td>
                    <StatusPill
                      tone={
                        member.status === "active" ? "green" : member.status === "idle" ? "slate" : "red"
                      }
                    >
                      {member.status === "banned" ? "Banned" : member.status}
                    </StatusPill>
                  </td>
                  <td className="text-right">
                    <Button variant="quiet" size="small" onClick={() => setSelectedId(member.id)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Drawer
        title={selected ? selected.name : "Member"}
        description={selected ? `${selected.id} · @${selected.handle}` : undefined}
        open={!!selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-[rgb(var(--ink-rgb)/0.08)] bg-[rgb(var(--ink-rgb)/0.03)] p-3">
              <Avatar name={selected.name} size="large" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-[rgb(var(--ink-rgb)/0.90)]">{selected.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <TierBadge tier={selected.tier} />
                  <StatusPill tone={selected.status === "active" ? "green" : "slate"}>
                    {selected.status}
                  </StatusPill>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[rgb(var(--ink-rgb)/0.35)]">Balance</p>
                <p className="num text-[20px] text-[rgb(var(--ink-rgb)/0.95)]">{usd(selected.balance)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["Hours", `${selected.hours}h`],
                ["Visits", String(selected.visits)],
                ["Last seen", selected.lastVisit],
              ].map(([label, value]) => (
                <div key={label} className="inset-well p-2.5">
                  <p className="text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--ink-rgb)/0.30)]">{label}</p>
                  <p className="num mt-1 text-[12px] text-[rgb(var(--ink-rgb)/0.80)]">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="eyebrow mb-2">Top up balance</p>
              <div className="mb-2 flex gap-1.5">
                {[20, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="cat-chip"
                    data-active={amount === preset}
                    onClick={() => setAmount(preset)}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              <NumberField label="Custom amount" value={amount} min={5} step={5} onValueChange={setAmount} />
              <Button
                variant="primary"
                className="mt-3 w-full"
                leadingIcon={<Wallet size={15} />}
                onClick={() => {
                  topUp(selected.id, amount);
                  toast({
                    title: "Balance topped up",
                    description: `${selected.name} · +${usd(amount)}`,
                  });
                }}
              >
                Add {usd(amount)} to balance
              </Button>
            </div>

            <div className="space-y-1.5 border-t border-[rgb(var(--ink-rgb)/0.08)] pt-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[rgb(var(--ink-rgb)/0.35)]">Loyalty tier</span>
                <span className="flex items-center gap-1 text-[rgb(var(--ink-rgb)/0.75)]">
                  <BadgeCheck size={12} /> {selected.tier} · {selected.visits} visits
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[rgb(var(--ink-rgb)/0.35)]">Preferred seat</span>
                <span className="num text-[rgb(var(--ink-rgb)/0.75)]">
                  {selected.tier === "Platinum" ? "VIP-01" : selected.tier === "Gold" ? "MH-04" : "Walk-in"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[rgb(var(--ink-rgb)/0.35)]">Member since</span>
                <span className="text-[rgb(var(--ink-rgb)/0.75)]">Mar 2024</span>
              </div>
            </div>

            <Button
              variant="quiet"
              size="small"
              className="w-full"
              leadingIcon={<UserRound size={13} />}
              onClick={() => toast({ title: "Profile opened", description: "Full history in CRM." })}
            >
              View full history
            </Button>
          </div>
        )}
      </Drawer>

      <Dialog
        title="New member"
        description="Issue a loyalty account and opening balance."
        open={newOpen}
        onOpenChange={setNewOpen}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Full name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })}
              placeholder="Rhea Malik"
            />
            <TextField
              label="Handle"
              value={draft.handle}
              onChange={(event) => setDraft({ ...draft, handle: event.currentTarget.value })}
              placeholder="rhea.m"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tier"
              value={draft.tier}
              onChange={(event) => setDraft({ ...draft, tier: event.currentTarget.value })}
              options={["Platinum", "Gold", "Silver", "Bronze"].map((t) => ({ value: t, label: t }))}
            />
            <NumberField
              label="Opening balance"
              value={draft.deposit}
              min={0}
              step={5}
              onValueChange={(value) => setDraft({ ...draft, deposit: value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="quiet" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!draft.name.trim()}
              onClick={() => {
                addMember({
                  id: `MB-${2400 + members.length}`,
                  name: draft.name.trim(),
                  handle: draft.handle.trim() || draft.name.toLowerCase().replace(/\s+/g, "."),
                  tier: draft.tier as Member["tier"],
                  balance: draft.deposit,
                  hours: 0,
                  visits: 0,
                  lastVisit: "Just now",
                  status: "active",
                });
                toast({ title: "Member created", description: `${draft.name.trim()} · ${draft.tier}` });
                setNewOpen(false);
                setDraft({ name: "", handle: "", tier: "Silver", deposit: 20 });
              }}
            >
              Create member
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
