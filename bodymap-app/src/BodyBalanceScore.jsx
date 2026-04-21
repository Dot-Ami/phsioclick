// Stage 02-A.5 / U3 — BodyBalanceScore component.
// Hero number on the Today screen: a derived 0–100 score with tier label,
// gradient bar, trend marker, and breakdown chip row.
//
// Spec: stages/02a-ux-foundation/output/gamification-spec.md §1
// Tokens: stages/02a-ux-foundation/output/design-tokens.md §1.4
//
// Stage 02 metrics (M3/M4/M6/M7) are not implemented yet, so cold-start
// callers pass `components: null` to render the "Calibrating" path. When
// Stage 02-B lands the real components will flow in unchanged.

import { Gauge } from "lucide-react";

// Tier table mirrors gamification-spec.md §1 "Tier labels".
const TIERS = [
  {
    id: "recovering",
    label: "Recovering",
    min: 0,
    max: 39,
    color: "#818cf8",
    subtitle: "You're working on it. Small wins compound.",
  },
  {
    id: "building",
    label: "Building",
    min: 40,
    max: 59,
    color: "#5e9fc6",
    subtitle: "Things are moving. Keep showing up.",
  },
  {
    id: "balanced",
    label: "Balanced",
    min: 60,
    max: 79,
    color: "#14b8a6",
    subtitle: "You're in a good place. Maintain and refine.",
  },
  {
    id: "resilient",
    label: "Resilient",
    min: 80,
    max: 100,
    color: "#5eead4",
    subtitle: "Strong, balanced, and consistent. Outstanding.",
  },
];

const COLD_START = {
  label: "Calibrating",
  color: "#71717a",
  subtitle:
    "Your score will fine-tune as you flag muscles, complete remedies, and run assessments.",
};

function tierFor(score) {
  return TIERS.find((tier) => score >= tier.min && score <= tier.max) || TIERS[0];
}

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

export default function BodyBalanceScore({
  components = null,
  trend = null,
  onSelectBreakdown,
}) {
  // Cold-start path: no Stage 02 metrics yet -> 50 + "Calibrating", no tier badge.
  const isColdStart = components === null;

  const score = isColdStart
    ? 50
    : Math.round(
        0.4 * components.symmetry +
          0.3 * components.tightness +
          0.2 * components.recovery +
          0.1 * components.adherence,
      );
  const tier = isColdStart ? COLD_START : tierFor(score);
  const markerPct = clamp(0, 100, score);

  const trendLabel = (() => {
    if (trend === null || trend === undefined) return "—";
    if (trend > 0) return `+${trend} since last week`;
    if (trend < 0) return `${trend} since last week`;
    return "No change since last week";
  })();
  const trendClass =
    trend === null || trend === undefined
      ? "text-zinc-500"
      : trend > 0
      ? "text-state-balanced"
      : trend < 0
      ? "text-zinc-400"
      : "text-zinc-500";

  const chips = isColdStart
    ? [
        { id: "symmetry", label: "Symmetry", value: "—" },
        { id: "tightness", label: "Tightness", value: "—" },
        { id: "recovery", label: "Recovery", value: "—" },
        { id: "adherence", label: "Adherence", value: "—" },
      ]
    : [
        { id: "symmetry", label: "Symmetry", value: Math.round(components.symmetry) },
        { id: "tightness", label: "Tightness", value: Math.round(components.tightness) },
        { id: "recovery", label: "Recovery", value: Math.round(components.recovery) },
        { id: "adherence", label: "Adherence", value: Math.round(components.adherence) },
      ];

  return (
    <article
      aria-label="Body Balance Score"
      className="rounded-14 border border-zinc-800 bg-zinc-900/80 p-5 shadow-elev-1"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-zinc-400">
            <Gauge size={14} aria-hidden="true" />
            Body Balance Score
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span
              className="text-display tabular-nums text-zinc-100"
              aria-live="polite"
            >
              {score}
            </span>
            <span
              className="rounded-full border px-2 py-0.5 text-caption"
              style={{
                color: tier.color,
                borderColor: `${tier.color}66`,
                backgroundColor: `${tier.color}1f`,
              }}
            >
              {tier.label}
            </span>
          </div>
        </div>
        <span className={`text-caption tabular-nums ${trendClass}`}>{trendLabel}</span>
      </header>

      <div className="mt-4">
        <div
          className="relative h-2 w-full overflow-hidden rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #818cf8 0%, #5e9fc6 40%, #14b8a6 60%, #5eead4 100%)",
          }}
          role="img"
          aria-label={`Score gradient with marker at ${score}`}
        >
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zinc-950 bg-zinc-100 shadow-elev-1"
            style={{ left: `${markerPct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-zinc-500">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <p className="mt-3 text-body text-zinc-300">{tier.subtitle}</p>

      <div className="mt-4 flex flex-wrap gap-2" role="list" aria-label="Score breakdown">
        {chips.map((chip) => {
          const interactive = !isColdStart && typeof onSelectBreakdown === "function";
          const ChipTag = interactive ? "button" : "span";
          const chipProps = interactive
            ? {
                type: "button",
                onClick: () => onSelectBreakdown(chip.id),
              }
            : {};
          return (
            <ChipTag
              key={chip.id}
              role="listitem"
              className={`flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-caption text-zinc-300 ${
                interactive ? "hover:border-zinc-700 hover:text-zinc-100" : ""
              }`}
              {...chipProps}
            >
              <span className="text-zinc-500">{chip.label}</span>
              <span className="tabular-nums text-zinc-200">{chip.value}</span>
            </ChipTag>
          );
        })}
      </div>
    </article>
  );
}
