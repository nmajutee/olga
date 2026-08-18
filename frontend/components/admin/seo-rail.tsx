"use client";

import { useMemo } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { analyzeSeo, type SeoInput } from "@/lib/seo-score";

type Props = SeoInput & { siteUrl: string };

const GRADE_COLOR: Record<string, string> = {
  Excellent: "var(--chart-good)",
  Good: "var(--chart-good)",
  "Needs work": "var(--warn)",
  Poor: "var(--chart-bad)",
};

const CHECK_ICON = {
  good: CheckCircleIcon,
  warn: ExclamationTriangleIcon,
  bad: XCircleIcon,
} as const;

function CharacterMeter({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}) {
  const within = value >= min && value <= max;
  const color = value === 0 ? "var(--ink-4)" : within ? "var(--good)" : "var(--warn)";

  return (
    <span className="admin-mono text-xs" style={{ color }}>
      {value}/{max}
    </span>
  );
}

export function SeoRail({ siteUrl, ...input }: Props) {
  const analysis = useMemo(() => analyzeSeo(input), [input]);

  const displayTitle = input.metaTitle.trim() || input.title.trim() || "Untitled article";
  const displayDescription =
    input.metaDescription.trim() ||
    "No meta description yet — search engines will improvise one from the page text.";
  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="space-y-4">
      {/* Score, set as type rather than a gauge — it is a reading, not a game. */}
      <div className="admin-card p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="admin-label-caps">SEO reading</span>
          <span
            className="admin-mono text-xs font-semibold"
            style={{ color: GRADE_COLOR[analysis.grade] }}
          >
            {analysis.grade}
          </span>
        </div>

        <div className="mt-2 flex items-end gap-3">
          <span
            className="admin-figure text-[40px] leading-none"
            style={{ color: GRADE_COLOR[analysis.grade] }}
          >
            {analysis.score}
          </span>
          <span className="pb-1.5 text-xs text-[var(--ink-3)]">
            {analysis.wordCount.toLocaleString()} words
            <br />
            {analysis.keywordDensity}% keyword density
          </span>
        </div>
      </div>

      {/* Checks as pencil marks in the margin. */}
      <div className="admin-card px-4 py-2">
        {analysis.checks.map((check) => (
          <div key={check.id} className={`admin-check admin-check-${check.status}`}>
            <span className="admin-check-mark" aria-hidden="true">
              {(() => {
                const Icon = CHECK_ICON[check.status];
                return <Icon />;
              })()}
            </span>
            <div>
              <p className="admin-check-label">{check.label}</p>
              <p className="admin-check-detail">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What a searcher actually sees. */}
      <div className="admin-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="admin-label-caps">Search preview</span>
          <span className="flex gap-2">
            <CharacterMeter value={displayTitle.length} min={30} max={60} />
            <CharacterMeter value={input.metaDescription.trim().length} min={120} max={158} />
          </span>
        </div>

        <div className="admin-serp">
          <p className="admin-serp-url">
            {host} › blog › {input.slug || "your-slug"}
          </p>
          <p className="admin-serp-title">
            {displayTitle.length > 60 ? `${displayTitle.slice(0, 59)}…` : displayTitle}
          </p>
          <p className="admin-serp-desc">
            {displayDescription.length > 158
              ? `${displayDescription.slice(0, 157)}…`
              : displayDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
