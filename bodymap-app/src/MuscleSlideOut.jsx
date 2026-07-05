// Stage 02-A.5 / U4 — Muscle slide-out for the Body screen.
// Spec: stages/02a-ux-foundation/output/screens.md "Muscle slide-out".
//
// Layout:
//   - Mobile: bottom sheet, ~70vh, drag-handle, opaque backdrop.
//   - Desktop (md+): right-anchored panel, max-w-md, full height.
//   - 7 sub-tabs: Learn (default first-open) / State / Mechanics / Edges /
//     Remedies / Movements / Log. Last opened sub-tab persists in component
//     state for the lifetime of this slide-out instance (per spec: "session,
//     not persisted").
//
// Mechanics / Edges / Movements panels keep their existing dense data view
// but get a plain-language summary card on top per the spec.
// Remedies sub-tab adds a "done ✓ / skip" affordance backed by a local
// adherence stub (full F6 schema lands in Stage 02-B).
//
// Re-skinning: design tokens (rounded-14, brand teal, state-tight/weak/balanced,
// shadow-elev-2). The legacy panels still render their own borders; in the
// slide-out we wrap them in a "Technical view" disclosure to lower visual noise.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivitySquare,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Compass,
  Dumbbell,
  Layers,
  PenLine,
  Sparkles,
  X,
} from "lucide-react";
import LearnPanel from "./LearnPanel";
import MuscleStatePanel from "./MuscleStatePanel";
import MuscleMechanicsPanel from "./MuscleMechanicsPanel";
import RelationshipEdgesPanel from "./RelationshipEdgesPanel";
import RemedyPanel from "./RemedyPanel";
import MovementRecruitmentPanel from "./MovementRecruitmentPanel";
import MuscleQuickLog from "./MuscleQuickLog";
import { fromMuscleId, getMuscle } from "./muscle-data";
import { getMuscleMechanics } from "./data/muscle-mechanics";
import { getEdgesForMuscle } from "./data/relationship-edges";
import { getAllRemediesForMuscle } from "./data/remedies";
import { describeAction } from "./data/action-verbs";

const TABS = [
  { id: "learn", label: "Learn", Icon: BookOpen },
  { id: "state", label: "State", Icon: Sparkles },
  { id: "mechanics", label: "Mechanics", Icon: Layers },
  { id: "edges", label: "Edges", Icon: Compass },
  { id: "remedies", label: "Remedies", Icon: Dumbbell },
  { id: "movements", label: "Movements", Icon: ActivitySquare },
  { id: "log", label: "Log", Icon: PenLine },
];

function PlainLanguageMechanics({ baseId }) {
  const mech = getMuscleMechanics(baseId);
  if (!mech) {
    return (
      <p className="text-body text-zinc-300">
        We&apos;ll show how this muscle moves your joints once we&apos;ve seeded
        its mechanics data.
      </p>
    );
  }
  const verbs = (mech.primaryActionKeys || [])
    .map((k) => describeAction(k))
    .filter(Boolean)
    .slice(0, 3);
  if (verbs.length === 0) {
    return (
      <p className="text-body text-zinc-300">
        This muscle helps move and steady the joints it crosses.
      </p>
    );
  }
  return (
    <p className="text-body text-zinc-200">
      In short, this muscle {verbs.join("; ")}.
    </p>
  );
}

function PlainLanguageEdges({ baseId }) {
  const { inbound, outbound } = getEdgesForMuscle(baseId);
  const total = inbound.length + outbound.length;
  if (total === 0) {
    return (
      <p className="text-body text-zinc-300">
        We don&apos;t have any cross-muscle relationships seeded for this muscle
        yet.
      </p>
    );
  }
  return (
    <p className="text-body text-zinc-200">
      This muscle has {total} known relationship{total === 1 ? "" : "s"} with
      other regions — when one acts up, the others often follow. Tap the
      technical view for the full chain.
    </p>
  );
}

function PlainLanguageMovements() {
  return (
    <p className="text-body text-zinc-200">
      Pick a movement to see which muscles do which job — primary movers,
      assistants, and stabilizers — and watch them light up on the atlas.
    </p>
  );
}

function PlainLanguageRemedies({ baseId, currentState }) {
  const all = getAllRemediesForMuscle(baseId);
  if (all.length === 0) {
    return (
      <p className="text-body text-zinc-300">
        We haven&apos;t seeded specific drills for this muscle yet. Mark a state
        on the State tab and we&apos;ll suggest a general approach.
      </p>
    );
  }
  if (!currentState || currentState === "normal") {
    return (
      <p className="text-body text-zinc-200">
        Mark this muscle as <span className="text-state-tight">tight</span> or
        <span className="text-state-weak"> weak</span> on the State tab to see
        targeted drills here.
      </p>
    );
  }
  return (
    <p className="text-body text-zinc-200">
      Here are the drills for this muscle&apos;s current{" "}
      <span className="text-zinc-100">{currentState}</span> state. Mark each one
      done as you finish so we can track your follow-through over time.
    </p>
  );
}

function TechnicalDisclosure({ children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-10 border border-zinc-800/80 bg-zinc-950/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-caption uppercase tracking-wide text-zinc-400 transition-colors duration-150 ease-out hover:text-zinc-200"
        aria-expanded={open}
      >
        <span>Technical view</span>
        {open ? (
          <ChevronDown size={14} aria-hidden="true" />
        ) : (
          <ChevronRight size={14} aria-hidden="true" />
        )}
      </button>
      {open ? <div className="border-t border-zinc-800/80 p-3">{children}</div> : null}
    </div>
  );
}

// Stage 02-B / F6 — local-time YYYY-MM-DD key (mirrors BodyMapApp's
// isoDayKeyLocal so the slide-out's "is today done?" check stays aligned
// with the persisted adherence rows even when the device crosses a day
// boundary while the panel is open).
function todayKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function RemediesWithAdherence({
  muscleId,
  baseId,
  muscleStates,
  adherenceList = [],
  onAdherenceChange,
  onMarkDone,
}) {
  const currentState = muscleStates?.[muscleId]?.state;
  const remedies = useMemo(() => getAllRemediesForMuscle(baseId), [baseId]);
  const stateRemedies = remedies.filter((r) => r.forState === currentState);
  const candidates = stateRemedies.length > 0 ? stateRemedies : remedies;

  // Stage 02-B / F6 — index today's adherence rows for this muscle so each
  // toggle reflects the persisted v3 log. Keyed by remedy id since
  // MuscleSlideOut writes one row per (today, muscleId, remedy.id).
  const today = todayKey();
  const todayByRemedy = useMemo(() => {
    const map = new Map();
    for (const row of adherenceList) {
      if (!row || row.date !== today) continue;
      if ((row.muscleId || null) !== (muscleId || null)) continue;
      map.set(row.remedyKey, row);
    }
    return map;
  }, [adherenceList, today, muscleId]);

  // Stage 02-B / F6 — seed a "suggested" row per displayed remedy the first
  // time the Remedies tab opens for this muscle today. Dedup in
  // BodyMapApp.handleAdherenceChange means re-seeding on re-render is
  // idempotent. We still gate on a ref so we don't run the seed loop on
  // every keystroke.
  const seededKey = useRef(null);
  useEffect(() => {
    if (!onAdherenceChange || !muscleId || candidates.length === 0) return;
    const seedKey = `${today}|${muscleId}|${candidates.map((r) => r.id).join(",")}`;
    if (seededKey.current === seedKey) return;
    seededKey.current = seedKey;
    for (const rem of candidates.slice(0, 6)) {
      if (todayByRemedy.has(rem.id)) continue;
      onAdherenceChange({
        date: today,
        muscleId,
        remedyKey: rem.id,
        remedyTitle: rem.title,
        status: "suggested",
        source: "slide-out",
      });
    }
  }, [candidates, muscleId, onAdherenceChange, today, todayByRemedy]);

  return (
    <div className="space-y-3">
      <PlainLanguageRemedies baseId={baseId} currentState={currentState} />

      {candidates.length > 0 ? (
        <ul className="space-y-2">
          {candidates.slice(0, 6).map((rem) => {
            const row = todayByRemedy.get(rem.id);
            const isDone = row?.status === "done";
            const isSkipped = row?.status === "skipped";
            return (
              <li
                key={rem.id}
                className="rounded-10 border border-zinc-800 bg-zinc-900/60 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-body-lg text-zinc-100">{rem.title}</p>
                    <p className="mt-0.5 text-caption text-zinc-400">
                      {rem.type}
                      {rem.forState ? ` · for ${rem.forState}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onMarkDone?.(rem)}
                      aria-pressed={isDone}
                      className={`rounded-full border px-3 py-1 text-caption transition-colors duration-150 ease-out ${
                        isDone
                          ? "border-brand bg-brand/15 text-brand"
                          : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-zinc-100"
                      }`}
                    >
                      {isDone ? "Done ✓" : "Mark done"}
                    </button>
                    {!isDone ? (
                      <button
                        type="button"
                        onClick={() =>
                          onAdherenceChange?.({
                            date: today,
                            muscleId,
                            remedyKey: rem.id,
                            remedyTitle: rem.title,
                            status: isSkipped ? "suggested" : "skipped",
                            source: "slide-out",
                          })
                        }
                        aria-pressed={isSkipped}
                        className={`rounded-full border px-2.5 py-1 text-caption transition-colors duration-150 ease-out ${
                          isSkipped
                            ? "border-zinc-600 bg-zinc-800 text-zinc-300"
                            : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {isSkipped ? "Skipped" : "Skip"}
                      </button>
                    ) : null}
                  </div>
                </div>
                {rem.steps?.length ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-caption text-brand hover:text-brand-hover">
                      Steps
                    </summary>
                    <ol className="mt-2 space-y-1 text-body text-zinc-300">
                      {rem.steps.map((step) => (
                        <li key={step.order} className="flex gap-2">
                          <span className="tabular-nums text-zinc-500">
                            {step.order}.
                          </span>
                          <span>{step.instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </details>
                ) : null}
                {rem.caution ? (
                  <p className="mt-2 text-caption text-state-tight">
                    Caution: {rem.caution}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      <TechnicalDisclosure>
        <RemedyPanel muscleId={muscleId} muscleStates={muscleStates} />
      </TechnicalDisclosure>
    </div>
  );
}

/**
 * @param {{
 *   muscleId: string | null,
 *   open: boolean,
 *   onClose: () => void,
 *   muscleStates: Record<string, { state: string, updatedAt?: string }>,
 *   onSetState: (muscleId: string, state: string | null) => void,
 *   onSelectMuscle?: (muscleId: string) => void,
 *   onSaveLog?: (entry: object) => void,
 *   onRecruitmentChange?: (tint: object | null) => void,
 *   defaultTab?: string,
 *   goals?: Array<object>,
 *   onOpenGoal?: (goalId: string) => void,
 * }} props
 */
export default function MuscleSlideOut({
  muscleId,
  open,
  onClose,
  muscleStates = {},
  onSetState,
  onSelectMuscle,
  onSaveLog,
  onRecruitmentChange,
  defaultTab = "learn",
  goals = [],
  onOpenGoal,
  adherence = [],
  onAdherenceChange,
}) {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const parsed = muscleId ? fromMuscleId(muscleId) : null;
  const baseId = parsed?.slug || null;
  const muscle = muscleId ? getMuscle(muscleId) : null;

  const niceLabel = (muscle?.label || baseId || "Muscle").replace(/ \(.\)$/, "");

  const sideOptions = useMemo(() => {
    if (!baseId) return [];
    const opts = [];
    const left = `${baseId}-l`;
    const right = `${baseId}-r`;
    if (getMuscle(left)) opts.push({ id: left, label: "L" });
    if (getMuscle(right)) opts.push({ id: right, label: "R" });
    if (opts.length === 2) opts.push({ id: baseId, label: "Both" });
    return opts;
  }, [baseId]);

  const handleSwitchSide = (id) => {
    if (id === muscleId) return;
    onSelectMuscle?.(id);
  };

  // Stage 02-A.5 / U8 — adherence is persisted to entries[] so the
  // first-remedy-done milestone keeps working.
  // Stage 02-B / F6 — same click ALSO updates the v3 adherence[] log via
  // BodyMapApp.handleAdherenceChange (called from saveSlideOutLog). Toggling
  // an already-done remedy reverts the row to "suggested" so the UI and the
  // M7 metric stay aligned with what the user actually checked off today.
  const todayKeyValue = todayKey();
  const markDone = (remedy) => {
    if (!remedy || !muscleId) return;
    const remedyId = remedy.id;
    const remedyTitle = remedy.title;
    const existing = (adherence || []).find(
      (row) =>
        row &&
        row.date === todayKeyValue &&
        (row.muscleId || null) === (muscleId || null) &&
        row.remedyKey === remedyId,
    );
    const wasDone = existing?.status === "done";
    if (wasDone) {
      onAdherenceChange?.({
        date: todayKeyValue,
        muscleId,
        remedyKey: remedyId,
        remedyTitle,
        status: "suggested",
        source: "slide-out",
      });
      return;
    }
    onSaveLog?.({
      kind: "adherence",
      muscleId,
      remedyId,
      remedyTitle,
      status: "done",
      timestamp: new Date().toISOString(),
    });
  };

  if (!open || !muscleId) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${niceLabel} details`}
      className="fixed inset-0 z-50 flex items-end justify-end bg-black/60 backdrop-blur-sm md:items-stretch"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <section
        className="flex h-[78vh] w-full flex-col overflow-hidden rounded-t-20 border border-zinc-800 bg-zinc-950 shadow-elev-2 transition-transform duration-200 ease-standard md:h-full md:max-w-md md:rounded-l-20 md:rounded-tr-none md:border-l"
      >
        <header className="flex shrink-0 flex-col gap-2 border-b border-zinc-800 bg-zinc-900/60 px-4 pb-3 pt-4">
          <div className="mx-auto h-1 w-10 rounded-full bg-zinc-700 md:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-h2 text-zinc-100">{niceLabel}</h3>
              {sideOptions.length > 0 ? (
                <div
                  className="mt-1 inline-flex overflow-hidden rounded-full border border-zinc-800 bg-zinc-950 text-caption"
                  role="tablist"
                  aria-label="Side"
                >
                  {sideOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="tab"
                      aria-selected={muscleId === opt.id}
                      onClick={() => handleSwitchSide(opt.id)}
                      className={`px-2.5 py-1 transition-colors duration-150 ease-out ${
                        muscleId === opt.id
                          ? "bg-brand text-zinc-950"
                          : "text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 transition-colors duration-150 ease-out hover:text-zinc-100"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <nav
            aria-label="Muscle details sub-tabs"
            className="-mx-1 flex gap-1 overflow-x-auto px-1"
          >
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-caption transition-colors duration-150 ease-out ${
                    active
                      ? "border-brand bg-brand/15 text-brand"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {tab === "learn" && (
            <LearnPanel
              muscleId={muscleId}
              goals={goals}
              onOpenGoal={onOpenGoal}
              onOpenTechnical={() => setTab("mechanics")}
            />
          )}

          {tab === "state" && (
            <div className="space-y-3">
              <p className="text-body text-zinc-200">
                How does this muscle feel right now? Mark its current state to
                guide your plan.
              </p>
              <MuscleStatePanel
                muscleId={muscleId}
                muscleStates={muscleStates}
                onSetState={onSetState}
              />
            </div>
          )}

          {tab === "mechanics" && (
            <div className="space-y-3">
              <PlainLanguageMechanics baseId={baseId} />
              <TechnicalDisclosure>
                <MuscleMechanicsPanel muscleId={muscleId} />
              </TechnicalDisclosure>
            </div>
          )}

          {tab === "edges" && (
            <div className="space-y-3">
              <PlainLanguageEdges baseId={baseId} />
              <TechnicalDisclosure>
                <RelationshipEdgesPanel muscleId={muscleId} />
              </TechnicalDisclosure>
            </div>
          )}

          {tab === "remedies" && baseId && (
            <RemediesWithAdherence
              muscleId={muscleId}
              baseId={baseId}
              muscleStates={muscleStates}
              adherenceList={adherence}
              onAdherenceChange={onAdherenceChange}
              onMarkDone={markDone}
            />
          )}

          {tab === "movements" && (
            <div className="space-y-3">
              <PlainLanguageMovements />
              <TechnicalDisclosure defaultOpen>
                <MovementRecruitmentPanel
                  onRecruitmentChange={onRecruitmentChange}
                />
              </TechnicalDisclosure>
            </div>
          )}

          {tab === "log" && (
            // key={muscleId} remounts the form (resetting its local state)
            // when the selected muscle changes, instead of syncing it via
            // a setState-in-effect.
            <MuscleQuickLog key={muscleId} muscleId={muscleId} onSave={onSaveLog} />
          )}
        </div>
      </section>
    </div>
  );
}
