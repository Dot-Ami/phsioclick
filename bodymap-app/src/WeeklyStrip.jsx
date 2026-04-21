// Stage 02-A.5 / U5 — WeeklyStrip for the Plan screen.
// Spec: stages/02a-ux-foundation/output/screens.md "Plan screen / This Week".
//
// Renders Mon..Sun with a check / today / rest marker per day. Tapping today
// expands the underlying weekly plan inline. The weekly distribution comes
// from buildWeeklyPlan + distributeWeekDays in src/lib/session-plan.js.
//
// Stage 02-B will replace `isPast` heuristic with real adherence data from F6.

import { useMemo, useState } from "react";
import { Calendar, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  buildWeeklyPlan,
  distributeWeekDays,
} from "./lib/session-plan";
import { getMuscleLabel } from "./muscle-data";

function dayClass(day) {
  if (day.isToday) return "border-brand bg-brand/15 text-zinc-100";
  if (day.isRest) return "border-zinc-800 bg-zinc-950 text-zinc-500";
  if (day.isPast) return "border-zinc-800 bg-zinc-900/60 text-zinc-400";
  return "border-zinc-800 bg-zinc-900/60 text-zinc-200";
}

export default function WeeklyStrip({ muscleStates }) {
  const [expanded, setExpanded] = useState(false);

  const weekly = useMemo(() => buildWeeklyPlan(muscleStates), [muscleStates]);
  const layout = useMemo(() => distributeWeekDays(weekly), [weekly]);

  const hasPlan = weekly.length > 0;

  return (
    <article
      aria-label="This week"
      className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-4"
    >
      <header className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-zinc-400">
          <Calendar size={14} aria-hidden="true" />
          This week
        </p>
        {hasPlan ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-caption text-brand hover:text-brand-hover"
            aria-expanded={expanded}
          >
            {expanded ? "Hide weekly plan" : "Open weekly plan"}
            {expanded ? (
              <ChevronUp size={14} aria-hidden="true" />
            ) : (
              <ChevronDown size={14} aria-hidden="true" />
            )}
          </button>
        ) : null}
      </header>

      <ol className="mt-3 grid grid-cols-7 gap-1.5">
        {layout.map((day) => (
          <li key={day.dayName} className="text-center">
            <div
              className={`flex h-16 flex-col items-center justify-center gap-1 rounded-10 border text-caption transition-colors duration-150 ease-out ${dayClass(day)}`}
              aria-label={`${day.dayName}: ${
                day.isToday ? "today" : day.isRest ? "rest" : day.label || ""
              }`}
            >
              <span className="text-micro uppercase tracking-wide">
                {day.dayName}
              </span>
              {day.isToday ? (
                <span className="text-caption font-semibold">Today</span>
              ) : day.isRest ? (
                <span className="text-caption text-zinc-500">Rest</span>
              ) : day.isPast ? (
                <Check size={14} aria-hidden="true" className="text-brand" />
              ) : (
                <span className="text-caption text-zinc-300">Planned</span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {!hasPlan ? (
        <p className="mt-3 text-caption text-zinc-500">
          Mark a few muscles as tight or weak on the Body screen and we&apos;ll
          sketch this week for you.
        </p>
      ) : null}

      {expanded && hasPlan ? (
        <ul className="mt-4 space-y-3">
          {weekly.map((day) => (
            <li
              key={day.label}
              className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3"
            >
              <p className="text-body-lg text-zinc-100">{day.label}</p>
              <ul className="mt-2 space-y-1 text-body text-zinc-300">
                {day.muscleIds.slice(0, 6).map((id) => (
                  <li key={id} className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand" />
                    {getMuscleLabel(id) || id}
                  </li>
                ))}
                {day.muscleIds.length > 6 ? (
                  <li className="text-caption text-zinc-500">
                    +{day.muscleIds.length - 6} more
                  </li>
                ) : null}
              </ul>
              {day.type === "mobility" ? (
                <p className="mt-2 text-caption text-zinc-500">
                  Foam rolling, stretching, light movement. No heavy loading.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
