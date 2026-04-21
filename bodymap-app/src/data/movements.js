/**
 * L4 movement catalog — named exercises with phase-based muscle recruitment.
 *
 * CONVENTIONS:
 * - `muscles` array uses SUB_MUSCLES base IDs (no -l/-r).
 * - `role`: primary (main mover), secondary (significant assist), tertiary (stabilizer).
 * - `phases`: array of phase names where the muscle is active (e.g. "eccentric", "concentric").
 * - Each movement has a `pattern` tag for grouping (push, pull, hinge, squat, etc.).
 * - Bump MOVEMENTS_SCHEMA_VERSION when removing or renaming keys.
 */

export const MOVEMENTS_SCHEMA_VERSION = 1;

/**
 * @typedef {Object} MuscleRecruitment
 * @property {string} muscleBaseId - SUB_MUSCLES base ID
 * @property {'primary'|'secondary'|'tertiary'} role
 * @property {string[]} phases - e.g. ['concentric', 'eccentric']
 */

/**
 * @typedef {Object} Movement
 * @property {string} id
 * @property {string} name
 * @property {string} pattern - push, pull, hinge, squat, rotation, carry
 * @property {string[]} joints - joint IDs from joints.js
 * @property {MuscleRecruitment[]} muscles
 * @property {string} [notes]
 */

/** @type {Movement[]} */
export const MOVEMENTS = [
  {
    id: "mov-bench-press",
    name: "Barbell Bench Press",
    pattern: "push",
    joints: ["joint-gh", "joint-elbow"],
    muscles: [
      { muscleBaseId: "pec-major", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "pec-upper", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "pec-lower", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "anterior-delt", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "triceps-lateral", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "triceps-medial", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "triceps-long", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "serratus-ant", role: "tertiary", phases: ["concentric"] },
      { muscleBaseId: "lateral-delt", role: "tertiary", phases: ["eccentric"] },
      { muscleBaseId: "biceps-short", role: "tertiary", phases: ["eccentric"] },
    ],
    notes: "Flat bench; incline shifts emphasis to upper pec and anterior delt.",
  },
  {
    id: "mov-barbell-squat",
    name: "Barbell Back Squat",
    pattern: "squat",
    joints: ["joint-hip", "joint-knee", "joint-ankle"],
    muscles: [
      { muscleBaseId: "rectus-femoris", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "vastus-lateralis", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "vastus-medialis", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "glute-max", role: "primary", phases: ["concentric"] },
      { muscleBaseId: "glute-med", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "adductor-magnus", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "erector-spinae", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "gastrocnemius", role: "tertiary", phases: ["eccentric", "concentric"] },
      { muscleBaseId: "rectus-abdominis", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "transverse-abdominis", role: "tertiary", phases: ["concentric", "eccentric"] },
    ],
    notes: "Depth and stance width shift emphasis between quads, glutes, and adductors.",
  },
  {
    id: "mov-deadlift",
    name: "Conventional Deadlift",
    pattern: "hinge",
    joints: ["joint-hip", "joint-knee", "joint-spine-lumbar"],
    muscles: [
      { muscleBaseId: "glute-max", role: "primary", phases: ["concentric"] },
      { muscleBaseId: "biceps-femoris", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "semitendinosus", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "erector-spinae", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "rectus-femoris", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "vastus-lateralis", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "latissimus-dorsi", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "upper-trap", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "wrist-flexors", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "transverse-abdominis", role: "tertiary", phases: ["concentric", "eccentric"] },
    ],
    notes: "Sumo shifts emphasis to adductors and quads.",
  },

  {
    id: "mov-overhead-press",
    name: "Overhead Press (Barbell)",
    pattern: "push",
    joints: ["joint-gh", "joint-elbow", "joint-scapula"],
    muscles: [
      { muscleBaseId: "anterior-delt", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "lateral-delt", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "triceps-lateral", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "triceps-medial", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "triceps-long", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "pec-upper", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "upper-trap", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "serratus-ant", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "lower-trap", role: "tertiary", phases: ["concentric"] },
    ],
    notes: "Standing variation engages core stabilizers significantly more than seated.",
  },

  {
    id: "mov-barbell-row",
    name: "Barbell Bent-Over Row",
    pattern: "pull",
    joints: ["joint-gh", "joint-elbow", "joint-scapula"],
    muscles: [
      { muscleBaseId: "latissimus-dorsi", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "rhomboid-major", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "middle-trap", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "posterior-delt", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "biceps-long", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "biceps-short", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "brachialis", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "erector-spinae", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "wrist-flexors", role: "tertiary", phases: ["concentric", "eccentric"] },
    ],
    notes: "Grip width and torso angle shift emphasis between lats and upper-back retractors.",
  },

  {
    id: "mov-pull-up",
    name: "Pull-Up / Lat Pulldown",
    pattern: "pull",
    joints: ["joint-gh", "joint-elbow"],
    muscles: [
      { muscleBaseId: "latissimus-dorsi", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "teres-major", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "biceps-long", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "biceps-short", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "brachialis", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "posterior-delt", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "lower-trap", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "infraspinatus", role: "tertiary", phases: ["eccentric"] },
      { muscleBaseId: "wrist-flexors", role: "tertiary", phases: ["concentric", "eccentric"] },
    ],
    notes: "Chin-up (supinated grip) increases biceps contribution; wide grip emphasizes lats.",
  },

  {
    id: "mov-lunge",
    name: "Walking Lunge",
    pattern: "squat",
    joints: ["joint-hip", "joint-knee", "joint-ankle"],
    muscles: [
      { muscleBaseId: "rectus-femoris", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "vastus-lateralis", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "vastus-medialis", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "glute-max", role: "primary", phases: ["concentric"] },
      { muscleBaseId: "glute-med", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "adductor-magnus", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "adductor-longus", role: "secondary", phases: ["eccentric"] },
      { muscleBaseId: "gastrocnemius", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "rectus-abdominis", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "transverse-abdominis", role: "tertiary", phases: ["concentric", "eccentric"] },
    ],
    notes: "Rear-foot elevated (Bulgarian) variant increases stretch on rear-leg hip flexors.",
  },

  {
    id: "mov-romanian-deadlift",
    name: "Romanian Deadlift",
    pattern: "hinge",
    joints: ["joint-hip", "joint-spine-lumbar"],
    muscles: [
      { muscleBaseId: "biceps-femoris", role: "primary", phases: ["eccentric", "concentric"] },
      { muscleBaseId: "semitendinosus", role: "primary", phases: ["eccentric", "concentric"] },
      { muscleBaseId: "semimembranosus", role: "primary", phases: ["eccentric", "concentric"] },
      { muscleBaseId: "glute-max", role: "primary", phases: ["concentric"] },
      { muscleBaseId: "erector-spinae", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "adductor-magnus", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "latissimus-dorsi", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "wrist-flexors", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "transverse-abdominis", role: "tertiary", phases: ["concentric", "eccentric"] },
    ],
    notes: "Emphasizes eccentric hamstring loading more than conventional deadlift.",
  },

  {
    id: "mov-hip-thrust",
    name: "Barbell Hip Thrust",
    pattern: "hinge",
    joints: ["joint-hip"],
    muscles: [
      { muscleBaseId: "glute-max", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "glute-med", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "biceps-femoris", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "semitendinosus", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "adductor-magnus", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "rectus-abdominis", role: "tertiary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "transverse-abdominis", role: "tertiary", phases: ["concentric", "eccentric"] },
    ],
    notes: "Peak glute activation at full hip extension; keep ribs down to avoid lumbar hyperextension.",
  },

  {
    id: "mov-face-pull",
    name: "Face Pull (Cable / Band)",
    pattern: "pull",
    joints: ["joint-gh", "joint-scapula"],
    muscles: [
      { muscleBaseId: "posterior-delt", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "infraspinatus", role: "primary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "teres-minor", role: "primary", phases: ["concentric"] },
      { muscleBaseId: "middle-trap", role: "secondary", phases: ["concentric", "eccentric"] },
      { muscleBaseId: "rhomboid-major", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "lower-trap", role: "secondary", phases: ["concentric"] },
      { muscleBaseId: "lateral-delt", role: "tertiary", phases: ["concentric"] },
    ],
    notes: "External rotation at peak contraction targets rotator cuff; excellent for posture correction.",
  },
];

/**
 * Get a movement by ID.
 */
export function getMovement(movementId) {
  return MOVEMENTS.find((m) => m.id === movementId) || null;
}

/**
 * List all movements matching a pattern.
 */
export function getMovementsByPattern(pattern) {
  return MOVEMENTS.filter((m) => m.pattern === pattern);
}

/**
 * For a given movement, return the recruitment map keyed by base ID.
 * @returns {Map<string, MuscleRecruitment>}
 */
export function getRecruitmentMap(movementId) {
  const mov = getMovement(movementId);
  if (!mov) return new Map();
  return new Map(mov.muscles.map((m) => [m.muscleBaseId, m]));
}
