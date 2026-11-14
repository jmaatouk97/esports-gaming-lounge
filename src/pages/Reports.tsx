import { useState } from "react";
import {
  Button,
  Card,
  Dialog,
  Progress,
  SegmentedControl,
  Stepper,
  useToast,
} from "open-glass-ui";
import {
  ArrowDownToLine,
  BadgeDollarSign,
  CalendarDays,
  CheckCheck,
  ClipboardCheck,
  Clock3,
  FileDown,
  Users,
} from "lucide-react";
import { PageHeader, SectionHead, StatusPill, usd } from "../components/Bits";
import { shifts } from "../data";

const archive = [
  { id: "Z-113", date: "Nov 13", gross: 5620, net: 3660, staff: "Ivy M.", status: "signed" },
  { id: "Z-112", date: "Nov 12", gross: 5070, net: 3230, staff: "Omar K.", status: "signed" },
  { id: "Z-111", date: "Nov 11", gross: 5310, net: 3420, staff: "Nadia R.", status: "signed" },
  { id: "Z-110", date: "Nov 10", gross: 4890, net: 3080, staff: "Ivy M.", status: "signed" },
  { id: "Z-109", date: "Nov 09", gross: 4360, net: 2710, staff: "Omar K.", status: "signed" },
];

const staff = [
  { name: "Omar K.", role: "Shift manager", shifts: 5, sales: 8420, upsell: "14.2%" },
  { name: "Nadia R.", role: "Front desk", shifts: 5, sales: 7280, upsell: "11.8%" },
  { name: "Ivy M.", role: "Night lead", shifts: 4, sales: 6110, upsell: "9.4%" },
];

export default function Reports() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [range, setRange] = useState("today");
  const [zOpen, setZOpen] = useState(false);

  const current = shifts[2];
  const expected = current.cash + 120;
  const counted = 331.4;
  const variance = counted - expected;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Operations"
        title="Shift reports"
        meta="Sat 14 Nov · shift SH-116 · night close at 06:00"
        actions={
          <>
            <Button
              variant="secondary"
              size="small"
              leadingIcon={<CalendarDays size={14} />}
              onClick={() => toast({ title: "Range updated", description: "Nov 08 – Nov 14" })}
            >
              Nov 08 – 14
            </Button>
            <Button
              variant="primary"
              size="small"
              leadingIcon={<FileDown size={14} />}
              onClick={() => toast({ title: "Report pack queued", description: "7 Z-reports · PDF · 2.4 MB" })}
            >
              Export pack
            </Button>
          </>
        }
      />

      <div className="mb-3 rounded-2xl border border-white/7 bg-white/2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-[220px] flex-1">
            <p className="eyebrow mb-1">Close workflow</p>
            <Stepper
              current={step}
              onStepChange={setStep}
              items={[
                { label: "Cash count", description: "Drawer SH-116" },
                { label: "Reconcile", description: "Card + tabs" },
                { label: "Sign off", description: "Manager approval" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="num text-[10px] text-white/30">Step {step + 1} of 3</span>
            <Button
              variant="primary"
              size="small"
              disabled={step === 2}
              onClick={() => {
                const next = Math.min(step + 1, 2);
                setStep(next);
                if (next === 2) toast({ title: "Shift signed off", description: "SH-116 · variance −$12.70" });
              }}
            >
              {step === 2 ? "Signed" : "Continue"}
            </Button>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_1fr]">
        <div className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow">Open shift</span>
                <StatusPill tone="blue">SH-116</StatusPill>
              </div>
              <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-white/92">
                Night · Ivy M.
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/35">
                <Clock3 size={12} /> 22:00 — 06:00 · 4h 12m elapsed
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/35">Gross</p>
              <p className="num text-[26px] tracking-tight text-white/95">{usd(1486.5)}</p>
              <p className="text-[10px] text-white/28">+8.4% vs. last Friday</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ["Cash", current.cash],
              ["Card", current.card],
              ["PC tabs", current.tab],
            ].map(([label, value]) => (
              <div key={String(label)} className="inset-well p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-white/30">{label}</p>
                <p className="num mt-1 text-[14px] text-white/85">{usd(Number(value))}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-white/8 bg-white/3 p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="section-title">Cash reconciliation</span>
              <span className="rail-label">SH-116</span>
            </div>
            {[
              ["Opening float", 120],
              ["Cash sales", current.cash],
              ["Expected in drawer", expected],
              ["Counted", counted],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between border-t border-white/6 py-1.5 text-[11px]">
                <span className="text-white/40">{label}</span>
                <span className="num text-white/75">{usd(Number(value))}</span>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="text-[11px] text-white/55">Variance</span>
              <span
                className="num text-[13px]"
                style={{ color: variance < 0 ? "#f87171" : "#4ade80" }}
              >
                {usd(variance)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="small"
              leadingIcon={<BadgeDollarSign size={13} />}
              onClick={() => toast({ title: "Cash count started", description: "Drawer 1 · SH-116" })}
            >
              Count cash
            </Button>
            <Button
              variant="secondary"
              size="small"
              leadingIcon={<ClipboardCheck size={13} />}
              onClick={() => setZOpen(true)}
            >
              Preview Z-report
            </Button>
            <Button
              variant="primary"
              size="small"
              leadingIcon={<CheckCheck size={13} />}
              className="ml-auto"
              onClick={() => toast({ title: "Shift closed", description: "SH-116 archived · Z-116" })}
            >
              Close shift
            </Button>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 pb-2">
            <SectionHead title="Z-report archive" hint="last 5 closes" />
            <div className="w-[150px]">
              <SegmentedControl
                aria-label="Report range"
                value={range}
                onValueChange={setRange}
                items={[
                  { value: "today", label: "Day" },
                  { value: "week", label: "Week" },
                ]}
              />
            </div>
          </div>
          <div className="divide-y divide-white/6">
            {archive.slice(0, range === "today" ? 3 : 5).map((report) => (
              <div key={report.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="grid size-8 place-items-center rounded-lg border border-white/8 bg-white/4 text-white/45">
                  <ArrowDownToLine size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="num text-[11px] text-white/80">{report.id}</span>
                    <span className="text-[10px] text-white/30">{report.date}</span>
                  </div>
                  <p className="text-[10px] text-white/32">
                    {report.staff} · gross {usd(report.gross, 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-[11px] text-white/70">{usd(report.net, 0)}</p>
                  <p className="text-[9px] text-white/25">net</p>
                </div>
                <Button
                  variant="quiet"
                  size="small"
                  onClick={() => toast({ title: `${report.id} downloaded`, description: `${report.date} · PDF` })}
                >
                  PDF
                </Button>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 p-4">
            <div className="mb-2 flex items-center justify-between text-[10px]">
              <span className="text-white/35">Month-to-date close rate</span>
              <span className="num text-white/70">13 / 14</span>
            </div>
            <Progress label="Close rate" value={13} max={14} />
          </div>
          <div className="border-t border-white/8 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow">Handover notes</span>
              <span className="rail-label">3 items</span>
            </div>
            <div className="space-y-1.5">
              {[
                "VIP-03 sent to service · GPU fan replacement.",
                "Energy restock due before 12:00 · 24 units.",
                "Lost jacket logged at desk · ticket #A-118.",
              ].map((note) => (
                <div key={note} className="flex items-start gap-2 rounded-lg bg-white/2 px-2.5 py-1.5">
                  <span
                    className="mt-1.5 size-1 shrink-0 rounded-full"
                    style={{ background: "var(--theme-secondary)" }}
                  />
                  <p className="text-[10.5px] leading-relaxed text-white/45">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_1fr]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 pb-2">
            <SectionHead title="Staff performance" hint="this week" />
            <Users size={14} className="text-white/30" />
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th className="num">Shifts</th>
                <th className="num">Sales</th>
                <th className="num">Upsell</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((person) => (
                <tr key={person.name}>
                  <td>
                    <p className="text-[12px] text-white/85">{person.name}</p>
                    <p className="text-[9.5px] text-white/30">{person.role}</p>
                  </td>
                  <td className="num text-white/55">{person.shifts}</td>
                  <td className="num">{usd(person.sales, 0)}</td>
                  <td className="num" style={{ color: "var(--theme-secondary)" }}>
                    {person.upsell}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Shifts closed", value: "13", foot: "1 open · today" },
            { label: "Cash variance", value: usd(-12.7), foot: "within tolerance" },
            { label: "Z-reports", value: "13", foot: "all signed" },
            { label: "Avg. close time", value: "11m", foot: "target 15m" },
          ].map((item) => (
            <Card key={item.label} className="!p-4">
              <p className="text-[10px] text-white/35">{item.label}</p>
              <p className="num mt-1.5 text-[19px] text-white/90">{item.value}</p>
              <p className="mt-1.5 text-[9.5px] text-white/28">{item.foot}</p>
            </Card>
          ))}
        </div>
      </section>

      <Dialog
        title="Z-report preview · SH-116"
        description="Night shift · Ivy M. · 22:00 — 06:00"
        open={zOpen}
        onOpenChange={setZOpen}
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-white/8 bg-white/3 p-3 text-[12px]">
            {[
              ["Gross sales", 1486.5],
              ["Refunds", -24],
              ["Discounts", -48.2],
              ["Net revenue", 1414.3],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between py-1">
                <span className="text-white/40">{label}</span>
                <span className="num text-white/80">{usd(Number(value))}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setZOpen(false)}>
              Back
            </Button>
            <Button
              variant="primary"
              leadingIcon={<FileDown size={14} />}
              onClick={() => {
                setZOpen(false);
                toast({ title: "Z-116 exported", description: "PDF · signed by Omar K." });
              }}
            >
              Export PDF
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
