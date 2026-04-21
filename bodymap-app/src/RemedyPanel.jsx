import { fromMuscleId } from "./muscle-data";
import { getRemedies } from "./data/remedies";

const TYPE_ICONS = {
  stretch: "🔹",
  strengthen: "💪",
  mobilize: "🔄",
  activate: "⚡",
  release: "🎯",
};

/**
 * Displays applicable remedies for a muscle+state combination.
 * Shows nothing if no remedies exist for the current state.
 */
export default function RemedyPanel({ muscleId, muscleStates }) {
  if (!muscleId) return null;

  const parsed = fromMuscleId(muscleId);
  if (!parsed?.slug) return null;

  const currentState = muscleStates?.[muscleId]?.state;
  if (!currentState || currentState === "normal") return null;

  const remedies = getRemedies(parsed.slug, currentState);
  if (remedies.length === 0) {
    const stateLabel = currentState === "tight" ? "stretch or release" : "activation or strengthening";
    return (
      <div className="mt-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3">
        <div className="text-xs font-medium uppercase tracking-wide text-teal-400/60">
          Remedies (L3)
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-zinc-500">
          No specific remedies seeded yet for this muscle's <span className="text-zinc-400">{currentState}</span> state.
          General recommendation: targeted {stateLabel} work for this area.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-teal-900/50 bg-teal-950/20 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-teal-400/90">
        Remedies (L3)
      </div>
      <p className="mt-1 text-[11px] leading-snug text-zinc-500">
        Suggested interventions for the current <span className="text-zinc-400">{currentState}</span> state.
      </p>

      <div className="mt-2 space-y-2.5">
        {remedies.map((rem) => (
          <div key={rem.id} className="rounded-lg border border-zinc-700/50 bg-zinc-900/50 p-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-zinc-300">
                {TYPE_ICONS[rem.type] || ""} {rem.title}
              </span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                {rem.type}
              </span>
            </div>

            <ol className="mt-1.5 space-y-1">
              {rem.steps.map((step) => (
                <li key={step.order} className="flex gap-2 text-[11px] leading-snug">
                  <span className="mt-px flex-shrink-0 text-zinc-600">{step.order}.</span>
                  <span className="text-zinc-400">{step.instruction}</span>
                </li>
              ))}
            </ol>

            {rem.caution && (
              <p className="mt-1.5 text-[10px] text-amber-500/80">
                ⚠ {rem.caution}
              </p>
            )}

            {rem.tags?.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {rem.tags.map((t) => (
                  <span key={t} className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-600">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
