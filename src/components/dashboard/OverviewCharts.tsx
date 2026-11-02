"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashCardPad, dashSectionTitle } from "@/styles/dashboard";

const FUNNEL_COLORS = ["#d30203", "#f59e0b", "#10b981", "#94a3b8"];

export function OverviewLeadsAreaChart({
  data,
}: {
  data: Array<{ day: string; count: number }>;
}) {
  const t = useDashT();
  return (
    <section className={dashCardPad}>
      <h2 className={dashSectionTitle}>{t.overview.chartTitle}</h2>
      <div className="mt-3 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dashLeadsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d30203" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#d30203" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--dash-border)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "var(--dash-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              width={28}
              tick={{ fontSize: 11, fill: "var(--dash-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--dash-border)",
                background: "var(--dash-surface)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#d30203"
              strokeWidth={2}
              fill="url(#dashLeadsFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function OverviewFunnelChart({
  data,
}: {
  data: Array<{ label: string; count: number }>;
}) {
  const t = useDashT();
  return (
    <section className={dashCardPad}>
      <h2 className={dashSectionTitle}>{t.overview.statusesTitle}</h2>
      <div className="mt-3 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={88}
              tick={{ fontSize: 11, fill: "var(--dash-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--dash-border)",
                background: "var(--dash-surface)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={14}>
              {data.map((_, i) => (
                <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
