// Stage 02-A.5 / U8 — StreakBadge.
// Replaces the U2 "—" header placeholder with the live streak.
// Spec: stages/02a-ux-foundation/output/gamification-spec.md §2.
//
// Cold-start: muted "Day 0" pill so the layout stays locked.
// Tap behaviour: opens a small popover with current/longest/last-active.

import { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";

function colorClass(current) {
  if (current >= 7) return "border-brand/50 bg-brand/15 text-brand";
  if (current >= 3) return "border-state-tight/40 bg-state-tight/10 text-state-tight";
  if (current >= 1) return "border-zinc-700 bg-zinc-900 text-zinc-200";
  return "border-zinc-800 bg-zinc-900 text-zinc-500";
}

export default function StreakBadge({ streak }) {
  const safe = streak || { current: 0, longest: 0, lastActiveDate: null };
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = Math.max(0, Math.floor(safe.current || 0));
  const longest = Math.max(0, Math.floor(safe.longest || 0));
  const label = current === 0 ? "Day 0" : `${current}d`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          current === 0
            ? "Daily streak: not started yet"
            : `Daily streak: ${current} day${current === 1 ? "" : "s"}`
        }
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-caption transition-colors duration-150 ease-out ${colorClass(current)}`}
      >
        <Flame size={14} aria-hidden="true" />
        <span className="tabular-nums">{label}</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Streak detail"
          className="absolute right-0 z-40 mt-2 w-56 rounded-10 border border-zinc-800 bg-zinc-900/95 p-3 text-caption text-zinc-300 shadow-elev-2"
        >
          <p className="text-body text-zinc-100">
            Current streak: <span className="tabular-nums">{current}</span>
          </p>
          <p className="mt-1 text-zinc-400">
            Longest: <span className="tabular-nums">{longest}</span> day
            {longest === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-zinc-500">
            Last activity: {safe.lastActiveDate || "—"}
          </p>
          <p className="mt-2 text-micro text-zinc-500">
            Any meaningful action in a calendar day counts. No nags if you miss
            one — pick it back up whenever.
          </p>
        </div>
      )}
    </div>
  );
}
