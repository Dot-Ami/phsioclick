// Stage 02-A.5 / U4 — Learn sub-tab content for the Body slide-out.
// Spec: stages/02a-ux-foundation/output/learn-layer-spec.md
//
// Renderer behaviour:
//   - Lazy: only the selected muscle is computed (one call per open).
//   - Memoized per muscle base id for the session.
//   - Prefers LEARN_OVERRIDES when present; falls back to auto-generated content
//     from L0 mechanics + L1 edges + L3 remedies.
//   - "Why this matters for your goal" only renders when an active goal targets
//     this muscleId. F5 goal schema isn't live until Stage 02-B; the prop is
//     plumbed but no goals are passed in U4. (TODO(stage-02-b))
//
// Style:
//   - Re-skin via tokens (rounded-14, brand teal, body-lg, caption).
//   - Second-person voice; copy is enforced by the override file + templates.

import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { fromMuscleId, getMuscle, getMuscleLabel, SUB_MUSCLES } from "./muscle-data";
import { getMuscleMechanics } from "./data/muscle-mechanics";
import { getEdgesForMuscle } from "./data/relationship-edges";
import { getAllRemediesForMuscle, getRemedies } from "./data/remedies";
import { JOINTS } from "./data/joints";
import { describeAction, describeActionLabel } from "./data/action-verbs";
import { getLearnOverride } from "./data/learn-overrides";

const SUB_TO_PARENT = (() => {
  const map = new Map();
  for (const [parent, subs] of Object.entries(SUB_MUSCLES)) {
    for (const sub of subs) map.set(sub.id, parent);
  }
  return map;
})();

function joinList(items) {
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function jointPlain(jointId) {
  const j = JOINTS[jointId];
  if (!j) return null;
  const head = j.label.split(" (")[0];
  return head.toLowerCase().replace(/^(\w)/, (m) => m);
}

function muscleLabelPlain(baseId) {
  const label = getMuscleLabel(`${baseId}-l`)?.replace(/ \(.\)$/, "");
  return label || baseId;
}

function generateDescription(baseId, sub) {
  const mech = getMuscleMechanics(baseId);
  const niceLabel = (sub?.label || muscleLabelPlain(baseId)).replace(/\s*\(.+?\)\s*$/, "");
  const lcLabel = niceLabel.toLowerCase();

  let roleClause = "a muscle in your body";
  if (mech) {
    const joints = (mech.jointIds || []).map(jointPlain).filter(Boolean);
    if (joints.length === 1) {
      const verbs = (mech.primaryActionKeys || [])
        .map((key) => describeAction(key))
        .filter(Boolean)
        .slice(0, 1);
      const verbPhrase = verbs[0] || `acts on your ${joints[0]}`;
      roleClause = `a muscle that ${verbPhrase}`;
    } else if (joints.length > 1) {
      roleClause = `a muscle that crosses your ${joinList(joints)}`;
    }
  }

  const sentences = [`Your ${lcLabel} is ${roleClause}.`];
  if (sub?.notes) {
    sentences.push(sub.notes);
  } else if (mech?.notes) {
    sentences.push(mech.notes);
  } else {
    sentences.push("It contributes to everyday movement and balance through this region.");
  }
  return sentences.join(" ");
}

function generateWhatItDoes(baseId, sub) {
  const mech = getMuscleMechanics(baseId);
  const out = [];

  if (mech) {
    const joints = (mech.jointIds || []).map(jointPlain).filter(Boolean);
    const fallbackJoint = joints[0] || "joint";
    for (const key of mech.primaryActionKeys || []) {
      const phrase = describeAction(key);
      if (phrase) {
        out.push(phrase.charAt(0).toUpperCase() + phrase.slice(1));
        continue;
      }
      out.push(`Helps move your ${fallbackJoint}`);
    }
  }

  if (out.length === 0 && sub?.actions) {
    for (const action of sub.actions.slice(0, 4)) {
      const phrase = describeActionLabel(action);
      if (phrase) {
        out.push(phrase.charAt(0).toUpperCase() + phrase.slice(1));
      } else {
        out.push(action);
      }
    }
  }

  const seen = new Set();
  return out.filter((line) => {
    const key = line.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
}

function generateWhenItActsUp(baseId) {
  const { inbound, outbound } = getEdgesForMuscle(baseId);

  const compensationOut = outbound.find(
    (e) => e.kind === "compensation" || e.kind === "load-chain",
  );
  const tightTail = compensationOut
    ? ` Often when this is tight, your ${muscleLabelPlain(compensationOut.to).toLowerCase()} starts working harder to make up for it.`
    : "";

  const tight =
    "If this is tight, you might notice stiffness in the area, a feeling of pulling during certain movements, or compensation showing up nearby." +
    tightTail;

  const inhibitionIn = inbound.find(
    (e) => e.kind === "inhibition" || e.kind === "compensation",
  );
  const weakTail = inhibitionIn
    ? ` This often shows up as your ${muscleLabelPlain(inhibitionIn.from).toLowerCase()} taking over the job.`
    : "";

  const weak =
    "If this is weak, you might notice that nearby muscles tire quickly during movements this one should help with." +
    weakTail;

  return { tight, weak };
}

function generateHowToTest(baseId) {
  const candidates = [
    ...getRemedies(baseId, "tight"),
    ...getRemedies(baseId, "weak"),
    ...getAllRemediesForMuscle(baseId),
  ];

  const simplest = candidates.find(
    (r) => r.type === "mobilize" || r.type === "activate" || r.type === "stretch",
  );

  if (simplest && simplest.steps?.[0]?.instruction) {
    const first = simplest.steps[0].instruction.trim();
    return `Try this: ${first}`;
  }

  return "Try this: move the joint this muscle controls through its full range and notice how each side compares. Tightness often shows up as a clear difference between left and right.";
}

const cache = new Map();

function getLearnContent(baseId) {
  if (!baseId) return null;
  if (cache.has(baseId)) return cache.get(baseId);

  const override = getLearnOverride(baseId);
  if (override) {
    const content = { source: "override", muscleId: baseId, ...override };
    cache.set(baseId, content);
    return content;
  }

  const parent = SUB_TO_PARENT.get(baseId);
  const sub = parent ? SUB_MUSCLES[parent]?.find((s) => s.id === baseId) : null;

  const content = {
    source: "auto",
    muscleId: baseId,
    description: generateDescription(baseId, sub),
    whatItDoes: generateWhatItDoes(baseId, sub),
    whenItActsUp: generateWhenItActsUp(baseId),
    howToTest: generateHowToTest(baseId),
  };
  cache.set(baseId, content);
  return content;
}

/**
 * @param {{ muscleId: string, goals?: Array<{id:string,label:string,targetMuscleId:string,progressPct?:number}>, onOpenGoal?: (goalId:string) => void, onOpenTechnical?: () => void }} props
 */
export default function LearnPanel({ muscleId, goals = [], onOpenGoal, onOpenTechnical }) {
  const baseId = useMemo(() => {
    if (!muscleId) return null;
    return fromMuscleId(muscleId)?.slug || null;
  }, [muscleId]);

  const content = useMemo(() => getLearnContent(baseId), [baseId]);

  const muscle = muscleId ? getMuscle(muscleId) : null;
  const niceLabel = (muscle?.label || muscleLabelPlain(baseId || "this muscle"))
    .replace(/ \(.\)$/, "");

  const goalHook = useMemo(() => {
    if (!baseId) return null;
    return goals.find((g) => g.targetMuscleId === baseId) || null;
  }, [goals, baseId]);

  if (!muscleId) {
    return (
      <div className="rounded-14 border border-zinc-800 bg-zinc-900/40 p-4 text-caption text-zinc-500">
        Tap a muscle on the atlas to see what it does and how to test it.
      </div>
    );
  }

  if (!content) {
    return (
      <div className="rounded-14 border border-zinc-800 bg-zinc-900/40 p-4 text-caption text-zinc-500">
        We don&apos;t have Learn content for {niceLabel} yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-body-lg leading-relaxed text-zinc-100">
        {content.description}
      </p>

      <section aria-labelledby="learn-what-it-does" className="space-y-1.5">
        <h4
          id="learn-what-it-does"
          className="text-caption uppercase tracking-wide text-zinc-400"
        >
          What it does
        </h4>
        {content.whatItDoes.length > 0 ? (
          <ul className="space-y-1 text-body text-zinc-200">
            {content.whatItDoes.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-brand" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-zinc-400">
            We&apos;re still seeding the action data for this muscle.
          </p>
        )}
      </section>

      <section aria-labelledby="learn-when-it-acts-up" className="space-y-2">
        <h4
          id="learn-when-it-acts-up"
          className="text-caption uppercase tracking-wide text-zinc-400"
        >
          When it acts up
        </h4>
        <div className="rounded-10 border border-state-tight/40 bg-state-tight/10 p-3 text-body text-zinc-100">
          {content.whenItActsUp.tight}
        </div>
        <div className="rounded-10 border border-state-weak/40 bg-state-weak/10 p-3 text-body text-zinc-100">
          {content.whenItActsUp.weak}
        </div>
      </section>

      <section aria-labelledby="learn-how-to-test" className="space-y-1.5">
        <h4
          id="learn-how-to-test"
          className="text-caption uppercase tracking-wide text-zinc-400"
        >
          How to test it yourself
        </h4>
        <p className="rounded-10 border border-brand/30 bg-brand/5 p-3 text-body text-zinc-100">
          {content.howToTest}
        </p>
      </section>

      {goalHook ? (
        <section aria-labelledby="learn-goal-hook" className="space-y-1.5">
          <h4
            id="learn-goal-hook"
            className="text-caption uppercase tracking-wide text-zinc-400"
          >
            Why it matters for your goal
          </h4>
          <button
            type="button"
            onClick={() => onOpenGoal?.(goalHook.id)}
            className="flex w-full items-center justify-between gap-3 rounded-10 border border-brand/40 bg-brand/10 p-3 text-left text-body text-zinc-100 transition-colors duration-150 ease-out hover:bg-brand/15"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={16} aria-hidden="true" className="text-brand" />
              <span>
                {goalHook.label}
                {typeof goalHook.progressPct === "number" ? (
                  <span className="ml-2 text-caption text-zinc-400">
                    {goalHook.progressPct}% complete
                  </span>
                ) : null}
              </span>
            </span>
            <ArrowRight size={16} aria-hidden="true" className="text-brand" />
          </button>
        </section>
      ) : null}

      {onOpenTechnical ? (
        <button
          type="button"
          onClick={onOpenTechnical}
          className="inline-flex items-center gap-1 text-caption text-brand hover:text-brand-hover"
        >
          Learn more (technical view)
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
