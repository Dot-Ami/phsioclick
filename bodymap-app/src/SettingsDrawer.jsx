// Stage 02-A.5 / U7 — SettingsDrawer.
// Re-homes the U2 overflow-menu items (Export / Import / Clinical report) and
// adds two onboarding controls: "Replay tour" + "Reset onboarding".
//
// All handlers are owned by BodyMapApp; this component is purely presentational.
// Existing handler names are unchanged — we just call them from a new surface.

import { useEffect, useRef } from "react";
import {
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

export default function SettingsDrawer({
  open,
  onClose,
  onExport,
  onImport,
  onClinicalReport,
  onReplayTour,
  onResetOnboarding,
}) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-drawer-title"
        className="flex h-full w-full max-w-sm flex-col border-l border-zinc-800 bg-zinc-950 shadow-elev-2 transition-opacity duration-200 ease-entrance motion-reduce:transition-none"
      >
        <header className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <h2 id="settings-drawer-title" className="text-h2 text-zinc-100">
            Settings
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 transition-colors duration-150 ease-out hover:text-zinc-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <Section title="Data">
            <Row
              icon={<Download size={18} aria-hidden="true" />}
              label="Export JSON"
              description="Download all logs, assessments, and goals."
              onClick={() => {
                onExport?.();
                onClose?.();
              }}
            />
            <RowFile
              icon={<Upload size={18} aria-hidden="true" />}
              label="Import JSON"
              description="Restore from a previous export."
              onChange={(event) => {
                onImport?.(event);
                onClose?.();
              }}
            />
            <Row
              icon={<FileText size={18} aria-hidden="true" />}
              label="Clinical report"
              description="Markdown snapshot to share with a professional."
              onClick={() => {
                onClinicalReport?.();
                onClose?.();
              }}
            />
          </Section>

          <Section title="Onboarding">
            <Row
              icon={<Sparkles size={18} aria-hidden="true" />}
              label="Replay tour"
              description="Re-arm the tip on each tab."
              onClick={() => {
                onReplayTour?.();
                onClose?.();
              }}
            />
            <Row
              icon={<RotateCcw size={18} aria-hidden="true" />}
              label="Reset onboarding"
              description="Show the welcome wizard again."
              onClick={() => {
                onResetOnboarding?.();
                onClose?.();
              }}
            />
          </Section>

          <p className="rounded-10 border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-caption text-zinc-400">
            This app is educational and self-coaching only. It does not provide
            medical advice.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-1.5">
      <p className="text-micro uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <div className="rounded-14 border border-zinc-800 bg-zinc-900/60">
        {children}
      </div>
    </section>
  );
}

function Row({ icon, label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 border-b border-zinc-800 px-3 py-2.5 text-left transition-colors duration-150 ease-out last:border-b-0 hover:bg-zinc-900"
    >
      <span className="mt-0.5 text-brand">{icon}</span>
      <span className="flex-1">
        <span className="block text-body text-zinc-100">{label}</span>
        <span className="block text-caption text-zinc-500">{description}</span>
      </span>
    </button>
  );
}

function RowFile({ icon, label, description, onChange }) {
  return (
    <label className="flex w-full cursor-pointer items-start gap-3 border-b border-zinc-800 px-3 py-2.5 text-left transition-colors duration-150 ease-out last:border-b-0 hover:bg-zinc-900">
      <span className="mt-0.5 text-brand">{icon}</span>
      <span className="flex-1">
        <span className="block text-body text-zinc-100">{label}</span>
        <span className="block text-caption text-zinc-500">{description}</span>
      </span>
      <input
        type="file"
        accept="application/json"
        className="hidden"
        onChange={onChange}
      />
    </label>
  );
}
