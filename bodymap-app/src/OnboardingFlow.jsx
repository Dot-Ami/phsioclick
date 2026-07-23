// Stage 02-A.5 / U7 — Onboarding flow.
// Six-step first-run wizard per stages/02a-ux-foundation/output/onboarding-flow.md.
//
// Triggered by BodyMapApp when data.onboarding.completedAt === null.
// Skippable on every step. On finish or skip, parent stamps completedAt and
// the chosen intent (or null on skip) into the persisted onboarding block.
//
// Step 4 reuses the existing IntakeWizard from SessionPlanner.jsx; its
// completion pipes through onSetMuscleState the same way Plan does.
//
// Tokens-only styling (rounded-14/20, brand teal, state.tight/weak/balanced,
// shadow-elev-2, transition-duration-200/400). Reduced-motion: the sheet
// enters via fade only; no slide / scale.

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  HeartPulse,
  Layers,
  Scale,
  Sparkles,
  Target,
  Bandage,
  X,
} from "lucide-react";
import { IntakeWizard } from "./SessionPlanner";
import { suggestFirstGoal } from "./lib/suggestFirstGoal";

const INTENT_OPTIONS = [
  {
    id: "tight-area",
    label: "I have a tight or sore area I want to address",
    Icon: Target,
  },
  {
    id: "balance-training",
    label: "I want to balance my training — left vs right, push vs pull",
    Icon: Scale,
  },
  {
    id: "rehab",
    label: "I'm rehabbing or working around an old issue",
    Icon: Bandage,
  },
  {
    id: "learn",
    label: "I just want to learn how my body works",
    Icon: BookOpen,
  },
];

const INTENT_INTRO = {
  "tight-area":
    "Let's map what's bothering you. We'll ask a few quick questions, then mark those areas on your body.",
  "balance-training":
    "Let's get a baseline of your training. We'll ask about your main lifts and where you feel asymmetric.",
  rehab:
    "Let's set the context. Remember: this is not a medical tool. If anything is acute or worsening, see a professional.",
  learn: null,
};

const LAYER_ROWS = [
  { key: "L0", label: "Movement & mechanics", note: "what each muscle does" },
  { key: "L1", label: "Relationships", note: "how regions affect each other" },
  { key: "L2", label: "State", note: "what's tight, weak, or balanced" },
  { key: "L3", label: "Remedies", note: "what to do about it" },
  { key: "L4", label: "Movements", note: "which muscles a lift recruits" },
  { key: "L5", label: "Plan", note: "the whole picture, today" },
];

export default function OnboardingFlow({
  open,
  onSkip,
  onComplete,
  onSetMuscleState,
  onCreateGoal,
  muscleStates = {},
  entries = [],
}) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState(null);
  const [intakeDone, setIntakeDone] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onSkip?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onSkip]);

  const suggestion = useMemo(
    () => suggestFirstGoal(intent, muscleStates, entries),
    [intent, muscleStates, entries],
  );

  if (!open) return null;

  const goPrev = () => setStep((n) => Math.max(0, n - 1));
  const goNext = () => setStep((n) => n + 1);

  const handlePickIntent = (id) => {
    setIntent(id);
    if (id === "learn") {
      setStep(4);
    } else {
      setStep(3);
    }
  };

  const handleIntakeComplete = (newStates) => {
    if (onSetMuscleState && newStates) {
      // Stage 02-B / F1 — same intake-wizard source tag as the Plan
      // tab path so onboarding flips show up identically in stateChanges.
      for (const [muscleId, val] of Object.entries(newStates)) {
        onSetMuscleState(muscleId, val.state, "intake-wizard");
      }
    }
    setIntakeDone(true);
    setStep(4);
  };

  const handleSetGoal = () => {
    if (suggestion?.regionId || suggestion?.kind === "learn" || suggestion?.kind === "balance") {
      onCreateGoal?.({
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `g-${Date.now()}`,
        muscleId: suggestion.regionId || null,
        kind: suggestion.kind,
        rationale: suggestion.rationale,
        createdAt: new Date().toISOString(),
      });
    }
    setStep(5);
  };

  const handleFinish = () => {
    onComplete?.({ intent });
  };

  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 px-2 pb-2 pt-6 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleSkip();
      }}
    >
      <section className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-20 border border-zinc-800 bg-zinc-950 shadow-elev-2 transition-opacity duration-200 ease-entrance motion-reduce:transition-none">
        <header className="flex items-center justify-between gap-3 border-b border-zinc-800 px-5 py-3">
          <p
            id="onboarding-title"
            className="flex items-center gap-2 text-caption uppercase tracking-wide text-zinc-400"
          >
            <Sparkles size={14} aria-hidden="true" className="text-brand" />
            Welcome
          </p>
          <button
            type="button"
            onClick={handleSkip}
            aria-label="Skip the tour"
            className="rounded-full border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 transition-colors duration-150 ease-out hover:text-zinc-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="flex shrink-0 items-center gap-1.5 px-5 pt-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ease-standard ${
                i <= step ? "bg-brand" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 0 && (
            <Step1Welcome onNext={goNext} onSkip={handleSkip} />
          )}
          {step === 1 && (
            <Step2BodyModel onNext={goNext} onPrev={goPrev} onSkip={handleSkip} />
          )}
          {step === 2 && (
            <Step3IntentPicker
              onPick={handlePickIntent}
              onPrev={goPrev}
              onSkip={handleSkip}
            />
          )}
          {step === 3 && (
            <Step4Intake
              intent={intent}
              onComplete={handleIntakeComplete}
              onSkip={() => {
                setIntakeDone(false);
                setStep(4);
              }}
              onPrev={() => setStep(2)}
              onSkipAll={handleSkip}
            />
          )}
          {step === 4 && (
            <Step5Goal
              suggestion={suggestion}
              intakeDone={intakeDone}
              onSetGoal={handleSetGoal}
              onSkipGoal={() => setStep(5)}
              onPrev={() => setStep(intent === "learn" ? 2 : 3)}
              onSkipAll={handleSkip}
            />
          )}
          {step === 5 && <Step6Done onFinish={handleFinish} />}
        </div>
      </section>
    </div>
  );
}

function PrimaryButton({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-10 bg-brand px-4 py-2 text-body font-semibold text-zinc-950 transition-colors duration-150 ease-out hover:bg-brand-hover"
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 rounded-10 border border-zinc-800 bg-zinc-900 px-4 py-2 text-body text-zinc-200 transition-colors duration-150 ease-out hover:text-zinc-100"
    >
      {children}
    </button>
  );
}

function Step1Welcome({ onNext, onSkip }) {
  return (
    <div className="space-y-4 text-center">
      <HeartPulse
        size={64}
        aria-hidden="true"
        className="mx-auto text-brand"
        strokeWidth={1.5}
      />
      <h2 className="text-h1 text-zinc-100">Welcome to Dot Health Hub.</h2>
      <p className="text-body-lg text-zinc-300">
        This is a personal training tool for understanding how your body feels
        and how you&apos;re trending over time.
      </p>
      <p className="mx-auto max-w-md rounded-10 border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-caption text-zinc-400">
        It is not a medical tool. Everything here is educational and
        self-coaching only.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <PrimaryButton onClick={onNext}>
          Get started <ArrowRight size={16} aria-hidden="true" />
        </PrimaryButton>
        <button
          type="button"
          onClick={onSkip}
          className="text-caption text-zinc-500 hover:text-zinc-300"
        >
          Skip the tour
        </button>
      </div>
    </div>
  );
}

function Step2BodyModel({ onNext, onPrev, onSkip }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-zinc-100">
        <Layers size={28} aria-hidden="true" className="text-brand" />
        <h2 className="text-h2 text-zinc-100">Your body, six layers deep.</h2>
      </div>
      <p className="text-body text-zinc-300">
        This app stacks six layers of intelligence on a high-resolution
        anatomical atlas:
      </p>
      <ul className="space-y-1.5">
        {LAYER_ROWS.map((row) => (
          <li
            key={row.key}
            className="flex items-baseline gap-2 rounded-10 border border-zinc-800 bg-zinc-900/60 px-3 py-2"
          >
            <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-micro uppercase tracking-wide text-brand">
              {row.key}
            </span>
            <span className="text-body text-zinc-100">{row.label}</span>
            <span className="ml-auto text-caption text-zinc-500">{row.note}</span>
          </li>
        ))}
      </ul>
      <p className="text-caption text-zinc-400">
        You won&apos;t need to remember the layers. We surface what&apos;s
        relevant when you need it.
      </p>
      <div className="flex items-center justify-between gap-2 pt-2">
        <GhostButton onClick={onPrev}>
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </GhostButton>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-caption text-zinc-500 hover:text-zinc-300"
          >
            Skip
          </button>
          <PrimaryButton onClick={onNext}>
            Got it <ArrowRight size={16} aria-hidden="true" />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Step3IntentPicker({ onPick, onPrev, onSkip }) {
  return (
    <div className="space-y-4">
      <h2 className="text-h2 text-zinc-100">What brought you here today?</h2>
      <p className="text-caption text-zinc-400">
        Pick the closest match — we&apos;ll tune the next steps to fit. You can
        always change direction later.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {INTENT_OPTIONS.map((opt) => {
          const Icon = opt.Icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPick(opt.id)}
              className="flex items-start gap-3 rounded-14 border border-zinc-800 bg-zinc-900/60 px-3 py-3 text-left transition-colors duration-150 ease-out hover:border-brand hover:bg-zinc-900"
            >
              <Icon
                size={20}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-brand"
              />
              <span className="text-body text-zinc-100">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-2 pt-2">
        <GhostButton onClick={onPrev}>
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </GhostButton>
        <button
          type="button"
          onClick={onSkip}
          className="text-caption text-zinc-500 hover:text-zinc-300"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function Step4Intake({ intent, onComplete, onSkip, onPrev, onSkipAll }) {
  const intro = INTENT_INTRO[intent];

  return (
    <div className="space-y-4">
      <h2 className="text-h2 text-zinc-100">Quick intake.</h2>
      {intro ? (
        <p className="rounded-10 border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-body text-zinc-300">
          {intro}
        </p>
      ) : null}
      <IntakeWizard
        onComplete={(newStates) => onComplete(newStates)}
        onCancel={onSkip}
      />
      <div className="flex items-center justify-between gap-2 pt-2">
        <GhostButton onClick={onPrev}>
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </GhostButton>
        <button
          type="button"
          onClick={onSkipAll}
          className="text-caption text-zinc-500 hover:text-zinc-300"
        >
          Skip the rest of the tour
        </button>
      </div>
    </div>
  );
}

function Step5Goal({ suggestion, intakeDone, onSetGoal, onSkipGoal, onPrev, onSkipAll }) {
  const hasSuggestion =
    suggestion && (suggestion.regionId || suggestion.kind !== "explore");
  return (
    <div className="space-y-4">
      <h2 className="text-h2 text-zinc-100">Set your first goal.</h2>
      <p className="text-body text-zinc-300">
        {hasSuggestion
          ? "Based on what you told us, we suggest:"
          : "We don't have enough signal to suggest a goal yet — that's totally fine."}
      </p>
      <div className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-start gap-2">
          <Target size={20} aria-hidden="true" className="mt-0.5 text-brand" />
          <p className="text-body-lg text-zinc-100">{suggestion.rationale}</p>
        </div>
        <p className="mt-3 text-caption text-zinc-500">
          Goals are how you&apos;ll see progress over time. You can change or
          remove this any time on Plan.
        </p>
        {!intakeDone ? (
          <p className="mt-2 text-caption text-zinc-500">
            (You skipped the intake — your goal will sharpen up as you flag
            muscles on Body.)
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <GhostButton onClick={onPrev}>
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </GhostButton>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSkipGoal}
            className="text-caption text-zinc-500 hover:text-zinc-300"
          >
            Skip for now
          </button>
          {hasSuggestion ? (
            <PrimaryButton onClick={onSetGoal}>
              Set this goal <Check size={16} aria-hidden="true" />
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={onSkipGoal}>
              Continue <ArrowRight size={16} aria-hidden="true" />
            </PrimaryButton>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onSkipAll}
        className="block w-full text-center text-caption text-zinc-600 hover:text-zinc-400"
      >
        Skip the rest of the tour
      </button>
    </div>
  );
}

function Step6Done({ onFinish }) {
  return (
    <div className="space-y-4 text-center">
      <Sparkles
        size={64}
        aria-hidden="true"
        className="mx-auto text-brand"
        strokeWidth={1.5}
      />
      <h2 className="text-h1 text-zinc-100">You&apos;re all set.</h2>
      <p className="text-body-lg text-zinc-300">
        Your Today screen will guide you from here. We&apos;ll show you a quick
        tour the first time you visit each tab — tap &ldquo;Got it&rdquo; to
        dismiss them.
      </p>
      <p className="mx-auto max-w-md rounded-10 border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-caption text-zinc-400">
        A reminder: this is a self-coaching tool. It helps you notice patterns,
        not diagnose them.
      </p>
      <div className="flex items-center justify-center pt-2">
        <PrimaryButton onClick={onFinish}>
          Take me to Today <ArrowRight size={16} aria-hidden="true" />
        </PrimaryButton>
      </div>
    </div>
  );
}
