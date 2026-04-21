// Stage 02-A.5 / U6 — BelowFoldAccordion for the Progress screen.
// Spec: stages/02a-ux-foundation/output/screens.md "Progress screen" — the
// fold-below stack of every other Stage 02 metric widget.
//
// Default-collapsed accordion of named slots. The slot contract is documented
// inline (in this file) and the parent ProgressScreen passes the slot content
// as props. Callers can pass `null` to keep a slot in its cold-start state.
//
// Slot ownership (current as of Stage 02-B / F3):
//
//   hotRegions          → M5 from `src/metrics/hotRegions.js`. ✅ wired in F3.
//                         Shape: [{ baseId, label, flaggedDays, dominantState }]
//
//   flipFrequency       → M2 from `src/metrics/stateHistory.js`. ✅ wired in F7.
//                         Top-10 bar chart with bilateral split (left /
//                         right / combined). Respects parent windowDays.
//                         Shape: [{ muscleId, flipCount, flipsPerWeek }]
//
//   recoveryTrend       → M6 from `src/metrics/recovery.js`. ✅ wired in F7.
//                         90d rolling recovery rate, one point per week.
//                         Empty-state when stateChanges spans < 7 days.
//
//   assessmentTrends    → ✅ wired in F8. Existing per-session line stays;
//                         the dual-axis assessment-to-state correlation
//                         chart (M9 + `data/assessment-drivers.js`) sits
//                         below it inside the same slot.
//
//   stateChangeTimeline → ✅ wired in F3. Per-day count of v3 stateChanges
//                         flips, split into "into flagged" vs "returned to
//                         normal." Renders inline in ProgressScreen as a
//                         tiny stacked-bar SVG (no Recharts dependency).
//
//   patterns            → existing-data widget — the rule-based pattern
//                         detector + dominant compensation chains derived
//                         from `entries[]`. No Stage 02-B swap planned.
//
//   history             → existing-data widget — the filtered entries list
//                         (filters + heat map). Stage 02-B will move the
//                         heat map onto stateChanges-aware coloring.

import { useId } from "react";
import { ChevronDown } from "lucide-react";

function slotEmptyCopy(slot) {
  switch (slot.kind) {
    case "metric":
      return `${slot.label} appears here once Stage 02-B wires up ${slot.metricId}.`;
    case "existing":
      return `Nothing to show yet. ${slot.label} populates as you log activity.`;
    default:
      return "Nothing to show yet.";
  }
}

function Slot({ slot, content }) {
  const id = useId();
  const headingId = `accordion-${id}-heading`;
  const panelId = `accordion-${id}-panel`;
  return (
    <details className="group rounded-10 border border-zinc-800 bg-zinc-950/40 transition-colors duration-150 ease-out open:border-zinc-700 open:bg-zinc-950/70">
      <summary
        id={headingId}
        aria-controls={panelId}
        className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 text-body text-zinc-200 hover:bg-zinc-900/40"
      >
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="text-zinc-500 transition-transform duration-150 ease-out group-open:rotate-180"
        />
        <div className="min-w-0 flex-1">
          <p className="text-body-lg text-zinc-100">{slot.label}</p>
          {slot.summary ? (
            <p className="mt-0.5 text-caption text-zinc-500">{slot.summary}</p>
          ) : null}
        </div>
        {slot.metricId ? (
          <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-micro tracking-wide text-zinc-500">
            {slot.metricId}
          </span>
        ) : null}
      </summary>
      <div id={panelId} role="region" aria-labelledby={headingId} className="border-t border-zinc-800 px-3 py-3">
        {content ? (
          content
        ) : (
          <p className="text-body text-zinc-400">{slotEmptyCopy(slot)}</p>
        )}
      </div>
    </details>
  );
}

const DEFAULT_SLOTS = [
  {
    id: "hotRegions",
    kind: "metric",
    metricId: "M5",
    label: "Hot regions",
    summary: "Top base IDs by flagged days in the last week.",
  },
  {
    id: "flipFrequency",
    kind: "metric",
    metricId: "M2",
    label: "Flip frequency",
    summary: "How often each muscle has changed state.",
  },
  {
    id: "recoveryTrend",
    kind: "metric",
    metricId: "M6",
    label: "Recovery rate trend",
    summary: "Rolling 14-day recovery share, sampled weekly across the last 90 days.",
  },
  {
    id: "assessmentTrends",
    kind: "existing",
    metricId: null,
    label: "Assessment trends",
    summary: "Bilateral test averages per session — your existing assessment data.",
  },
  {
    id: "stateChangeTimeline",
    kind: "metric",
    metricId: null,
    label: "State-change timeline",
    summary: "Per-day count of flips into and out of flagged states.",
  },
  {
    id: "patterns",
    kind: "existing",
    metricId: null,
    label: "Patterns",
    summary: "Rule-based pattern detector + dominant compensation chains.",
  },
  {
    id: "history",
    kind: "existing",
    metricId: null,
    label: "History",
    summary: "All your logged entries with filters and the weighted heat map.",
  },
];

export default function BelowFoldAccordion({ slotContent = {} }) {
  return (
    <section
      aria-labelledby="below-fold-title"
      className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-4"
    >
      <header className="flex items-center justify-between gap-2">
        <h3
          id="below-fold-title"
          className="text-caption uppercase tracking-wide text-zinc-400"
        >
          More signals
        </h3>
        <p className="text-caption text-zinc-500">Tap to open</p>
      </header>
      <p className="mt-1 text-caption text-zinc-500">
        Default-collapsed. Open what you want — these widgets fold open without
        pulling focus from the hero.
      </p>
      <div className="mt-3 space-y-2">
        {DEFAULT_SLOTS.map((slot) => (
          <Slot key={slot.id} slot={slot} content={slotContent[slot.id] || null} />
        ))}
      </div>
    </section>
  );
}
