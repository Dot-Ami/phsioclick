import { useState } from "react";
import { MOVEMENTS, getRecruitmentMap } from "./data/movements";
import { getMuscleLabel } from "./muscle-data";

const ROLE_COLORS = {
  primary: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-700/50", fill: "#ef4444" },
  secondary: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-700/50", fill: "#a855f7" },
  tertiary: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-700/50", fill: "#10b981" },
};

/**
 * Movement recruitment viewer — select a movement and see muscles by role.
 * Parent reads `recruitmentTint` to overlay colors on the atlas.
 */
export default function MovementRecruitmentPanel({ onRecruitmentChange }) {
  const [selectedMovement, setSelectedMovement] = useState("");

  const handleChange = (e) => {
    const movId = e.target.value;
    setSelectedMovement(movId);
    if (!movId) {
      onRecruitmentChange?.(null);
      return;
    }
    const recruitment = getRecruitmentMap(movId);
    const tintMap = {};
    for (const [baseId, rec] of recruitment) {
      tintMap[baseId] = ROLE_COLORS[rec.role]?.fill || "#888";
    }
    onRecruitmentChange?.(tintMap);
  };

  const mov = MOVEMENTS.find((m) => m.id === selectedMovement);
  const grouped = { primary: [], secondary: [], tertiary: [] };
  if (mov) {
    for (const m of mov.muscles) {
      grouped[m.role]?.push(m);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-orange-900/50 bg-orange-950/20 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-orange-400/90">
        Movement Recruitment (L4)
      </div>
      <p className="mt-1 text-[11px] leading-snug text-zinc-500">
        Select a movement to see which muscles are recruited and how they tint on the atlas.
      </p>

      <select
        value={selectedMovement}
        onChange={handleChange}
        className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-orange-600"
      >
        <option value="">— Choose a movement —</option>
        {MOVEMENTS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.pattern})
          </option>
        ))}
      </select>

      {mov && (
        <div className="mt-2 space-y-2">
          {(["primary", "secondary", "tertiary"]).map((role) => {
            const muscles = grouped[role];
            if (!muscles || muscles.length === 0) return null;
            const rc = ROLE_COLORS[role];
            return (
              <div key={role}>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ background: rc.fill }}
                  />
                  <span className={`text-[11px] font-medium ${rc.text}`}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {muscles.map((m) => {
                    const label =
                      getMuscleLabel(`${m.muscleBaseId}-l`)?.replace(/ \(.\)$/, "") ||
                      m.muscleBaseId;
                    return (
                      <span
                        key={m.muscleBaseId}
                        className={`rounded border ${rc.border} ${rc.bg} px-2 py-0.5 text-[10px] ${rc.text}`}
                      >
                        {label}
                        {m.phases?.length > 0 && (
                          <span className="ml-1 text-zinc-600">
                            ({m.phases.join(", ")})
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {mov.notes && (
            <p className="text-[11px] text-zinc-500">{mov.notes}</p>
          )}

          <div className="flex items-center gap-3 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: ROLE_COLORS.primary.fill }} />
              Primary
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: ROLE_COLORS.secondary.fill }} />
              Secondary
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: ROLE_COLORS.tertiary.fill }} />
              Tertiary
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
