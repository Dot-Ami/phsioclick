// Stage 02-A.5 / U4 — Compact log form for the Muscle slide-out's Log sub-tab.
// Spec: stages/02a-ux-foundation/output/screens.md "Log sub-tab".
//
// Pre-fills `originRegion` to the selected muscle. Captures a smaller subset of
// the legacy log form fields (sensation, intensity, movement, notes). The full
// form remains available on the legacy Today / Body screens until U-Phase 1
// retires it.

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { getMuscleLabel } from "./muscle-data";

const SENSATION_TYPES = [
  "tight",
  "sharp pain",
  "dull ache",
  "pinching",
  "clicking/popping",
  "weakness",
  "numbness/tingling",
  "nothing/fine",
  "restricted range",
];

const PHASE_OPTIONS = ["before movement", "during movement", "after movement"];

const EMPTY = {
  sensationType: "tight",
  intensity: 4,
  movement: "",
  phase: "during movement",
  notes: "",
};

export default function MuscleQuickLog({ muscleId, onSave }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(EMPTY);
  }, [muscleId]);

  const label = useMemo(
    () => (muscleId ? getMuscleLabel(muscleId) : ""),
    [muscleId],
  );

  if (!muscleId) {
    return (
      <p className="text-caption text-zinc-500">
        Select a muscle to log a sensation.
      </p>
    );
  }

  const handleSave = () => {
    onSave?.({
      ...form,
      originRegion: muscleId,
      sensationRegion: muscleId,
      timestamp: new Date().toISOString(),
    });
    setForm((prev) => ({ ...prev, notes: "", intensity: Math.max(2, prev.intensity - 1) }));
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        handleSave();
      }}
    >
      <p className="text-caption text-zinc-400">
        Logging for <span className="text-zinc-200">{label}</span>.
      </p>

      <label className="block">
        <span className="block text-caption text-zinc-400">Sensation</span>
        <select
          value={form.sensationType}
          onChange={(e) => setForm((p) => ({ ...p, sensationType: e.target.value }))}
          className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-100"
        >
          {SENSATION_TYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="block text-caption text-zinc-400">
          Intensity: <span className="tabular-nums text-zinc-200">{form.intensity}</span>
        </span>
        <input
          type="range"
          min={0}
          max={10}
          value={form.intensity}
          onChange={(e) => setForm((p) => ({ ...p, intensity: Number(e.target.value) }))}
          className="mt-1 w-full"
        />
      </label>

      <label className="block">
        <span className="block text-caption text-zinc-400">Phase</span>
        <select
          value={form.phase}
          onChange={(e) => setForm((p) => ({ ...p, phase: e.target.value }))}
          className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-100"
        >
          {PHASE_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="block text-caption text-zinc-400">Movement / context</span>
        <input
          type="text"
          value={form.movement}
          onChange={(e) => setForm((p) => ({ ...p, movement: e.target.value }))}
          placeholder="e.g. Squat, walking, sitting"
          className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-100 placeholder:text-zinc-600"
        />
      </label>

      <label className="block">
        <span className="block text-caption text-zinc-400">Notes</span>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          className="mt-1 w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-100"
        />
      </label>

      <button
        type="submit"
        disabled={!form.movement.trim()}
        className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-caption font-semibold text-zinc-950 transition-colors duration-150 ease-out hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save size={14} aria-hidden="true" />
        Save log
      </button>
    </form>
  );
}
