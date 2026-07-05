import { fromMuscleId } from "./muscle-data";

const STATES = [
  { value: "tight", label: "Tight", color: "bg-rose-500/20 text-rose-300 border-rose-600/50", activeColor: "bg-rose-500/30 border-rose-500 text-rose-200" },
  { value: "weak", label: "Weak", color: "bg-amber-500/20 text-amber-300 border-amber-600/50", activeColor: "bg-amber-500/30 border-amber-500 text-amber-200" },
  { value: "normal", label: "Normal", color: "bg-emerald-500/20 text-emerald-300 border-emerald-600/50", activeColor: "bg-emerald-500/30 border-emerald-500 text-emerald-200" },
];

/**
 * Compact panel for marking a muscle's current state (tight / weak / normal).
 * State is stored as { [muscleId]: { state, updatedAt } } in the parent.
 */
export default function MuscleStatePanel({ muscleId, muscleStates, onSetState }) {
  if (!muscleId) return null;

  const parsed = fromMuscleId(muscleId);
  if (!parsed?.slug) return null;

  const current = muscleStates[muscleId];
  const currentValue = current?.state || null;
  const updatedAt = current?.updatedAt;

  const handleClick = (value) => {
    if (value === currentValue) {
      onSetState(muscleId, null);
    } else {
      onSetState(muscleId, value);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-zinc-700/60 bg-zinc-900/40 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        Muscle state (L2)
      </div>
      <p className="mt-1 text-[11px] leading-snug text-zinc-500">
        Mark this muscle as tight, weak, or normal to track balance.
      </p>

      <div className="mt-2 flex gap-1.5">
        {STATES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleClick(s.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              currentValue === s.value ? s.activeColor : `${s.color} opacity-60 hover:opacity-100`
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {updatedAt && (
        <p className="mt-1.5 text-[10px] text-zinc-600">
          Last updated: {new Date(updatedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
