// Stage 02-B / F5 — GoalsPanel.
// Spec: stages/02-tracking-metrics/output/plan.md §3.3 (goal vocabulary) +
//       §4 F5 (data model + GoalsPanel + goal-progress wiring).
//
// Surfaces the user's persisted v3 `goals[]` (BodyMapApp owns the React
// state; the wiring here is read-from + add/update/archive callbacks). Each
// row pulls its baseline / current / target / progressPct / onTrack from
// M8 (`goalProgress`) so the bar reflects live stateChanges + adherence
// data. The four supported `kind` values mirror the spec exactly:
//
//   reduce-flagged-days  — pick a muscle (or base ID), target = max
//                          acceptable flagged days inside `targetWindowDays`.
//                          Baseline auto-derived from the last 14d of M1.
//   improve-symmetry     — pick a base ID with a current imbalance; target =
//                          composite asymmetry score to drop below.
//   hit-adherence        — target weekly adherence % (0..100). Reads M7.
//   freeform             — text-only goal. M8 returns `progressPct: null`,
//                          we render a "tracking by hand" chip instead of
//                          a bar.
//
// Tokens-only styling. No new metrics added — F5 composes M8 from the
// existing `src/metrics` barrel.

import { useMemo, useState } from "react";
import { Plus, Pencil, Archive, Sparkles, X } from "lucide-react";
import {
  goalProgress,
  stateDaysFlagged,
  stateDaysFlaggedAll,
  symmetryIndex,
  adherenceRate as computeAdherenceRate,
} from "./metrics";
import {
  MUSCLES,
  SUB_MUSCLES,
  getMuscleLabel,
  migrateLegacyId,
} from "./muscle-data";

// ---------------------------------------------------------------------------
// helpers

function newGoalId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `g_${crypto.randomUUID()}`;
  }
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const KIND_META = {
  "reduce-flagged-days": {
    label: "Reduce flagged days",
    summary: "Cut the number of days a muscle reads tight or weak.",
    metricId: "M1",
    direction: "lower",
    valueLabel: "Target flagged days in window",
    valueHelp: "Lower is better. Baseline below is the last 14d.",
  },
  "improve-symmetry": {
    label: "Improve symmetry",
    summary: "Bring left and right closer together over time.",
    metricId: "M3",
    direction: "lower",
    valueLabel: "Target composite asymmetry (0–100)",
    valueHelp: "Lower is better. 0 is perfect symmetry.",
  },
  "hit-adherence": {
    label: "Hit weekly adherence",
    summary: "Stay on top of your suggested remedies each week.",
    metricId: "M7",
    direction: "higher",
    valueLabel: "Target weekly adherence (0–100%)",
    valueHelp: "Higher is better. Reads from your planner check-offs.",
  },
  freeform: {
    label: "Freeform",
    summary: "Track a goal by hand. No automatic progress bar.",
    metricId: null,
    direction: "neither",
    valueLabel: null,
    valueHelp: null,
  },
};

// Build a bilateral muscle option list (parent + sub muscles, both sides).
function useMuscleOptions() {
  return useMemo(() => {
    const out = [];
    for (const m of MUSCLES) {
      if (!m.id || !m.side) continue;
      out.push({ id: m.id, label: m.label });
    }
    for (const [, subs] of Object.entries(SUB_MUSCLES)) {
      for (const sub of subs) {
        for (const side of ["l", "r"]) {
          const id = `${sub.id}-${side}`;
          out.push({
            id,
            label: `${sub.label} (${side === "l" ? "L" : "R"})`,
          });
        }
      }
    }
    out.sort((a, b) => a.label.localeCompare(b.label));
    return out;
  }, []);
}

function fmtPct(x) {
  if (x == null || !Number.isFinite(x)) return "—";
  return `${Math.round(x * 100)}%`;
}

function fmtNumber(x) {
  if (x == null || !Number.isFinite(x)) return "—";
  if (Math.abs(x) < 1) return x.toFixed(2);
  return Math.round(x * 10) / 10;
}

function summarizeGoal(goal) {
  const meta = KIND_META[goal.kind] || KIND_META.freeform;
  if (goal.kind === "freeform") {
    return goal.label || goal.notes || "Freeform goal";
  }
  if (goal.kind === "hit-adherence") {
    const target = Number.isFinite(goal.targetValue)
      ? `${Math.round(goal.targetValue * 100)}%`
      : "—";
    return `${meta.label}: ${target} weekly`;
  }
  if (goal.kind === "improve-symmetry") {
    return `${meta.label}: composite ≤ ${fmtNumber(goal.targetValue)}`;
  }
  if (goal.kind === "reduce-flagged-days") {
    const muscle = goal.targetMuscleId ? getMuscleLabel(goal.targetMuscleId) : "muscle";
    return `${meta.label}: ${muscle} ≤ ${fmtNumber(goal.targetValue)} flagged days`;
  }
  return meta.label;
}

// ---------------------------------------------------------------------------
// progress chip + bar

function OnTrackChip({ onTrack, status }) {
  if (status === "achieved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-state-balanced/50 bg-state-balanced/10 px-2 py-0.5 text-caption text-state-balanced">
        <Sparkles size={12} aria-hidden="true" /> Achieved
      </span>
    );
  }
  if (onTrack === null || onTrack === undefined) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-caption text-zinc-400">
        Tracking by hand
      </span>
    );
  }
  if (onTrack) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-state-balanced/50 bg-state-balanced/10 px-2 py-0.5 text-caption text-state-balanced">
        On track
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-state-tight/50 bg-state-tight/10 px-2 py-0.5 text-caption text-state-tight">
      Behind pace
    </span>
  );
}

function ProgressBar({ pct }) {
  const safe = pct == null || !Number.isFinite(pct) ? null : Math.max(0, Math.min(1, pct));
  if (safe == null) {
    return (
      <div
        aria-hidden="true"
        className="h-1.5 w-full rounded-full bg-zinc-800"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
    >
      <div
        className="h-full rounded-full bg-brand transition-[width] duration-400 ease-standard"
        style={{ width: `${Math.round(safe * 100)}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create / edit modal

const DEFAULT_FORM = {
  kind: "reduce-flagged-days",
  targetMuscleId: "",
  targetValue: "",
  targetWindowDays: 14,
  label: "",
  notes: "",
};

function GoalEditor({
  initial,
  stateChanges,
  adherence,
  now,
  muscleOptions,
  imbalanceOptions,
  onCancel,
  onSubmit,
}) {
  const isEdit = Boolean(initial && initial.id);
  const [form, setForm] = useState(() => {
    if (!initial) return { ...DEFAULT_FORM };
    return {
      kind: initial.kind || "freeform",
      targetMuscleId: initial.targetMuscleId || "",
      targetValue:
        initial.targetValue == null
          ? ""
          : initial.kind === "hit-adherence"
            ? Math.round(initial.targetValue * 100).toString()
            : String(initial.targetValue),
      targetWindowDays: initial.targetWindowDays || 14,
      label: initial.label || "",
      notes: initial.notes || "",
    };
  });

  const meta = KIND_META[form.kind] || KIND_META.freeform;

  // Live baseline preview so the user sees how M8 will read the goal at
  // submission time. Recomputed cheaply on each render — pure metric calls.
  const baselinePreview = useMemo(() => {
    if (form.kind === "reduce-flagged-days" && form.targetMuscleId) {
      const r = stateDaysFlagged({
        stateChanges,
        muscleId: form.targetMuscleId,
        now,
        windowDays: 14,
      });
      return { label: "Last 14d flagged", value: `${r.flaggedDays} days` };
    }
    if (form.kind === "improve-symmetry") {
      const r = symmetryIndex({ stateChanges, now, windowDays: 30, trendDays: 1 });
      return { label: "Current composite", value: fmtNumber(r.composite) };
    }
    if (form.kind === "hit-adherence") {
      const r = computeAdherenceRate({ adherence, now, windowDays: 7 });
      return {
        label: "Last 7d adherence",
        value: r.suggested > 0 ? fmtPct(r.adherenceRate) : "no remedies yet",
      };
    }
    return null;
  }, [form.kind, form.targetMuscleId, stateChanges, adherence, now]);

  const submit = (e) => {
    e.preventDefault();
    const id = isEdit ? initial.id : newGoalId();
    const createdAt = isEdit ? initial.createdAt : new Date().toISOString();
    let targetValue = null;
    if (form.kind === "hit-adherence") {
      const v = parseFloat(form.targetValue);
      targetValue = Number.isFinite(v) ? Math.max(0, Math.min(1, v / 100)) : 0.7;
    } else if (form.kind === "freeform") {
      targetValue = null;
    } else {
      const v = parseFloat(form.targetValue);
      targetValue = Number.isFinite(v) ? v : 0;
    }
    onSubmit({
      id,
      createdAt,
      kind: form.kind,
      targetMuscleId:
        form.kind === "reduce-flagged-days"
          ? migrateLegacyId(form.targetMuscleId || "") || null
          : null,
      targetValue,
      targetWindowDays: Number(form.targetWindowDays) || 14,
      status: initial?.status || "active",
      label: form.label.trim() || null,
      notes: form.notes.trim(),
    });
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-14 border border-zinc-800 bg-zinc-950/70 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-caption uppercase tracking-wide text-zinc-400">
          {isEdit ? "Edit goal" : "New goal"}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-caption text-zinc-400 hover:border-zinc-700"
          aria-label="Cancel"
        >
          <X size={12} aria-hidden="true" />
          Cancel
        </button>
      </div>

      <label className="block">
        <span className="text-caption text-zinc-300">Goal type</span>
        <select
          className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
          value={form.kind}
          onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}
        >
          {Object.entries(KIND_META).map(([id, m]) => (
            <option key={id} value={id}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-caption text-zinc-500">{meta.summary}</p>
      </label>

      {form.kind === "reduce-flagged-days" ? (
        <label className="block">
          <span className="text-caption text-zinc-300">Muscle</span>
          <select
            className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
            value={form.targetMuscleId}
            onChange={(e) =>
              setForm((p) => ({ ...p, targetMuscleId: e.target.value }))
            }
            required
          >
            <option value="">Pick a muscle…</option>
            {muscleOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {form.kind === "improve-symmetry" && imbalanceOptions.length > 0 ? (
        <p className="rounded-10 border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-caption text-zinc-400">
          Most uneven base IDs right now:{" "}
          {imbalanceOptions
            .slice(0, 3)
            .map((o) => `${getMuscleLabel(`${o.baseId}-l`).replace(" (L)", "")} (${o.delta}d)`)
            .join(" · ")}
        </p>
      ) : null}

      {meta.valueLabel ? (
        <label className="block">
          <span className="text-caption text-zinc-300">{meta.valueLabel}</span>
          <input
            type="number"
            step="any"
            className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
            value={form.targetValue}
            onChange={(e) =>
              setForm((p) => ({ ...p, targetValue: e.target.value }))
            }
            placeholder={
              form.kind === "hit-adherence"
                ? "e.g. 70"
                : form.kind === "improve-symmetry"
                  ? "e.g. 25"
                  : "e.g. 3"
            }
            required
          />
          {meta.valueHelp ? (
            <p className="mt-1 text-caption text-zinc-500">{meta.valueHelp}</p>
          ) : null}
        </label>
      ) : null}

      {form.kind !== "freeform" ? (
        <label className="block">
          <span className="text-caption text-zinc-300">Window (days)</span>
          <select
            className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
            value={form.targetWindowDays}
            onChange={(e) =>
              setForm((p) => ({ ...p, targetWindowDays: Number(e.target.value) }))
            }
          >
            {[7, 14, 30, 60, 90].map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {form.kind === "freeform" ? (
        <label className="block">
          <span className="text-caption text-zinc-300">Title</span>
          <input
            type="text"
            className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            placeholder="What are you working toward?"
            required
          />
        </label>
      ) : null}

      <label className="block">
        <span className="text-caption text-zinc-300">Notes (optional)</span>
        <textarea
          className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
          rows={2}
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Why this goal? Anything that will keep you anchored."
        />
      </label>

      {baselinePreview ? (
        <p className="rounded-10 border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-caption text-zinc-400">
          <span className="text-zinc-300">{baselinePreview.label}:</span>{" "}
          {baselinePreview.value}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-caption text-zinc-200 hover:border-zinc-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-10 bg-brand px-3 py-1.5 text-caption font-semibold text-zinc-950 transition-colors duration-150 ease-standard hover:bg-brand-hover"
        >
          {isEdit ? "Save changes" : "Add goal"}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Goal row

function GoalRow({ goal, progress, onEdit, onArchive }) {
  const meta = KIND_META[goal.kind] || KIND_META.freeform;
  const baseline = progress?.baseline;
  const current = progress?.current;
  const target = progress?.target;
  const status = progress?.status || goal.status || "active";
  const isFreeform = goal.kind === "freeform";

  let baselineLabel = "—";
  let currentLabel = "—";
  let targetLabel = "—";
  if (goal.kind === "hit-adherence") {
    baselineLabel = fmtPct(baseline);
    currentLabel = fmtPct(current);
    targetLabel = fmtPct(target);
  } else if (!isFreeform) {
    baselineLabel = fmtNumber(baseline);
    currentLabel = fmtNumber(current);
    targetLabel = fmtNumber(target);
  }

  return (
    <li className="space-y-3 rounded-10 border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-body-lg text-zinc-100">{summarizeGoal(goal)}</p>
          <p className="mt-0.5 text-caption text-zinc-500">
            {meta.metricId ? `${meta.metricId} · ` : ""}
            {goal.targetWindowDays} day window
            {goal.notes ? ` · ${goal.notes}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <OnTrackChip onTrack={progress?.onTrack ?? null} status={status} />
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="rounded-full border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
            aria-label="Edit goal"
          >
            <Pencil size={12} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onArchive(goal.id)}
            className="rounded-full border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
            aria-label="Archive goal"
          >
            <Archive size={12} aria-hidden="true" />
          </button>
        </div>
      </div>

      <ProgressBar pct={progress?.progressPct ?? null} />

      {!isFreeform ? (
        <dl className="grid grid-cols-3 gap-2 text-caption text-zinc-400">
          <div>
            <dt className="uppercase tracking-wide text-zinc-500">Baseline</dt>
            <dd className="text-body text-zinc-200 tabular-nums">{baselineLabel}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide text-zinc-500">Current</dt>
            <dd className="text-body text-zinc-200 tabular-nums">{currentLabel}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide text-zinc-500">Target</dt>
            <dd className="text-body text-zinc-200 tabular-nums">{targetLabel}</dd>
          </div>
        </dl>
      ) : null}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Top-level panel

export default function GoalsPanel({
  goals = [],
  stateChanges = [],
  adherence = [],
  onAddGoal,
  onUpdateGoal,
  onArchiveGoal,
  readOnly = false,
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Captured once per render (not memoized — it's just a Date construction,
  // and every metric below should see the same wall clock within a render).
  const now = new Date();
  const muscleOptions = useMuscleOptions();

  // `now` is a fresh Date every render, so a useMemo keyed on it would never
  // hit its cache — compute these directly instead of paying for the wrapper.
  const flagged = stateDaysFlaggedAll({ stateChanges, now, windowDays: 30 });
  const imbalanceOptions = Object.values(flagged.byBaseId)
    .map((b) => ({
      baseId: b.baseId,
      delta: Math.abs((b.flaggedDays_l || 0) - (b.flaggedDays_r || 0)),
    }))
    .filter((b) => b.delta > 0)
    .sort((a, b) => b.delta - a.delta);

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status !== "archived"),
    [goals],
  );

  const progressById = {};
  const progressRows = goalProgress({
    goals: activeGoals,
    stateChanges,
    adherence,
    now,
  });
  for (const r of progressRows) progressById[r.goalId] = r;

  const handleSubmit = (goal) => {
    if (editing && editing.id) {
      onUpdateGoal?.(editing.id, goal);
    } else {
      onAddGoal?.(goal);
    }
    setEditorOpen(false);
    setEditing(null);
  };

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setEditorOpen(true);
  };

  return (
    <article
      id="dot-goals-panel"
      aria-label="Your goals"
      className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-4"
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-caption uppercase tracking-wide text-zinc-400">
            Your goals
          </p>
          <p className="mt-0.5 text-caption text-zinc-500">
            Educational only — these targets are working hypotheses, not
            prescriptions.
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1 rounded-10 border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-caption text-brand hover:border-brand"
          >
            <Plus size={14} aria-hidden="true" />
            New goal
          </button>
        ) : null}
      </header>

      {activeGoals.length === 0 ? (
        <p className="mt-4 text-body text-zinc-300">
          No active goals yet. {readOnly ? "Add one on the Plan tab." : "Add one to start tracking progress."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {activeGoals.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              progress={progressById[goal.id] || null}
              onEdit={readOnly ? () => {} : openEdit}
              onArchive={readOnly ? () => {} : onArchiveGoal || (() => {})}
            />
          ))}
        </ul>
      )}

      {!readOnly && editorOpen ? (
        <div className="mt-4">
          <GoalEditor
            initial={editing}
            stateChanges={stateChanges}
            adherence={adherence}
            now={now}
            muscleOptions={muscleOptions}
            imbalanceOptions={imbalanceOptions}
            onCancel={() => {
              setEditorOpen(false);
              setEditing(null);
            }}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </article>
  );
}
