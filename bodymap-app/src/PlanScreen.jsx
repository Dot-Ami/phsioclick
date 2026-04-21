// Stage 02-A.5 / U5 — PlanScreen.
// Spec: stages/02a-ux-foundation/output/screens.md "Plan screen".
//
// Layout (above the fold): This-Week strip + Your-Goals card. Below the fold:
// the existing SessionPlanner (intake wizard + session/weekly view) and the
// Calibrate accordion. We keep the planner mounted so users can drill into
// today's full session list without leaving the tab.
//
// State derivation lives in src/lib/session-plan.js so this screen and
// TodayScreen stay in lockstep.

import WeeklyStrip from "./WeeklyStrip";
import GoalCard from "./GoalCard";
import GoalsPanel from "./GoalsPanel";
import CalibrateSection from "./CalibrateSection";
import PlanWeeklySummary from "./PlanWeeklySummary";

export default function PlanScreen({
  muscleStates,
  stateChanges = [],
  adherence = [],
  goals = [],
  onAddGoal,
  onUpdateGoal,
  onArchiveGoal,
  planner,
  assessmentSlot,
  onReRunIntake,
  onUpdateLifts,
}) {
  const scrollToGoalsPanel = () => {
    document.getElementById("dot-goals-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section aria-labelledby="plan-screen-title" className="space-y-6">
      <h2 id="plan-screen-title" className="sr-only">
        Plan
      </h2>

      <div className="mx-auto max-w-2xl space-y-4">
        <header className="px-1">
          <p className="text-caption uppercase tracking-wide text-zinc-500">
            Plan
          </p>
          <h3 className="text-display-md text-zinc-100">This week</h3>
          <p className="mt-0.5 text-body text-zinc-400">
            Where you&apos;re heading. Open a day to see what to do.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeeklyStrip muscleStates={muscleStates} />
          <GoalCard
            muscleStates={muscleStates}
            goals={goals}
            stateChanges={stateChanges}
            adherence={adherence}
            onAddGoal={scrollToGoalsPanel}
          />
        </div>

        {/* Stage 02-B / F4 — inline "since last week" micro-summary above
            the planner. Renders a calibration line until ≥7d of stateChanges
            history exists, then composites M2 / M3 / M5 from src/metrics. */}
        <PlanWeeklySummary stateChanges={stateChanges} />

        {/* Stage 02-B / F5 — full goals UI lives here. The at-a-glance
            GoalCard above stays for the legacy summary slot; this panel is
            the create / edit / archive surface. Sits between the F4
            micro-summary and the planner so the user sees their goals
            before drilling into today's session. */}
        <GoalsPanel
          goals={goals}
          stateChanges={stateChanges}
          adherence={adherence}
          onAddGoal={onAddGoal}
          onUpdateGoal={onUpdateGoal}
          onArchiveGoal={onArchiveGoal}
        />

        {planner ? (
          <details
            className="group rounded-14 border border-zinc-800 bg-zinc-900/60 p-4 open:bg-zinc-900/80"
            open
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-body text-zinc-200">
              <span className="text-caption uppercase tracking-wide text-zinc-400">
                Session planner
              </span>
              <span className="text-caption text-zinc-500 group-open:hidden">
                Open
              </span>
              <span className="hidden text-caption text-zinc-500 group-open:inline">
                Hide
              </span>
            </summary>
            <div className="mt-3">{planner}</div>
          </details>
        ) : null}

        <CalibrateSection
          assessmentSlot={assessmentSlot}
          onReRunIntake={onReRunIntake}
          onUpdateLifts={onUpdateLifts}
        />
      </div>
    </section>
  );
}
