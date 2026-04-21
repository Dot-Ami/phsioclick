// Stage 02-A.5 / U8 — MilestoneToast.
// Queue-based 4s celebration toast.
// Spec: stages/02a-ux-foundation/output/gamification-spec.md §3.
//
// Parent passes a `queue` array of milestone ids. The toast renders the head
// of the queue, auto-dismisses after 4s (paused on hover/focus), then calls
// onDismiss(id) so the parent can shift it.
//
// Reduced motion: when prefers-reduced-motion is set, the toast fades only —
// no slide / scale.

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Compass,
  Flag,
  Flame,
  Gauge,
  Map as MapIcon,
  Ruler,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";

const ICONS = {
  target: Target,
  "check-circle-2": CheckCircle2,
  ruler: Ruler,
  flag: Flag,
  trophy: Trophy,
  flame: Flame,
  compass: Compass,
  map: MapIcon,
  gauge: Gauge,
  sparkles: Sparkles,
  award: Award,
  "trending-up": TrendingUp,
};

const TOAST_MS = 4000;
const HAPTIC_MS = 200;

export default function MilestoneToast({ queue = [], catalog = [], onDismiss }) {
  const head = queue[0] || null;
  const meta = useMemo(() => {
    if (!head) return null;
    return catalog.find((m) => m.id === head.id) || null;
  }, [head, catalog]);

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!head || paused) return undefined;
    const timer = setTimeout(() => onDismiss?.(head.id), TOAST_MS);
    return () => clearTimeout(timer);
  }, [head, paused, onDismiss]);

  useEffect(() => {
    if (!head) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(HAPTIC_MS);
      } catch {
        /* ignore */
      }
    }
  }, [head]);

  if (!head) return null;

  const Icon = (meta && ICONS[meta.icon]) || Sparkles;

  return (
    <div
      className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-3 sm:bottom-auto sm:right-6 sm:top-20 sm:justify-end sm:px-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        role="status"
        aria-live="polite"
        className="relative w-full max-w-sm rounded-14 border border-brand/40 bg-zinc-950/95 p-4 shadow-elev-2 backdrop-blur transition-all duration-400 ease-celebration motion-reduce:transition-opacity motion-reduce:duration-200"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
            <Icon size={20} aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-body-lg font-semibold text-zinc-100">
              {meta?.label || "Milestone unlocked"}
            </p>
            <p className="mt-0.5 text-caption text-zinc-300">
              {meta?.description || "That's progress worth noticing."}
            </p>
            {queue.length > 1 ? (
              <p className="mt-1 text-micro text-zinc-500">
                +{queue.length - 1} more
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onDismiss?.(head.id)}
            aria-label="Dismiss milestone"
            className="rounded-full border border-zinc-800 bg-zinc-900 p-1 text-zinc-400 transition-colors duration-150 ease-out hover:text-zinc-100"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
