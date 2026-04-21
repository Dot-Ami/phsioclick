// Stage 02-B / F7 + F8 — Recharts-backed charts for the Progress
// "More signals" accordion. Lazy-loaded by ProgressScreen so Recharts stays
// out of the main bundle on first paint.
//
// Charts:
//   "flip-frequency"          — F7. Top-10 muscles by flip count from M2.
//                               Bilateral toggle: left / right / combined.
//                               Respects the parent windowDays (7/30/90).
//   "recovery-trend"          — F7. 90d rolling recovery-rate trend, one
//                               point per week, computed by repeatedly
//                               calling M6 (`recoveryRate`) at each week-end
//                               with the spec's default `recoveryWindowDays
//                               = 14`. Empty state when stateChanges spans
//                               < 7 days, mirroring the F3 calibration
//                               banner pattern.
//   "assessment-correlation"  — F8. Dual-axis chart joining each assessment
//                               session's bilateral value (left axis, line)
//                               to the driver muscles' flagged days (right
//                               axis, bars) from M9. Side picker switches
//                               the plotted side. Empty state when no
//                               assessments OR no driver entry exists.
//
// Tokens-only styling: Recharts can't consume Tailwind classes, so the
// color constants below mirror the values in `tailwind.config.js`
// (theme.colors.brand + theme.colors.state.*). Update both files together.

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  flipFrequency as computeFlipFrequency,
  recoveryRate as computeRecoveryRate,
  stateChangesSpanDays,
  assessmentStateCorrelation,
} from "./metrics";
import { getMuscleLabel } from "./muscle-data";

// Mirrors tailwind.config.js. Keep in sync if the design tokens move.
const TOKEN = {
  brand: "#14b8a6",
  stateTight: "#f59e0b",
  stateWeak: "#818cf8",
  stateBalanced: "#5eead4",
  zincGrid: "#3f3f46",
  zincAxis: "#a1a1aa",
  zincPanel: "#18181b",
  zincBorder: "#27272a",
  zincFg: "#f4f4f5",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const TOOLTIP_STYLE = {
  background: TOKEN.zincPanel,
  border: `1px solid ${TOKEN.zincBorder}`,
  color: TOKEN.zincFg,
  fontSize: 12,
};

function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ---------------------------------------------------------------------------
// F7 — Flip frequency

function FlipFrequencyChart({ stateChanges, windowDays, now }) {
  const [side, setSide] = useState("combined");
  const historySpan = useMemo(() => stateChangesSpanDays(stateChanges), [stateChanges]);

  const data = useMemo(() => {
    const r = computeFlipFrequency({ stateChanges, now, windowDays });
    let rows = [];
    if (side === "combined") {
      rows = Object.values(r.byBaseId).map((b) => ({
        id: b.baseId,
        label: getMuscleLabel(`${b.baseId}-l`).replace(/\s\(L\)$/, ""),
        flips: b.flipCount,
      }));
    } else {
      const suffix = side === "left" ? "-l" : "-r";
      rows = Object.values(r.byMuscleId)
        .filter((m) => typeof m.muscleId === "string" && m.muscleId.endsWith(suffix))
        .map((m) => ({
          id: m.muscleId,
          label: getMuscleLabel(m.muscleId),
          flips: m.flipCount,
        }));
    }
    rows.sort((a, b) => b.flips - a.flips);
    return rows.slice(0, 10);
  }, [stateChanges, windowDays, now, side]);

  if (historySpan < 7) {
    return (
      <p className="text-body text-zinc-400" role="status">
        Calibrating — the flip-frequency chart sharpens once you have at least a week of
        state history. Keep flagging muscles on Body; the bars will populate soon.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption text-zinc-400">
          Top 10 by flip count over the last {windowDays} day{windowDays === 1 ? "" : "s"}.
          Each bar = one stateChange event into or out of flagged.
        </p>
        <div
          role="radiogroup"
          aria-label="Bilateral split"
          className="inline-flex overflow-hidden rounded-full border border-zinc-800 bg-zinc-950 text-caption"
        >
          {[
            { id: "left", label: "Left" },
            { id: "right", label: "Right" },
            { id: "combined", label: "Combined" },
          ].map((opt) => {
            const active = side === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSide(opt.id)}
                className={`px-2.5 py-1 transition-colors duration-150 ease-standard ${
                  active ? "bg-brand text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-body text-zinc-400">
          No flips logged in the last {windowDays} days. Mark a muscle on the
          Body atlas to start the chart.
        </p>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
            >
              <CartesianGrid stroke={TOKEN.zincGrid} strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                stroke={TOKEN.zincAxis}
                tick={{ fontSize: 11, fill: TOKEN.zincAxis }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                stroke={TOKEN.zincAxis}
                tick={{ fontSize: 11, fill: TOKEN.zincAxis }}
                width={130}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [`${value}`, "Flips"]}
              />
              <Bar dataKey="flips" fill={TOKEN.brand} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// F7 — Recovery rate trend (90d rolling, one point per week)

function RecoveryRateTrendChart({ stateChanges, now }) {
  const span = useMemo(() => stateChangesSpanDays(stateChanges), [stateChanges]);

  const data = useMemo(() => {
    const ts = now.getTime();
    const points = [];
    // Walk back ~13 weeks so the line covers ~90d.
    for (let i = 12; i >= 0; i -= 1) {
      const weekEndTs = ts - i * 7 * MS_PER_DAY;
      const r = computeRecoveryRate({
        stateChanges,
        now: new Date(weekEndTs),
        windowDays: 14,
      });
      points.push({
        date: new Date(weekEndTs).toISOString().slice(0, 10),
        recoveryPct: Math.round(r.recoveryRate * 100),
        flags: r.totalFlags,
      });
    }
    return points;
  }, [stateChanges, now]);

  if (span < 7) {
    return (
      <p className="text-body text-zinc-400">
        Calibrating — the recovery trend appears once you have at least a
        week of stateChanges history. Keep flagging muscles and the line
        will fill in.
      </p>
    );
  }

  const allZero = data.every((p) => p.flags === 0);

  return (
    <div className="space-y-3">
      <p className="text-caption text-zinc-400">
        Rolling 14-day recovery rate, sampled weekly across the last 90
        days. Higher is better — it&apos;s the share of flags that returned
        to normal within two weeks.
      </p>
      {allZero ? (
        <p className="text-body text-zinc-400">
          No flags in the rolling window yet. Mark a few tight or weak
          muscles to start the trend.
        </p>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid stroke={TOKEN.zincGrid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke={TOKEN.zincAxis}
                tick={{ fontSize: 11, fill: TOKEN.zincAxis }}
                tickFormatter={shortDate}
              />
              <YAxis
                stroke={TOKEN.zincAxis}
                tick={{ fontSize: 11, fill: TOKEN.zincAxis }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={shortDate}
                formatter={(value, name) =>
                  name === "recoveryPct"
                    ? [`${value}%`, "Recovery rate"]
                    : [value, name]
                }
              />
              <Line
                type="monotone"
                dataKey="recoveryPct"
                stroke={TOKEN.stateBalanced}
                strokeWidth={2}
                dot={{ r: 2, fill: TOKEN.stateBalanced }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// F8 — Assessment-to-state correlation (dual-axis)

function AssessmentCorrelationChart({
  assessments,
  stateChanges,
  drivers,
  now,
  windowDays = 30,
}) {
  const [side, setSide] = useState("left");

  const correlation = useMemo(
    () =>
      assessmentStateCorrelation({
        assessments,
        stateChanges,
        drivers,
        now,
        windowDays,
      }),
    [assessments, stateChanges, drivers, now, windowDays],
  );

  const tests = useMemo(() => {
    const set = new Set();
    for (const row of correlation) {
      if (row.testKey) set.add(row.testKey);
    }
    return Array.from(set);
  }, [correlation]);

  const [test, setTest] = useState(tests[0] || "");
  const activeTest = test && tests.includes(test) ? test : tests[0];

  useEffect(() => {
    if (!tests.length) return;
    if (!tests.includes(test)) setTest(tests[0]);
  }, [tests, test]);

  const driverIds = activeTest && drivers ? drivers[activeTest] || [] : [];
  const driverLabels = driverIds
    .map((id) => getMuscleLabel(`${id}-${side === "left" ? "l" : "r"}`))
    .filter(Boolean);

  const series = useMemo(() => {
    if (!activeTest) return [];
    return correlation
      .filter((row) => row.testKey === activeTest)
      .map((row) => ({
        date: row.date,
        value:
          side === "left" ? row.assessmentValueLeft : row.assessmentValueRight,
        flagged:
          side === "left"
            ? row.driverFlaggedDaysLeft
            : row.driverFlaggedDaysRight,
      }))
      .filter((row) => Number.isFinite(row.value));
  }, [correlation, activeTest, side]);

  if (correlation.length === 0) {
    return (
      <p className="text-body text-zinc-400">
        Add a bilateral assessment on the Plan tab to start a trend here.
      </p>
    );
  }
  if (!activeTest || driverIds.length === 0) {
    return (
      <p className="text-body text-zinc-400">
        No driver muscles mapped yet for this test. The correlation view
        appears once a mapping exists in{" "}
        <code className="rounded bg-zinc-900 px-1 text-caption text-zinc-300">
          src/data/assessment-drivers.js
        </code>
        .
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Test"
          className="rounded-10 border border-zinc-700 bg-zinc-900 px-2 py-1 text-caption text-zinc-200 focus:border-brand focus:outline-none"
          value={activeTest}
          onChange={(e) => setTest(e.target.value)}
        >
          {tests.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div
          role="radiogroup"
          aria-label="Side"
          className="ml-auto inline-flex overflow-hidden rounded-full border border-zinc-800 bg-zinc-950 text-caption"
        >
          {[
            { id: "left", label: "Left" },
            { id: "right", label: "Right" },
          ].map((opt) => {
            const active = side === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSide(opt.id)}
                className={`px-2.5 py-1 transition-colors duration-150 ease-standard ${
                  active ? "bg-brand text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-caption text-zinc-400">
        Higher line = stiffer test result. Bars = days flagged tight in the
        driver muscles ({driverLabels.join(", ") || "—"}) over the last{" "}
        {windowDays} days.
      </p>

      {series.length === 0 ? (
        <p className="text-body text-zinc-400">
          No values logged for the {side} side of {activeTest} yet.
        </p>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid stroke={TOKEN.zincGrid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke={TOKEN.zincAxis}
                tick={{ fontSize: 11, fill: TOKEN.zincAxis }}
                tickFormatter={shortDate}
              />
              <YAxis
                yAxisId="value"
                orientation="left"
                stroke={TOKEN.brand}
                tick={{ fontSize: 11, fill: TOKEN.zincAxis }}
                label={{
                  value: "Test value",
                  angle: -90,
                  position: "insideLeft",
                  fill: TOKEN.zincAxis,
                  fontSize: 11,
                }}
              />
              <YAxis
                yAxisId="flagged"
                orientation="right"
                stroke={TOKEN.stateTight}
                tick={{ fontSize: 11, fill: TOKEN.zincAxis }}
                allowDecimals={false}
                label={{
                  value: "Driver flagged days",
                  angle: 90,
                  position: "insideRight",
                  fill: TOKEN.zincAxis,
                  fontSize: 11,
                }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={shortDate}
                formatter={(value, name) =>
                  name === "value"
                    ? [value, "Test value"]
                    : [value, "Driver flagged days"]
                }
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: TOKEN.zincAxis }}
                formatter={(name) =>
                  name === "value" ? "Test value" : "Driver flagged days"
                }
              />
              <Bar
                yAxisId="flagged"
                dataKey="flagged"
                fill={TOKEN.stateTight}
                opacity={0.7}
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="value"
                type="monotone"
                dataKey="value"
                stroke={TOKEN.brand}
                strokeWidth={2}
                dot={{ r: 2, fill: TOKEN.brand }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Router default export — mirrors the TrendCharts.jsx shape.

export default function BelowFoldCharts(props) {
  if (props.mode === "flip-frequency") {
    return (
      <FlipFrequencyChart
        stateChanges={props.stateChanges}
        windowDays={props.windowDays}
        now={props.now}
      />
    );
  }
  if (props.mode === "recovery-trend") {
    return <RecoveryRateTrendChart stateChanges={props.stateChanges} now={props.now} />;
  }
  if (props.mode === "assessment-correlation") {
    return (
      <AssessmentCorrelationChart
        assessments={props.assessments}
        stateChanges={props.stateChanges}
        drivers={props.drivers}
        now={props.now}
        windowDays={props.windowDays}
      />
    );
  }
  return null;
}
