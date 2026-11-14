import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  meta,
  actions,
}: {
  eyebrow: string;
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="eyebrow">{eyebrow}</span>
          <span className="h-px w-6 bg-white/12" />
        </div>
        <h1 className="page-title">{title}</h1>
        {meta && <div className="mt-2 text-[12px] text-white/40">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHead({
  title,
  hint,
  actions,
}: {
  title: string;
  hint?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <h2 className="section-title">{title}</h2>
        {hint && <span className="text-[11px] text-white/35">{hint}</span>}
      </div>
      {actions}
    </div>
  );
}

export function Trend({ value, positive = true }: { value: string; positive?: boolean }) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-medium"
      style={{ color: positive ? "#4ade80" : "#f87171" }}
    >
      <Icon size={12} strokeWidth={2.2} />
      {value}
    </span>
  );
}

export function usd(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "red" | "amber" | "blue" | "slate";
  children: ReactNode;
}) {
  const map = {
    green: { color: "#34d399", bg: "rgb(52 211 153 / 0.1)", border: "rgb(52 211 153 / 0.22)" },
    red: { color: "#f87171", bg: "rgb(248 113 113 / 0.1)", border: "rgb(248 113 113 / 0.22)" },
    amber: { color: "#fbbf24", bg: "rgb(251 191 36 / 0.1)", border: "rgb(251 191 36 / 0.22)" },
    blue: {
      color: "var(--theme-secondary)",
      bg: "color-mix(in srgb, var(--theme-primary) 12%, transparent)",
      border: "color-mix(in srgb, var(--theme-primary) 26%, transparent)",
    },
    slate: { color: "#94a3b8", bg: "rgb(148 163 184 / 0.09)", border: "rgb(148 163 184 / 0.18)" },
  }[tone];

  return (
    <span
      className="inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2 text-[10px] font-medium"
      style={{ color: map.color, background: map.bg, borderColor: map.border }}
    >
      <span className="size-1 rounded-full" style={{ background: map.color }} />
      {children}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-white/10 px-6 py-10 text-center">
      <p className="text-[13px] font-medium text-white/60">{title}</p>
      {hint && <p className="mt-1 text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}
