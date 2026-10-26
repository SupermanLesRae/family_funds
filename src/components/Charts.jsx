import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { timeSeries } from "../lib/aggregate.js";
import { bucketLabel, GRANULARITIES } from "../lib/dates.js";
import { formatMoney } from "../lib/money.js";
import { cardCls } from "./ui.jsx";

// Palette-only categorical shades: #da899c and #eedfe3 mixed with the dark text neutral at different strengths.
export const PALETTE = [
  "#da899c",
  "color-mix(in srgb, #da899c 55%, #262826)",
  "#eedfe3",
  "color-mix(in srgb, #da899c 30%, #262826)",
  "color-mix(in srgb, #da899c 80%, #262826)",
  "color-mix(in srgb, #eedfe3 50%, #262826)",
  "color-mix(in srgb, #da899c 65%, #eeedeb)",
  "color-mix(in srgb, #da899c 15%, #262826)",
  "color-mix(in srgb, #da899c 40%, #262826)",
  "color-mix(in srgb, #eedfe3 75%, #262826)",
  "color-mix(in srgb, #da899c 90%, #262826)",
  "color-mix(in srgb, #da899c 25%, #eeedeb)",
];
const color = (i) => PALETTE[i % PALETTE.length];
const tooltipProps = {
  formatter: (v) => formatMoney(v),
  contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--fg)" },
  itemStyle: { color: "var(--fg)" },
  labelStyle: { color: "var(--muted)" },
};
const tick = { fill: "var(--muted)", fontSize: 12 };
const compact = new Intl.NumberFormat("en", { notation: "compact" });
const axisMoney = (v) => `R ${compact.format(v / 100)}`;

export function ChartCard({ title, children, action }) {
  return (
    <section className={`${cardCls} p-4`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// data: [{ id, name, total, count, percent }]
export function CategoryDonut({ data }) {
  return (
    <ChartCard title="Spending by category">
      <div className="h-64" role="img" aria-label="Doughnut chart of spending by category; see the breakdown list for values">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" innerRadius="55%" outerRadius="85%" stroke="var(--surface)">
              {data.map((d, i) => <Cell key={d.id} fill={color(i)} />)}
            </Pie>
            <Tooltip {...tooltipProps} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function PersonBars({ data }) {
  return (
    <ChartCard title="Spending by person">
      <div className="h-64" role="img" aria-label="Bar chart of spending by person">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" tick={tick} stroke="var(--border)" />
            <YAxis tickFormatter={axisMoney} tick={tick} stroke="var(--border)" width={56} />
            <Tooltip {...tooltipProps} cursor={{ fill: "var(--soft)" }} />
            <Bar dataKey="total" fill="var(--brand)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function SpendingOverTime({ list, defaultGranularity = "day" }) {
  const [g, setG] = useState(defaultGranularity);
  const data = timeSeries(list, g).map((d) => ({ ...d, label: bucketLabel(d.bucket, g) }));
  const toggle = (
    <div role="group" aria-label="Group by" className="flex overflow-hidden rounded-lg border border-border text-xs">
      {GRANULARITIES.map((x) => (
        <button key={x} type="button" aria-pressed={g === x} onClick={() => setG(x)} className={`px-3 py-1.5 capitalize ${g === x ? "bg-brand text-brand-fg" : "bg-surface"}`}>
          {x}
        </button>
      ))}
    </div>
  );
  return (
    <ChartCard title="Spending over time" action={toggle}>
      <div className="h-64" role="img" aria-label={`Bar chart of spending by ${g}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={tick} stroke="var(--border)" minTickGap={16} />
            <YAxis tickFormatter={axisMoney} tick={tick} stroke="var(--border)" width={56} />
            <Tooltip {...tooltipProps} cursor={{ fill: "var(--soft)" }} />
            <Bar dataKey="total" fill="var(--brand)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// data: [{ date, total }] zero-filled for the whole pay period; today's bar is highlighted.
export function DailySpending({ data, today, periodLabel }) {
  const rows = data.map((d) => ({ ...d, label: bucketLabel(d.date, "day") }));
  return (
    <ChartCard title="Spending per day" action={<span className="text-xs text-muted">{periodLabel}</span>}>
      <div className="h-64" role="img" aria-label="Bar chart of money spent on each day of the pay period">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={tick} stroke="var(--border)" minTickGap={16} />
            <YAxis tickFormatter={axisMoney} tick={tick} stroke="var(--border)" width={56} />
            <Tooltip {...tooltipProps} cursor={{ fill: "var(--soft)" }} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {rows.map((d) => <Cell key={d.date} fill={d.date === today ? "var(--fg)" : "var(--brand)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function CategoryBreakdown({ data }) {
  return (
    <ChartCard title="Category breakdown">
      <ol className="grid gap-3">
        {data.map((d, i) => (
          <li key={d.id}>
            <div className="mb-1 flex justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: color(i) }} />
                {d.name}
              </span>
              <span className="whitespace-nowrap">
                {formatMoney(d.total)} <span className="text-muted">· {d.percent.toFixed(1)}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-soft" aria-hidden>
              <div className="h-full rounded-full" style={{ width: `${d.percent}%`, background: color(i) }} />
            </div>
          </li>
        ))}
      </ol>
    </ChartCard>
  );
}
