// Stage 02-A.5 / U4 — Plain-language verb lookup for the Learn layer.
// See stages/02a-ux-foundation/output/learn-layer-spec.md
// "Generation templates / whatItDoes template" + "ACTION_VERBS" example.
//
// Keys are the action keys used in src/data/muscle-mechanics.js
// (primaryActionKeys), e.g. "elbow-flexion", "shoulder-extension". Values are
// {verb, joint, descriptor} so the auto-generator can compose a second-person
// sentence: "{verb} your {joint}" + an optional descriptor on tightness/weakness.
//
// Educational tone only. No clinical jargon. Forbidden words list in
// learn-layer-spec.md §Copywriting style guide is enforced at lint time.

const VERB_TABLE = {
  // ── Elbow ────────────────────────────────────────────────────────────
  "elbow-flexion": { verb: "bends", joint: "elbow" },
  "elbow-extension": { verb: "straightens", joint: "elbow" },
  "forearm-supination": {
    verb: "rotates",
    joint: "forearm",
    descriptor: "so your palm faces up",
  },
  "forearm-pronation": {
    verb: "rotates",
    joint: "forearm",
    descriptor: "so your palm faces down",
  },

  // ── Shoulder (glenohumeral) ──────────────────────────────────────────
  "shoulder-flexion": {
    verb: "lifts",
    joint: "arm",
    descriptor: "forward and overhead",
  },
  "shoulder-extension": {
    verb: "pulls",
    joint: "arm",
    descriptor: "behind your body",
  },
  "shoulder-abduction": {
    verb: "lifts",
    joint: "arm",
    descriptor: "out to the side",
  },
  "shoulder-adduction": {
    verb: "pulls",
    joint: "arm",
    descriptor: "back toward your body",
  },
  "shoulder-internal-rotation": {
    verb: "rotates",
    joint: "arm",
    descriptor: "inward",
  },
  "shoulder-external-rotation": {
    verb: "rotates",
    joint: "arm",
    descriptor: "outward",
  },
  "horizontal-adduction": {
    verb: "brings",
    joint: "arm",
    descriptor: "across your chest",
  },
  "horizontal-abduction": {
    verb: "opens",
    joint: "arm",
    descriptor: "out wide from your chest",
  },

  // ── Scapula ──────────────────────────────────────────────────────────
  "scapular-elevation": {
    verb: "lifts",
    joint: "shoulder blade",
    descriptor: "toward your ear (a shrug)",
  },
  "scapular-depression": {
    verb: "pulls",
    joint: "shoulder blade",
    descriptor: "down away from your ear",
  },
  "scapular-retraction": {
    verb: "squeezes",
    joint: "shoulder blade",
    descriptor: "back toward your spine",
  },
  "scapular-protraction": {
    verb: "slides",
    joint: "shoulder blade",
    descriptor: "forward around your ribs",
  },
  "scapular-upward-rotation": {
    verb: "rotates",
    joint: "shoulder blade",
    descriptor: "up so you can reach overhead",
  },
  "scapular-downward-rotation": {
    verb: "rotates",
    joint: "shoulder blade",
    descriptor: "down toward your hip",
  },
  "scapular-stabilization": {
    verb: "steadies",
    joint: "shoulder blade",
  },

  // ── Spine / trunk ────────────────────────────────────────────────────
  "trunk-flexion": {
    verb: "bends",
    joint: "trunk",
    descriptor: "forward (like a sit-up)",
  },
  "trunk-extension": {
    verb: "arches",
    joint: "trunk",
    descriptor: "backward",
  },
  "trunk-rotation": { verb: "rotates", joint: "trunk" },
  "trunk-lateral-flexion": {
    verb: "bends",
    joint: "trunk",
    descriptor: "side to side",
  },
  "spinal-extension": { verb: "straightens", joint: "spine" },
  "spinal-flexion": { verb: "rounds", joint: "spine" },
  "spinal-stabilization": { verb: "steadies", joint: "spine" },
  "anti-flexion-bracing": {
    verb: "braces",
    joint: "spine",
    descriptor: "so it doesn't fold under load",
  },
  "lateral-flexion": {
    verb: "bends",
    joint: "trunk",
    descriptor: "to the side",
  },
  "core-compression": {
    verb: "draws",
    joint: "midsection",
    descriptor: "in tight",
  },
  "compression-of-abdomen": {
    verb: "draws",
    joint: "midsection",
    descriptor: "in tight",
  },
  "anterior-pelvic-tilt": {
    verb: "tips",
    joint: "pelvis",
    descriptor: "forward",
  },
  "posterior-pelvic-tilt": {
    verb: "tucks",
    joint: "pelvis",
    descriptor: "under",
  },
  "ipsilateral-rotation": { verb: "rotates", joint: "trunk" },
  "contralateral-rotation": { verb: "rotates", joint: "trunk" },

  // ── Hip ──────────────────────────────────────────────────────────────
  "hip-flexion": {
    verb: "lifts",
    joint: "thigh",
    descriptor: "toward your chest",
  },
  "hip-extension": {
    verb: "drives",
    joint: "thigh",
    descriptor: "back behind you",
  },
  "hip-abduction": {
    verb: "lifts",
    joint: "leg",
    descriptor: "out to the side",
  },
  "hip-adduction": {
    verb: "pulls",
    joint: "leg",
    descriptor: "toward your other leg",
  },
  "hip-internal-rotation": {
    verb: "rotates",
    joint: "thigh",
    descriptor: "inward",
  },
  "hip-external-rotation": {
    verb: "rotates",
    joint: "thigh",
    descriptor: "outward",
  },
  "hip-hiking": {
    verb: "lifts",
    joint: "hip",
    descriptor: "up on one side",
  },
  "pelvic-stabilization": {
    verb: "steadies",
    joint: "pelvis",
    descriptor: "when you stand on one leg",
  },

  // ── Knee ─────────────────────────────────────────────────────────────
  "knee-flexion": { verb: "bends", joint: "knee" },
  "knee-extension": { verb: "straightens", joint: "knee" },
  "patellar-stabilization": {
    verb: "steadies",
    joint: "kneecap",
    descriptor: "as your knee bends and straightens",
  },

  // ── Ankle / foot ─────────────────────────────────────────────────────
  "ankle-plantarflexion": {
    verb: "points",
    joint: "foot",
    descriptor: "down (like pressing a gas pedal)",
  },
  "ankle-dorsiflexion": {
    verb: "lifts",
    joint: "foot",
    descriptor: "up toward your shin",
  },
  "foot-inversion": {
    verb: "rolls",
    joint: "foot",
    descriptor: "inward",
  },
  "foot-eversion": {
    verb: "rolls",
    joint: "foot",
    descriptor: "outward",
  },

  // ── Cervical / neck ──────────────────────────────────────────────────
  "cervical-flexion": {
    verb: "tucks",
    joint: "chin",
    descriptor: "toward your chest",
  },
  "cervical-extension": {
    verb: "tilts",
    joint: "head",
    descriptor: "back",
  },
  "cervical-rotation": { verb: "turns", joint: "head" },

  // ── Wrist / forearm ──────────────────────────────────────────────────
  "wrist-flexion": {
    verb: "bends",
    joint: "wrist",
    descriptor: "so your palm moves toward your forearm",
  },
  "wrist-extension": {
    verb: "bends",
    joint: "wrist",
    descriptor: "so the back of your hand moves toward your forearm",
  },
  "rib-elevation": {
    verb: "lifts",
    joint: "ribs",
    descriptor: "as you breathe in",
  },
  "forced-expiration": {
    verb: "helps you push",
    joint: "air out",
    descriptor: "with force",
  },
};

export const ACTION_VERBS = VERB_TABLE;

/**
 * Convert a primary action key (e.g. "hip-flexion") into a plain-language
 * sentence fragment. Falls back gracefully if the key isn't seeded.
 */
export function describeAction(actionKey) {
  const entry = VERB_TABLE[actionKey];
  if (!entry) return null;
  const head = `${entry.verb} your ${entry.joint}`;
  return entry.descriptor ? `${head} ${entry.descriptor}` : head;
}

/**
 * Convert a free-text action label like "Hip flexion" into a verb fragment by
 * normalizing to a kebab-case key and looking up describeAction(). This lets
 * the auto-generator consume both `primaryActionKeys` (mechanics module) and
 * `primaryActions` (muscle-data SUB_MUSCLES.actions free strings).
 */
export function describeActionLabel(label) {
  if (!label) return null;
  const key = label
    .toLowerCase()
    .replace(/[()/]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (VERB_TABLE[key]) return describeAction(key);
  for (const seed of Object.keys(VERB_TABLE)) {
    if (key.startsWith(seed) || seed.startsWith(key)) return describeAction(seed);
  }
  return null;
}
