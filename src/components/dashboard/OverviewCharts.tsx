"use client";

import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashCardPad, dashSectionTitle } from "@/styles/dashboard";

const FUNNEL_COLORS = ["#d30203", "#f59e0b", "#10b981", "#94a3b8"];

/** Pure SVG — avoids Recharts ResponsiveContainer setState loops (React #185). */
export function OverviewLeadsAreaChart({
  data,
}: {
  data: Array<{ day: string; count: number }>;
}) {
  const t = useDashT();
  const w = 520;
  const h = 180;
  const padX = 12;
  const padY = 16;
  const max = Math.max(1, ...data.map((d) => d.count));
  const n = Math.max(1, data.length - 1);

  const pts = data.map((d, i) => {
    const x = padX + (i * (w - padX * 2)) / n;
    const y = h - padY - (d.count / max) * (h - padY * 2);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const area =
    pts.length === 0
      ? ""
      : [
          `M ${pts[0]![0]} ${h - padY}`,
          `L ${pts[0]![0]} ${pts[0]![1]}`,
          ...pts.slice(1).map(([x, y]) => `L ${x} ${y}`),
          `L ${pts[pts.length - 1]![0]} ${h - padY}`,
          "Z",
        ].join(" ");

  return (
    <section className={dashCardPad}>
      <h2 className={dashSectionTitle}>{t.overview.chartTitle}</h2>
      <div className="mt-3 h-52 w-full min-w-0">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-full w-full"
          role="img"
          aria-label={t.overview.chartTitle}
        >
          <defs>
            <linearGradient id="dashLeadsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d30203" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#d30203" stopOpacity={0} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((p) => {
            const y = padY + p * (h - padY * 2);
            return (
              <line
                key={p}
                x1={padX}
                x2={w - padX}
                y1={y}
                y2={y}
                stroke="var(--dash-border)"
                strokeWidth="1"
              />
            );
          })}
          <path d={area} fill="url(#dashLeadsFill)" />
          <path
            d={line}
            fill="none"
            stroke="#d30203"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {pts.map(([x, y], i) => (
            <circle
              key={data[i]?.day ?? i}
              cx={x}
              cy={y}
              r="3.5"
              fill="white"
              stroke="#d30203"
              strokeWidth="2"
            />
          ))}
          {data.map((d, i) => {
            const x = padX + (i * (w - padX * 2)) / n;
            return (
              <text
                key={`lbl-${d.day}`}
                x={x}
                y={h - 2}
                textAnchor="middle"
                fontSize="10"
                fill="var(--dash-muted)"
              >
                {d.day}
              </text>
            );
          })}
        </svg>
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
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <section className={dashCardPad}>
      <h2 className={dashSectionTitle}>{t.overview.statusesTitle}</h2>
      <ul className="m-0 mt-3 grid list-none gap-3 p-0">
        {data.map((row, i) => {
          const pct = Math.round((row.count / max) * 100);
          return (
            <li key={row.label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium text-[var(--dash-ink)]">
                  {row.label}
                </span>
                <span className="shrink-0 tabular-nums text-[var(--dash-muted)]">
                  {row.count}
                </span>
              </div>
              <div className="h-3.5 overflow-hidden rounded-full bg-black/[0.04]">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${pct}%`,
                    background: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                    minWidth: row.count > 0 ? 8 : 0,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
