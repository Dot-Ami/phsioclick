import { fromMuscleId, getMuscle, getMuscleLabel } from "./muscle-data";
import { getMuscleMechanics } from "./data/muscle-mechanics";
import { JOINTS } from "./data/joints";

function formatTokenKey(key) {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Read-only L0: joints crossed, action tokens, functional antagonists/synergists (same side).
 */
export default function MuscleMechanicsPanel({ muscleId }) {
  if (!muscleId) return null;

  const mech = getMuscleMechanics(muscleId);
  const parsed = fromMuscleId(muscleId);
  const sideChar = parsed?.side === "left" ? "l" : parsed?.side === "right" ? "r" : null;

  if (!mech) {
    const m = getMuscle(muscleId);
    const hint =
      m && !m.isSubMuscle
        ? "Pick a specific sub-muscle in the dropdown (e.g. long head) for joint-level mechanics where available."
        : "We have not seeded L0 data for this muscle yet.";
    return (
      <div className="mt-3 rounded-lg border border-zinc-700/80 bg-zinc-950/50 p-3">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Mechanics layer (L0)</div>
        <p className="mt-1 text-xs text-zinc-500">{hint}</p>
      </div>
    );
  }

  const labelWithSide = (baseSubId) =>
    sideChar ? getMuscleLabel(`${baseSubId}-${sideChar}`) : formatTokenKey(baseSubId);

  const antagonistLabels = mech.antagonistSubIds.map(labelWithSide);
  const synergistLabels = (mech.synergistSubIds || []).map(labelWithSide);
  const jointLabels = mech.jointIds.map((jid) => JOINTS[jid]?.label || jid);

  return (
    <div className="mt-3 rounded-lg border border-emerald-900/50 bg-emerald-950/25 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-emerald-400/90">Mechanics layer (L0)</div>
      <p className="mt-1 text-[11px] leading-snug text-zinc-500">
        Structured joint and agonist/antagonist data (pilot). Expands as we seed more muscles.
      </p>

      <div className="mt-2">
        <div className="text-xs text-zinc-400">Joints crossed</div>
        <ul className="mt-1 space-y-0.5 text-xs text-zinc-300">
          {jointLabels.map((j) => (
            <li key={j}>• {j}</li>
          ))}
        </ul>
      </div>

      <div className="mt-2">
        <div className="text-xs text-zinc-400">Primary action keys</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {mech.primaryActionKeys.map((k) => (
            <span key={k} className="rounded bg-zinc-800/90 px-2 py-0.5 text-[11px] text-zinc-300">
              {formatTokenKey(k)}
            </span>
          ))}
        </div>
      </div>

      {mech.planeTags?.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-zinc-400">Plane tags</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {mech.planeTags.map((p) => (
              <span key={p} className="rounded bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-400">
                {formatTokenKey(p)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2">
        <div className="text-xs text-zinc-400">Functional antagonists (same side)</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {antagonistLabels.map((lab) => (
            <span key={lab} className="rounded border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[11px] text-zinc-300">
              {lab}
            </span>
          ))}
        </div>
      </div>

      {synergistLabels.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-zinc-400">Synergists (same side)</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {synergistLabels.map((lab) => (
              <span key={lab} className="rounded bg-zinc-800/70 px-2 py-0.5 text-[11px] text-zinc-300">
                {lab}
              </span>
            ))}
          </div>
        </div>
      )}

      {mech.notes ? <p className="mt-2 text-xs text-zinc-500">{mech.notes}</p> : null}
    </div>
  );
}
