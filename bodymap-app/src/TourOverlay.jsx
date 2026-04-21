// Stage 02-A.5 / U7 — TourOverlay.
// Per-tab one-step coachmark, default-on for first visit to each tab.
// Spec: stages/02a-ux-foundation/output/onboarding-flow.md §"Per-tab tour overlays".
//
// Parent (BodyMapApp) owns:
//   data.onboarding.tourSeen: { today, body, plan, progress }
// Parent renders <TourOverlay tab="today" copy={…} onDismiss={…} /> when the
// active tab's flag is false. Settings → "Replay tour" re-arms all four flags.
//
// v1 anchoring: fixed, pointer-friendly card near the bottom of the viewport
// (top on Today). Future iteration can portal-anchor against
// data-tour-anchor="..." nodes; v1 keeps it visible without measuring DOM.
//
// Reduced motion: fades only — no slide / scale when prefers-reduced-motion.

import { useEffect } from "react";
import { Lightbulb, X } from "lucide-react";

const COPY = {
  today: {
    eyebrow: "Today",
    title: "Your daily home base.",
    body: "Your Body Balance Score, today's session plan, and what's bothering you. Calibration takes a few sessions.",
    placement: "top",
  },
  body: {
    eyebrow: "Body",
    title: "Tap a muscle to log how it feels.",
    body: "Tight and weak flags color the atlas. Open a muscle for plain-language guidance and remedies.",
    placement: "bottom",
  },
  plan: {
    eyebrow: "Plan",
    title: "This is where you set goals and build sessions.",
    body: "Your goals decide what shows up on Today. Generate a session from your flagged muscles in one tap.",
    placement: "bottom",
  },
  progress: {
    eyebrow: "Progress",
    title: "How you're trending over time.",
    body: "Symmetry, regions worked, and recent activity — with deeper history under the accordion.",
    placement: "bottom",
  },
};

export default function TourOverlay({ tab, onDismiss }) {
  const copy = COPY[tab];

  useEffect(() => {
    if (!copy) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onDismiss?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [copy, onDismiss]);

  if (!copy) return null;

  const positionClasses =
    copy.placement === "top"
      ? "top-20 sm:top-24"
      : "bottom-20 sm:bottom-24";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-3"
      style={{ pointerEvents: "none" }}
    >
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={`tour-${tab}-title`}
        className={`pointer-events-auto absolute ${positionClasses} w-full max-w-sm rounded-14 border border-brand/40 bg-zinc-950/95 p-4 shadow-elev-2 backdrop-blur transition-opacity duration-200 ease-entrance motion-reduce:transition-none`}
      >
        <div className="flex items-start gap-3">
          <Lightbulb
            size={20}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-brand"
          />
          <div className="flex-1">
            <p className="text-micro uppercase tracking-wide text-brand">
              {copy.eyebrow}
            </p>
            <p
              id={`tour-${tab}-title`}
              className="mt-0.5 text-body-lg font-semibold text-zinc-100"
            >
              {copy.title}
            </p>
            <p className="mt-1 text-caption text-zinc-300">{copy.body}</p>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-10 bg-brand px-3 py-1.5 text-caption font-semibold text-zinc-950 transition-colors duration-150 ease-out hover:bg-brand-hover"
              >
                Got it
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss tour tip"
            className="rounded-full border border-zinc-800 bg-zinc-900 p-1 text-zinc-400 transition-colors duration-150 ease-out hover:text-zinc-100"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
