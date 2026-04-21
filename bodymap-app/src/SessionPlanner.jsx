import { useState, useMemo, useEffect, useRef } from "react";
import { getMuscleLabel, fromMuscleId, SUB_MUSCLES, MUSCLES } from "./muscle-data";
import { getRemedies } from "./data/remedies";
import { getEdgesForMuscle } from "./data/relationship-edges";
import { MOVEMENTS } from "./data/movements";

const STATE_PRIORITY = { tight: 1, weak: 2 };

const TYPE_ORDER = { release: 0, stretch: 1, mobilize: 2, activate: 3, strengthen: 4 };

const WIZARD_STEPS = [
  { id: "goals", label: "Goals" },
  { id: "tight", label: "Tight areas" },
  { id: "weak", label: "Weak areas" },
  { id: "lifts", label: "Your lifts" },
];

const COMMON_TIGHT = [
  "upper-trap", "pec-minor", "pec-major", "iliopsoas", "rectus-femoris",
  "gastrocnemius", "levator-scapulae", "erector-spinae", "latissimus-dorsi",
  "subscapularis", "tfl", "biceps-femoris", "sternocleidomastoid", "soleus",
  "adductor-magnus", "adductor-longus", "quadratus-lumborum",
];

const COMMON_WEAK = [
  "glute-max", "glute-med", "glute-min", "lower-trap", "serratus-ant",
  "posterior-delt", "infraspinatus", "multifidus", "transverse-abdominis",
  "rectus-abdominis", "external-oblique", "vastus-medialis", "wrist-extensors",
];

const DAY_TEMPLATES = {
  mobility: { label: "Mobility / Recovery", sections: ["tight"] },
  upper: { label: "Upper Body", groups: ["chest", "deltoids", "trapezius", "biceps", "triceps", "upper-back", "forearm", "neck"] },
  lower: { label: "Lower Body", groups: ["quadriceps", "hamstring", "gluteal", "calves", "adductors", "tibialis", "hip-flexors"] },
  full: { label: "Full Body", groups: null },
};

function SymmetryView({ muscleStates }) {
  const asymmetries = useMemo(() => {
    const bySlug = {};
    for (const [id, val] of Object.entries(muscleStates)) {
      if (!val?.state || val.state === "normal") continue;
      const parsed = fromMuscleId(id);
      if (!parsed?.side) continue;
      const key = parsed.slug;
      if (!bySlug[key]) bySlug[key] = {};
      bySlug[key][parsed.side] = val.state;
    }
    const result = [];
    for (const [slug, sides] of Object.entries(bySlug)) {
      const l = sides.left || "normal";
      const r = sides.right || "normal";
      if (l !== r) result.push({ slug, left: l, right: r });
    }
    return result;
  }, [muscleStates]);

  if (asymmetries.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 text-center">
        <p className="text-xs text-zinc-500">No L/R asymmetries detected in your marked muscle states.</p>
      </div>
    );
  }

  const stateColor = (s) =>
    s === "tight" ? "text-rose-400" : s === "weak" ? "text-amber-400" : "text-zinc-500";
  const stateBg = (s) =>
    s === "tight" ? "bg-rose-500/20" : s === "weak" ? "bg-amber-500/20" : "bg-zinc-800/50";

  return (
    <div className="rounded-lg border border-violet-900/40 bg-violet-950/10 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-violet-400/80">
        L/R Asymmetries ({asymmetries.length})
      </div>
      <div className="mt-2 space-y-1.5">
        {asymmetries.map(({ slug, left, right }) => {
          const label = getMuscleLabel(`${slug}-l`)?.replace(/ \(.\)$/, "") || slug;
          return (
            <div key={slug} className="flex items-center justify-between rounded border border-zinc-700/40 bg-zinc-900/40 px-2.5 py-1.5">
              <span className="text-[11px] font-medium text-zinc-300">{label}</span>
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${stateBg(left)} ${stateColor(left)}`}>
                  L: {left}
                </span>
                <span className="text-zinc-600">vs</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${stateBg(right)} ${stateColor(right)}`}>
                  R: {right}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Stage 02-A.5 / U7 — IntakeWizard is reused inside OnboardingFlow step 4.
// Exported so the onboarding modal can mount it directly and route its
// completion through the same setMuscleStates handler as the in-Plan path.
export function IntakeWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [tightPicks, setTightPicks] = useState([]);
  const [weakPicks, setWeakPicks] = useState([]);
  const [liftPicks, setLiftPicks] = useState([]);

  const goalOptions = [
    { id: "balance", label: "Balance my body (fix imbalances)" },
    { id: "strength", label: "Build overall strength" },
    { id: "mobility", label: "Improve mobility & flexibility" },
    { id: "posture", label: "Fix posture issues" },
    { id: "rehab", label: "Recover from injury / pain" },
  ];

  const toggle = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleFinish = () => {
    const newStates = {};
    for (const id of tightPicks) {
      newStates[`${id}-l`] = { state: "tight", updatedAt: new Date().toISOString() };
      newStates[`${id}-r`] = { state: "tight", updatedAt: new Date().toISOString() };
    }
    for (const id of weakPicks) {
      newStates[`${id}-l`] = { state: "weak", updatedAt: new Date().toISOString() };
      newStates[`${id}-r`] = { state: "weak", updatedAt: new Date().toISOString() };
    }
    onComplete(newStates, liftPicks);
  };

  const current = WIZARD_STEPS[step];
  const canNext = step === 0 ? goals.length > 0 : true;

  return (
    <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">Setup Wizard</h3>
        <button onClick={onCancel} className="text-[10px] text-zinc-500 hover:text-zinc-400">Cancel</button>
      </div>

      <div className="mb-4 flex gap-1">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.id} className="flex-1">
            <div className={`h-1 rounded-full ${i <= step ? "bg-indigo-500" : "bg-zinc-800"}`} />
            <span className={`mt-0.5 block text-[9px] ${i <= step ? "text-indigo-400" : "text-zinc-600"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {current.id === "goals" && (
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-400">What are your main goals?</p>
          {goalOptions.map((g) => (
            <button key={g.id} onClick={() => toggle(goals, setGoals, g.id)}
              className={`block w-full rounded border px-3 py-2 text-left text-xs transition-colors ${
                goals.includes(g.id)
                  ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
                  : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-zinc-300"
              }`}
            >{g.label}</button>
          ))}
        </div>
      )}

      {current.id === "tight" && (
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-400">Where do you feel tight or restricted? (select all that apply)</p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_TIGHT.map((id) => {
              const label = getMuscleLabel(`${id}-l`)?.replace(/ \(.\)$/, "") || id;
              return (
                <button key={id} onClick={() => toggle(tightPicks, setTightPicks, id)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    tightPicks.includes(id)
                      ? "border-rose-500/50 bg-rose-500/20 text-rose-300"
                      : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-zinc-300"
                  }`}
                >{label}</button>
              );
            })}
          </div>
        </div>
      )}

      {current.id === "weak" && (
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-400">Where do you feel weak or underactive? (select all that apply)</p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_WEAK.map((id) => {
              const label = getMuscleLabel(`${id}-l`)?.replace(/ \(.\)$/, "") || id;
              return (
                <button key={id} onClick={() => toggle(weakPicks, setWeakPicks, id)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    weakPicks.includes(id)
                      ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                      : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-zinc-300"
                  }`}
                >{label}</button>
              );
            })}
          </div>
        </div>
      )}

      {current.id === "lifts" && (
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-400">Which movements do you train? (helps prioritize your plan)</p>
          <div className="flex flex-wrap gap-1.5">
            {MOVEMENTS.map((m) => (
              <button key={m.id} onClick={() => toggle(liftPicks, setLiftPicks, m.id)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  liftPicks.includes(m.id)
                    ? "border-sky-500/50 bg-sky-500/20 text-sky-300"
                    : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-zinc-300"
                }`}
              >{m.name}</button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-300 disabled:opacity-30"
        >Back</button>
        {step < WIZARD_STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext}
            className="rounded border border-indigo-600 bg-indigo-600/20 px-3 py-1.5 text-xs text-indigo-300 hover:bg-indigo-600/30 disabled:opacity-30"
          >Next</button>
        ) : (
          <button onClick={handleFinish}
            className="rounded border border-emerald-600 bg-emerald-600/20 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-600/30"
          >Generate Plan</button>
        )}
      </div>
    </div>
  );
}

function buildWeeklyPlan(markedMuscles) {
  const tightByGroup = {};
  const weakByGroup = {};

  for (const [muscleId, val] of markedMuscles) {
    const parsed = fromMuscleId(muscleId);
    if (!parsed) continue;
    const parent = Object.entries(SUB_MUSCLES).find(([, subs]) =>
      subs.some((s) => s.id === parsed.slug)
    )?.[0] || parsed.slug;
    const bucket = val.state === "tight" ? tightByGroup : weakByGroup;
    if (!bucket[parent]) bucket[parent] = [];
    bucket[parent].push(muscleId);
  }

  const isUpper = (g) => DAY_TEMPLATES.upper.groups.includes(g);
  const isLower = (g) => DAY_TEMPLATES.lower.groups.includes(g);

  const days = [];

  const upperTight = Object.keys(tightByGroup).filter(isUpper);
  const lowerTight = Object.keys(tightByGroup).filter(isLower);
  const upperWeak = Object.keys(weakByGroup).filter(isUpper);
  const lowerWeak = Object.keys(weakByGroup).filter(isLower);

  if (upperTight.length > 0 || lowerTight.length > 0) {
    const mobilityIds = [
      ...upperTight.flatMap((g) => tightByGroup[g]),
      ...lowerTight.flatMap((g) => tightByGroup[g]),
    ];
    days.push({ type: "mobility", label: "Day 1 — Mobility / Recovery", muscleIds: mobilityIds, focus: "tight" });
  }

  if (upperWeak.length > 0 || upperTight.length > 0) {
    const ids = [
      ...upperTight.flatMap((g) => tightByGroup[g]),
      ...upperWeak.flatMap((g) => weakByGroup[g]),
    ];
    days.push({ type: "upper", label: `Day ${days.length + 1} — Upper Body`, muscleIds: ids, focus: "mixed" });
  }

  if (lowerWeak.length > 0 || lowerTight.length > 0) {
    const ids = [
      ...lowerTight.flatMap((g) => tightByGroup[g]),
      ...lowerWeak.flatMap((g) => weakByGroup[g]),
    ];
    days.push({ type: "lower", label: `Day ${days.length + 1} — Lower Body`, muscleIds: ids, focus: "mixed" });
  }

  if (days.length === 0 && markedMuscles.length > 0) {
    days.push({
      type: "full", label: "Day 1 — Full Body",
      muscleIds: markedMuscles.map(([id]) => id), focus: "mixed",
    });
  }

  return days;
}

// Stage 02-B / F6 — local-time YYYY-MM-DD key (mirrors BodyMapApp.isoDayKeyLocal
// so the planner's "today" view aligns exactly with the persisted adherence
// rows even across DST / TZ flips).
function planTodayKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function SessionBlock({ muscleId, state, todayAdherence, onMark }) {
  const label = getMuscleLabel(muscleId) || muscleId;
  const parsed = fromMuscleId(muscleId);
  const remedies = parsed ? getRemedies(parsed.slug, state) : [];
  const sorted = [...remedies].sort((a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9));

  const stateColor = state === "tight" ? "rose" : "amber";

  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-2.5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full bg-${stateColor}-500`} />
        <span className="text-xs font-medium text-zinc-300">{label}</span>
        <span className={`rounded bg-${stateColor}-500/20 px-1.5 py-0.5 text-[10px] text-${stateColor}-300`}>{state}</span>
      </div>
      {sorted.length > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {sorted.map((r) => {
            const row = todayAdherence?.get?.(r.id);
            const isDone = row?.status === "done";
            const isSkipped = row?.status === "skipped";
            const dose = r.steps?.length > 0
              ? r.steps.find((s) => /\d+\s*sets?|\d+\s*reps?|\d+\s*sec/i.test(s.instruction))?.instruction.match(/\d+\s*sets?\s*(of\s*\d+[\s–-]*\d*\s*reps?)?|\d+[\s–-]*\d*\s*sec(onds?)?|hold\s+\d+/i)?.[0]
              : null;
            return (
              <li
                key={r.id}
                className={`flex items-start justify-between gap-2 rounded border px-2 py-1 ${
                  isDone
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : isSkipped
                    ? "border-zinc-700/60 bg-zinc-900/40 opacity-60"
                    : "border-transparent"
                }`}
              >
                <div className="min-w-0 text-[11px] text-zinc-400">
                  • {r.title} <span className="text-zinc-600">({r.type})</span>
                  {dose ? <span className="ml-1 text-zinc-600">— {dose}</span> : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMark?.(muscleId, r, isDone ? "suggested" : "done")}
                    aria-pressed={isDone}
                    className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
                      isDone
                        ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {isDone ? "Done ✓" : "Done"}
                  </button>
                  {!isDone ? (
                    <button
                      type="button"
                      onClick={() => onMark?.(muscleId, r, isSkipped ? "suggested" : "skipped")}
                      aria-pressed={isSkipped}
                      className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
                        isSkipped
                          ? "border-zinc-600 bg-zinc-800 text-zinc-300"
                          : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Skip
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-1 text-[11px] text-zinc-600">
          {state === "tight" ? "General stretch / release recommended." : "Targeted strengthening recommended."}
        </p>
      )}
    </div>
  );
}

export default function SessionPlanner({
  muscleStates,
  onSetState,
  intakeTrigger = 0,
  adherence = [],
  onAdherenceChange,
}) {
  const [viewMode, setViewMode] = useState("session");
  const [showWizard, setShowWizard] = useState(false);

  // Stage 02-A.5 / U5: external trigger to open the intake wizard from the
  // Calibrate section. Each click bumps `intakeTrigger`; we open the wizard
  // when the value changes (skip the initial 0).
  useEffect(() => {
    if (intakeTrigger > 0) setShowWizard(true);
  }, [intakeTrigger]);

  const markedMuscles = useMemo(
    () =>
      Object.entries(muscleStates)
        .filter(([, v]) => v?.state && v.state !== "normal")
        .sort((a, b) => (STATE_PRIORITY[a[1].state] || 9) - (STATE_PRIORITY[b[1].state] || 9)),
    [muscleStates],
  );

  const tightMuscles = markedMuscles.filter(([, v]) => v.state === "tight");
  const weakMuscles = markedMuscles.filter(([, v]) => v.state === "weak");

  const alsoConsider = useMemo(() => {
    const map = new Map();
    const markedSlugs = new Set(markedMuscles.map(([id]) => fromMuscleId(id)?.slug).filter(Boolean));
    for (const [muscleId] of markedMuscles) {
      const parsed = fromMuscleId(muscleId);
      if (!parsed?.slug) continue;
      const { inbound, outbound } = getEdgesForMuscle(parsed.slug);
      const seen = new Set();
      for (const edge of [...inbound, ...outbound]) {
        if (seen.has(edge.id)) continue;
        seen.add(edge.id);
        const otherId = edge.from === parsed.slug ? edge.to : edge.from;
        if (!markedSlugs.has(otherId) && !map.has(otherId)) {
          map.set(otherId, edge);
        }
      }
    }
    return map;
  }, [markedMuscles]);

  const weeklyPlan = useMemo(() => buildWeeklyPlan(markedMuscles), [markedMuscles]);

  // Stage 02-B / F6 — index today's adherence rows by `${muscleId}::${remedyId}`
  // so each remedy in the session can show its current status (suggested /
  // done / skipped) read directly from the v3 log.
  const today = planTodayKey();
  const todayAdherenceByMuscle = useMemo(() => {
    const map = new Map();
    for (const row of adherence || []) {
      if (!row || row.date !== today) continue;
      const muscleId = row.muscleId || null;
      if (!muscleId) continue;
      if (!map.has(muscleId)) map.set(muscleId, new Map());
      map.get(muscleId).set(row.remedyKey, row);
    }
    return map;
  }, [adherence, today]);

  // Stage 02-B / F6 — when the session plan changes, seed a "suggested" row
  // for every remedy displayed today (deduped in handleAdherenceChange).
  // The ref guards against re-seeding on every adherence-state re-render.
  const seededRef = useRef(null);
  useEffect(() => {
    if (!onAdherenceChange) return;
    const sessionItems = [];
    for (const [muscleId, val] of markedMuscles) {
      const parsed = fromMuscleId(muscleId);
      if (!parsed?.slug) continue;
      const remedies = getRemedies(parsed.slug, val.state) || [];
      for (const rem of remedies) sessionItems.push({ muscleId, rem });
    }
    if (sessionItems.length === 0) return;
    const sig = `${today}|${sessionItems.map((s) => `${s.muscleId}:${s.rem.id}`).join(",")}`;
    if (seededRef.current === sig) return;
    seededRef.current = sig;
    for (const { muscleId, rem } of sessionItems) {
      const existing = todayAdherenceByMuscle.get(muscleId)?.get(rem.id);
      if (existing) continue;
      onAdherenceChange({
        date: today,
        muscleId,
        remedyKey: rem.id,
        remedyTitle: rem.title,
        status: "suggested",
        source: "session-planner",
      });
    }
  }, [markedMuscles, onAdherenceChange, today, todayAdherenceByMuscle]);

  const handleMarkRemedy = (muscleId, remedy, status) => {
    if (!onAdherenceChange) return;
    onAdherenceChange({
      date: today,
      muscleId,
      remedyKey: remedy.id,
      remedyTitle: remedy.title,
      status,
      source: "session-planner",
    });
  };

  const handleWizardComplete = (newStates, _liftPicks) => {
    if (onSetState) {
      // Stage 02-B / F1 — tag intake-wizard flips so the stateChanges
      // log can distinguish them from manual taps in later analytics.
      for (const [id, val] of Object.entries(newStates)) {
        onSetState(id, val.state, "intake-wizard");
      }
    }
    setShowWizard(false);
  };

  if (showWizard) {
    return <IntakeWizard onComplete={handleWizardComplete} onCancel={() => setShowWizard(false)} />;
  }

  if (markedMuscles.length === 0) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
          <p className="text-sm text-zinc-400">
            No muscles marked as tight or weak yet.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Use the Log tab to select a muscle and mark its state, or run the setup wizard.
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="mt-3 rounded border border-indigo-600 bg-indigo-600/20 px-4 py-2 text-xs text-indigo-300 hover:bg-indigo-600/30"
          >
            Start Setup Wizard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {["session", "weekly", "symmetry"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                viewMode === mode
                  ? "border-violet-500/50 bg-violet-500/20 text-violet-300"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:text-zinc-400"
              }`}
            >
              {mode === "session" ? "Session" : mode === "weekly" ? "Weekly" : "L/R Balance"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-400"
        >
          Re-run Wizard
        </button>
      </div>

      {viewMode === "symmetry" && <SymmetryView muscleStates={muscleStates} />}

      {viewMode === "session" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="text-sm font-semibold text-zinc-200">Session Plan</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Tight muscles get stretches/releases first, then weak muscles get activation/strengthening.
          </p>

          {tightMuscles.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-rose-400">
                1. Release &amp; stretch tight muscles
              </div>
              <div className="mt-2 space-y-2">
                {tightMuscles.map(([muscleId]) => (
                  <SessionBlock
                    key={muscleId}
                    muscleId={muscleId}
                    state="tight"
                    todayAdherence={todayAdherenceByMuscle.get(muscleId)}
                    onMark={handleMarkRemedy}
                  />
                ))}
              </div>
            </div>
          )}

          {weakMuscles.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-amber-400">
                {tightMuscles.length > 0 ? "2" : "1"}. Activate &amp; strengthen weak muscles
              </div>
              <div className="mt-2 space-y-2">
                {weakMuscles.map(([muscleId]) => (
                  <SessionBlock
                    key={muscleId}
                    muscleId={muscleId}
                    state="weak"
                    todayAdherence={todayAdherenceByMuscle.get(muscleId)}
                    onMark={handleMarkRemedy}
                  />
                ))}
              </div>
            </div>
          )}

          {alsoConsider.size > 0 && (
            <div className="mt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-violet-400">
                {(tightMuscles.length > 0 ? 1 : 0) + (weakMuscles.length > 0 ? 1 : 0) + 1}. Also consider (via L1 edges)
              </div>
              <div className="mt-2 space-y-1.5">
                {[...alsoConsider.entries()].slice(0, 8).map(([baseId, edge]) => {
                  const label = getMuscleLabel(`${baseId}-l`)?.replace(/ \(.\)$/, "") || baseId;
                  return (
                    <div key={baseId} className="flex items-start gap-2 rounded border border-zinc-700/30 bg-zinc-900/30 px-2 py-1.5">
                      <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-violet-500" />
                      <div>
                        <span className="text-[11px] font-medium text-zinc-300">{label}</span>
                        <span className="ml-1.5 rounded bg-zinc-800 px-1 py-0.5 text-[10px] text-zinc-500">{edge.kind}</span>
                        <p className="mt-0.5 text-[10px] leading-snug text-zinc-500">
                          {edge.mechanism.length > 120 ? edge.mechanism.slice(0, 120) + "…" : edge.mechanism}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === "weekly" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="text-sm font-semibold text-zinc-200">Weekly Plan</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Your marked muscles distributed across training days. Mobility work first, then upper/lower splits.
            </p>
          </div>

          {weeklyPlan.length === 0 ? (
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 text-center">
              <p className="text-xs text-zinc-500">Mark muscles as tight or weak to generate a weekly plan.</p>
            </div>
          ) : (
            weeklyPlan.map((day, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <h4 className="text-xs font-semibold text-zinc-200">{day.label}</h4>
                <div className="mt-2 space-y-2">
                  {day.muscleIds.map((muscleId) => {
                    const val = muscleStates[muscleId];
                    if (!val?.state || val.state === "normal") return null;
                    return (
                      <SessionBlock
                        key={muscleId}
                        muscleId={muscleId}
                        state={val.state}
                        todayAdherence={todayAdherenceByMuscle.get(muscleId)}
                        onMark={handleMarkRemedy}
                      />
                    );
                  })}
                </div>
                {day.type === "mobility" && (
                  <p className="mt-2 text-[10px] text-zinc-600">
                    Focus on foam rolling, stretching, and light movement. No heavy loading.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
