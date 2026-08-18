"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   Two chart forms, each doing one job: bars for magnitude over time, and a
   stacked bar for one part-to-whole split. No gauges — a semicircle costs
   twice the vertical space of a bar to convey the same proportion, and it
   reads less accurately.
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Picks an axis top and integer gridlines that fit the data closely.
 *
 * A fixed number of divisions wastes the plot at small counts — a maximum of
 * 2 against a top of 4 leaves the tallest bar at half height, which reads as
 * a quiet month when it is in fact the busiest one. Below six, the axis is the
 * maximum itself with unit steps; above that, the step is the smallest nice
 * value giving roughly four divisions.
 */
function axisScale(max: number): { top: number; ticks: number[] } {
  if (max <= 0) return { top: 1, ticks: [0, 1] };

  if (max <= 5) {
    return { top: max, ticks: Array.from({ length: max + 1 }, (_, i) => i) };
  }

  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const nice = [1, 2, 3, 5, 10].find((candidate) => normalized <= candidate) ?? 10;
  const step = nice * magnitude;
  const top = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let value = 0; value <= top + 1e-9; value += step) ticks.push(Math.round(value));

  return { top, ticks };
}

/** Compact score bar for list rows. */
export function ScoreMeter({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color =
    value >= 70 ? "var(--chart-good)" : value >= 45 ? "var(--chart-warn)" : "var(--chart-bad)";

  return (
    <span className="admin-meter" aria-hidden="true">
      <span className="admin-meter-fill" style={{ width: `${pct}%`, background: color }} />
    </span>
  );
}

export type TrafficPoint = { day: string; label: string; views: number };

/**
 * Thirty days of traffic. Zero days render as a 2px floor rather than nothing,
 * so a gap in the data is visibly a quiet day and not a missing one.
 */
export function TrafficChart({ data }: { data: TrafficPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const rawMax = Math.max(...data.map((point) => point.views), 0);
  const { top: max, ticks } = axisScale(rawMax);
  const active = hovered === null ? null : data[hovered];

  return (
    <div className="traffic">
      <div className="traffic-plot" onMouseLeave={() => setHovered(null)}>
        {ticks
          .filter((_, index, all) => index === 0 || index === all.length - 1)
          .map((tick) => (
            <div
              key={tick}
              className="chart-grid-line"
              style={{ bottom: `${(tick / max) * 100}%` }}
              aria-hidden="true"
            >
              <span className="chart-grid-label">{tick.toLocaleString()}</span>
            </div>
          ))}

        <div
          className="traffic-cols"
          role="img"
          aria-label={`Page views per day over the last ${data.length} days. Busiest day: ${rawMax}.`}
        >
          {data.map((point, index) => {
            const isZero = point.views === 0;
            return (
              <div
                key={point.day}
                className="traffic-col"
                onMouseEnter={() => setHovered(index)}
              >
                {hovered === index && (
                  <span className="chart-tip">
                    {point.views.toLocaleString()}{" "}
                    {point.views === 1 ? "view" : "views"} · {point.label}
                  </span>
                )}
                <div
                  className={`traffic-bar${isZero ? " traffic-bar-zero" : ""}`}
                  style={isZero ? undefined : { height: `${Math.max((point.views / max) * 100, 3)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="traffic-axis" aria-hidden="true">
        <span>{data[0]?.label}</span>
        <span>{active ? active.label : data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Horizontal ranked bar, used for top articles and traffic sources. */
export function RankBar({ value, max }: { value: number; max: number }) {
  return (
    <span className="rank-bar" aria-hidden="true">
      <span className="rank-bar-fill" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </span>
  );
}
