// Stage 02-A.5 / U4 — Body screen.
// Job: "Show me + teach me."
// Spec: stages/02a-ux-foundation/output/screens.md "Body screen".
//
// Layout:
//   - Front/Back toggle on the top right.
//   - Full-bleed atlas with state heat (tight=amber, weak=indigo, balanced=teal).
//   - Tapping a muscle opens MuscleSlideOut.
//   - Below the fold: legend + region overview (most flagged / most balanced /
//     untouched count).
//
// State heat is derived from the parent-supplied muscleStates map. The legacy
// origin/sensation log inputs are no longer surfaced here; logging now lives
// inside the slide-out's Log sub-tab.

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import MuscleAtlas from "./MuscleAtlas";
import MuscleSlideOut from "./MuscleSlideOut";
import { getMuscleLabel } from "./muscle-data";

const STATE_COLORS = {
  tight: "rgba(245, 158, 11, 0.55)",
  weak: "rgba(129, 140, 248, 0.55)",
  balanced: "rgba(94, 234, 212, 0.55)",
  normal: "rgba(94, 234, 212, 0.45)",
};

function buildStateColorMap(muscleStates) {
  const out = {};
  for (const [id, val] of Object.entries(muscleStates || {})) {
    if (!val?.state) continue;
    const color = STATE_COLORS[val.state];
    if (color) out[id] = color;
  }
  return out;
}

function deriveOverview(muscleStates) {
  const entries = Object.entries(muscleStates || {});
  if (entries.length === 0) return null;

  const tights = entries
    .filter(([, v]) => v?.state === "tight")
    .sort((a, b) => {
      const aTs = a[1]?.updatedAt ? new Date(a[1].updatedAt).getTime() : 0;
      const bTs = b[1]?.updatedAt ? new Date(b[1].updatedAt).getTime() : 0;
      return bTs - aTs;
    });

  const balanced = entries.filter(([, v]) => v?.state === "normal" || v?.state === "balanced");

  return {
    mostFlagged: tights[0] || null,
    mostBalanced: balanced[0] || null,
    flaggedCount: entries.filter(([, v]) => v?.state && v.state !== "normal" && v.state !== "balanced").length,
  };
}

export default function BodyScreen({
  muscleStates = {},
  onSetMuscleState,
  onSaveLog,
  goals = [],
  onOpenGoal,
  adherence = [],
  onAdherenceChange,
}) {
  const [view, setView] = useState("front");
  const [selected, setSelected] = useState(null);
  const [recruitmentTint, setRecruitmentTint] = useState(null);

  const stateColors = useMemo(() => buildStateColorMap(muscleStates), [muscleStates]);
  const overview = useMemo(() => deriveOverview(muscleStates), [muscleStates]);

  const closeSlideOut = () => setSelected(null);

  return (
    <section aria-labelledby="body-screen-title" className="space-y-3">
      <header className="flex items-center justify-between gap-3 px-1">
        <h2 id="body-screen-title" className="text-h2 text-zinc-100">
          Body
        </h2>
        <div
          className="inline-flex overflow-hidden rounded-full border border-zinc-800 bg-zinc-950 text-caption"
          role="tablist"
          aria-label="Atlas view"
        >
          {[
            { id: "front", label: "Front" },
            { id: "back", label: "Back" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={view === opt.id}
              onClick={() => setView(opt.id)}
              className={`px-3 py-1.5 transition-colors duration-150 ease-out ${
                view === opt.id
                  ? "bg-brand text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <div className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-2 sm:p-4">
        <MuscleAtlas
          view={view}
          onSelect={setSelected}
          stateColors={stateColors}
          recruitmentTint={recruitmentTint}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 px-1 text-caption text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: STATE_COLORS.tight }}
          />
          Tight
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: STATE_COLORS.weak }}
          />
          Weak
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: STATE_COLORS.balanced }}
          />
          Balanced
        </span>
        <span className="ml-auto text-zinc-500">
          Tap any muscle to learn what it does and mark how it feels.
        </span>
      </div>

      {overview ? (
        <article
          aria-label="Region overview"
          className="rounded-14 border border-zinc-800 bg-zinc-900/40 p-4"
        >
          <p className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-zinc-400">
            <Activity size={14} aria-hidden="true" />
            Region overview
          </p>
          <ul className="mt-2 space-y-1.5 text-body text-zinc-200">
            {overview.mostFlagged ? (
              <li>
                Most recently flagged tight:{" "}
                <button
                  type="button"
                  onClick={() => setSelected(overview.mostFlagged[0])}
                  className="text-brand hover:text-brand-hover"
                >
                  {getMuscleLabel(overview.mostFlagged[0])}
                </button>
              </li>
            ) : null}
            {overview.mostBalanced ? (
              <li>
                Most recently balanced:{" "}
                <span className="text-zinc-100">
                  {getMuscleLabel(overview.mostBalanced[0])}
                </span>
              </li>
            ) : null}
            <li className="text-zinc-400">
              {overview.flaggedCount} muscle{overview.flaggedCount === 1 ? "" : "s"}
              {" "}flagged this week.
            </li>
          </ul>
        </article>
      ) : null}

      <MuscleSlideOut
        muscleId={selected}
        open={Boolean(selected)}
        onClose={closeSlideOut}
        muscleStates={muscleStates}
        onSetState={onSetMuscleState}
        onSelectMuscle={setSelected}
        onSaveLog={onSaveLog}
        onRecruitmentChange={setRecruitmentTint}
        goals={goals}
        onOpenGoal={onOpenGoal}
        adherence={adherence}
        onAdherenceChange={onAdherenceChange}
      />
    </section>
  );
}
