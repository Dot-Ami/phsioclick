// Stage 02-A.5 / U6 — SupportingCardsRow.
// The three above-the-fold supporting cards on the Progress screen.
// Spec: stages/02a-ux-foundation/output/screens.md "Progress screen" +
//       stages/02-tracking-metrics/output/plan.md §2 metric catalog.
//
// Stage 02-B / F3 lit the tightness (M4) and recovery (M6) cards: they now
// receive the live shapes from `src/metrics/load.js` and
// `src/metrics/recovery.js`. The adherence (M7) card stays on the
// cold-start path until Stage 02-B / F6 ships the planner remedy
// checkboxes that write `adherence[]` rows. Each card still falls back to
// the "Calibrating" framing when its prop is null, so the row matches
// BodyBalanceScore + SymmetryTrendHero on a fresh install.
//
// Slot contracts (stable across cold-start / live swap):
//
//   tightnessLoad  → M4. Shape: { tightnessLoad, weaknessLoad,
//                    normalizedTightness, normalizedWeakness, windowDays }
//                    Card surfaces `tightnessLoad` as the headline and
//                    `weaknessLoad` as the secondary line.
//
//   recoveryRate   → M6. Shape: { totalFlags, recovered, pending,
//                    stillFlagged, recoveryRate, recoveryWindowDays }
//                    Card surfaces `recoveryRate` as a percentage and
//                    "<recovered> of <totalFlags> resolved in
//                    <recoveryWindowDays> days" as the secondary line.
//
//   adherenceRate  → M7 (cold-start until F6). Shape: { weekStart,
//                    suggested, done, skipped, adherenceRate }. F6 will
//                    populate `adherence[]` and ProgressScreen will pass
//                    the live shape with no edits to this card.
//
// All three cards share the same window selector with the hero. ProgressScreen
// owns `windowDays` and forwards it here so the row never disagrees with the
// trend.

import { useMemo } from "react";
import { CheckCircle2, Flame, RefreshCcw } from "lucide-react";

function formatPct(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

function formatCount(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString();
}

function MiniBar({ value, max = 1, label }) {
  // Simple bar: width is value/max clamped to [0, 1]. When value is null we
  // render a muted placeholder bar so the row keeps a steady height between
  // cold-start and live data.
  const safe =
    value === null || value === undefined || Number.isNaN(value)
      ? null
      : Math.max(0, Math.min(1, value / Math.max(1e-6, max)));
  return (
    <div
      role="img"
      aria-label={label}
      className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
    >
      {safe === null ? (
        <span aria-hidden="true" className="block h-full w-1/3 rounded-full bg-zinc-700" />
      ) : (
        <span
          aria-hidden="true"
          className="block h-full rounded-full bg-brand transition-[width] duration-200 ease-standard"
          style={{ width: `${safe * 100}%` }}
        />
      )}
    </div>
  );
}

function SupportingCard({
  Icon,
  label,
  metricId,
  headline,
  secondary,
  bar,
  isColdStart,
}) {
  return (
    <article
      aria-label={label}
      className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-4"
    >
      <header className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-zinc-400">
          <Icon size={14} aria-hidden="true" />
          {label}
        </p>
        <span
          className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-micro tracking-wide text-zinc-500"
          title={`Stage 02 metric ${metricId}`}
        >
          {metricId}
        </span>
      </header>
      <p
        className={`mt-2 text-h1 tabular-nums ${
          isColdStart ? "text-zinc-500" : "text-zinc-100"
        }`}
        aria-live="polite"
      >
        {headline}
      </p>
      <p className="mt-1 text-caption text-zinc-400">{secondary}</p>
      {bar}
    </article>
  );
}

export default function SupportingCardsRow({
  tightnessLoad = null,
  recoveryRate = null,
  adherenceRate = null,
  windowDays = 30,
}) {
  // Tightness load (M4)
  const tightCard = useMemo(() => {
    const isColdStart = tightnessLoad === null;
    const headline = isColdStart
      ? "—"
      : `${formatCount(tightnessLoad.tightnessLoad)} day-units`;
    const secondary = isColdStart
      ? `Calibrating — sum of tight-days across the body, last ${windowDays} days.`
      : `${formatCount(tightnessLoad.weaknessLoad)} weak day-units · last ${tightnessLoad.windowDays || windowDays} days`;
    return { isColdStart, headline, secondary };
  }, [tightnessLoad, windowDays]);

  // Recovery rate (M6)
  const recoveryCard = useMemo(() => {
    const isColdStart = recoveryRate === null;
    const headline = isColdStart ? "—" : formatPct(recoveryRate.recoveryRate);
    const secondary = isColdStart
      ? `Calibrating — share of flags returning to normal within 14 days.`
      : `${formatCount(recoveryRate.recovered)} of ${formatCount(recoveryRate.totalFlags)} resolved in ${recoveryRate.recoveryWindowDays || 14} days`;
    return { isColdStart, headline, secondary };
  }, [recoveryRate]);

  // Adherence rate (M7)
  const adherenceCard = useMemo(() => {
    const isColdStart = adherenceRate === null;
    const headline = isColdStart ? "—" : formatPct(adherenceRate.adherenceRate);
    const secondary = isColdStart
      ? `Calibrating — share of suggested remedies you've checked off this week.`
      : `${formatCount(adherenceRate.done)} of ${formatCount(adherenceRate.suggested)} this week`;
    return { isColdStart, headline, secondary };
  }, [adherenceRate]);

  return (
    <div
      role="list"
      aria-label="Supporting metrics"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <div role="listitem">
        <SupportingCard
          Icon={Flame}
          label="Tightness load"
          metricId="M4"
          headline={tightCard.headline}
          secondary={tightCard.secondary}
          isColdStart={tightCard.isColdStart}
          bar={
            <MiniBar
              value={
                tightnessLoad === null
                  ? null
                  : tightnessLoad.normalizedTightness ?? null
              }
              max={1}
              label="Tightness load"
            />
          }
        />
      </div>
      <div role="listitem">
        <SupportingCard
          Icon={RefreshCcw}
          label="Recovery rate"
          metricId="M6"
          headline={recoveryCard.headline}
          secondary={recoveryCard.secondary}
          isColdStart={recoveryCard.isColdStart}
          bar={
            <MiniBar
              value={recoveryRate === null ? null : recoveryRate.recoveryRate}
              max={1}
              label="Recovery rate"
            />
          }
        />
      </div>
      <div role="listitem">
        <SupportingCard
          Icon={CheckCircle2}
          label="Adherence rate"
          metricId="M7"
          headline={adherenceCard.headline}
          secondary={adherenceCard.secondary}
          isColdStart={adherenceCard.isColdStart}
          bar={
            <MiniBar
              value={adherenceRate === null ? null : adherenceRate.adherenceRate}
              max={1}
              label="Adherence rate"
            />
          }
        />
      </div>
    </div>
  );
}
