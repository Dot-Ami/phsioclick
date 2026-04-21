// Stage 02-A.5 / U5 — CalibrateSection for the Plan screen.
// Spec: stages/02a-ux-foundation/output/screens.md "Plan screen / Calibrate".
//
// Below-the-fold accordion that holds infrequent setup actions:
//   - Add an assessment (existing form, re-skinned with U1 tokens)
//   - Re-run intake wizard (calls the existing wizard reset flow)
//   - Update lifts / training context  (TODO(stage-02-b): F4 lifts schema)
//
// We accept the existing assessment slot as `assessmentSlot` so we don't have
// to duplicate state ownership — BodyMapApp keeps owning the form. We expose
// `onReRunIntake` so the Plan screen can scroll/open the SessionPlanner intake
// (the planner lives above this section and already supports an intake state).
//
// Layout: collapsible <details> per row, default closed. The card itself opens
// when any child is opened to keep the visual weight low until the user wants
// it.

import { Settings, ClipboardCheck, RefreshCcw, Dumbbell } from "lucide-react";

function Row({ icon: Icon, title, summary, children, defaultOpen = false }) {
  return (
    <details
      className="group rounded-10 border border-zinc-800 bg-zinc-950/40 transition-colors duration-150 ease-out open:border-zinc-700 open:bg-zinc-950/70"
      {...(defaultOpen ? { open: true } : {})}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 text-body text-zinc-200 hover:bg-zinc-900/40">
        <Icon size={16} aria-hidden="true" className="text-zinc-400" />
        <div className="min-w-0 flex-1">
          <p className="text-body-lg text-zinc-100">{title}</p>
          {summary ? (
            <p className="mt-0.5 text-caption text-zinc-500">{summary}</p>
          ) : null}
        </div>
        <span className="text-caption text-zinc-500 group-open:hidden">Open</span>
        <span className="hidden text-caption text-zinc-500 group-open:inline">Close</span>
      </summary>
      <div className="border-t border-zinc-800 px-3 py-3">{children}</div>
    </details>
  );
}

export default function CalibrateSection({
  assessmentSlot,
  onReRunIntake,
  onUpdateLifts,
}) {
  return (
    <article
      aria-label="Calibrate"
      className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-4"
    >
      <header className="flex items-center gap-2">
        <Settings size={14} aria-hidden="true" className="text-zinc-400" />
        <p className="text-caption uppercase tracking-wide text-zinc-400">
          Calibrate
        </p>
      </header>
      <p className="mt-1 text-caption text-zinc-500">
        Setup actions, not daily. Open these when you re-test, change training,
        or want to refresh your starting picture.
      </p>

      <div className="mt-3 space-y-2">
        <Row
          icon={ClipboardCheck}
          title="Add an assessment"
          summary="Track left/right values for tests like overhead squat, single-leg balance, ankle dorsiflexion."
        >
          {assessmentSlot}
        </Row>

        <Row
          icon={RefreshCcw}
          title="Re-run intake wizard"
          summary="Re-baseline your tight / weak / balanced picks and rebuild this week."
        >
          <p className="text-body text-zinc-300">
            Re-running the wizard keeps your logs and goals — it only refreshes
            the starting muscle states the planner uses.
          </p>
          <button
            type="button"
            onClick={onReRunIntake}
            disabled={!onReRunIntake}
            className="mt-3 inline-flex items-center gap-1.5 rounded-10 bg-brand px-3 py-2 text-body font-medium text-zinc-900 transition-colors duration-150 ease-out hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw size={14} aria-hidden="true" />
            Re-run intake
          </button>
        </Row>

        <Row
          icon={Dumbbell}
          title="Update lifts / training context"
          summary="Coming in Stage 02-B — capture your main lifts and training schedule so the planner can match load."
        >
          {/* TODO(stage-02-b): wire to F4 lifts schema (squat / hinge / push /
              pull max + sessions per week). For now we render a disabled stub
              so the layout is locked in and reviewers see where it lands. */}
          <p className="text-body text-zinc-300">
            We&apos;ll let you record your top sets and weekly training volume
            so the weekly plan can scale around real load — not generic
            templates. Coming soon.
          </p>
          <button
            type="button"
            onClick={onUpdateLifts}
            disabled
            className="mt-3 inline-flex cursor-not-allowed items-center gap-1.5 rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-500"
          >
            Update lifts (soon)
          </button>
        </Row>
      </div>
    </article>
  );
}
