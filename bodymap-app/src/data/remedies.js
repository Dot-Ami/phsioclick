/**
 * L3 remedy module — structured interventions keyed by muscle base ID + state.
 *
 * CONVENTIONS:
 * - Keys are `${muscleBaseId}:${state}` (e.g. "gastrocnemius:tight").
 * - Each remedy has ordered steps, a type, optional caution, and optional URL.
 * - Steps are concise action instructions, not full program prescriptions.
 * - Bump REMEDIES_SCHEMA_VERSION when removing or renaming keys.
 */

export const REMEDIES_SCHEMA_VERSION = 1;

/**
 * @typedef {Object} RemedyStep
 * @property {number} order
 * @property {string} instruction
 */

/**
 * @typedef {Object} Remedy
 * @property {string} id
 * @property {string} muscleBaseId
 * @property {'tight'|'weak'|'normal'} forState
 * @property {'stretch'|'strengthen'|'mobilize'|'activate'|'release'} type
 * @property {string} title
 * @property {RemedyStep[]} steps
 * @property {string} [caution]
 * @property {string} [externalUrl]
 * @property {string[]} [tags]
 */

/** @type {Remedy[]} */
export const REMEDIES = [
  // ── Gastrocnemius ───────────────────────────────────────────────────
  {
    id: "rem-gastroc-tight-stretch",
    muscleBaseId: "gastrocnemius",
    forState: "tight",
    type: "stretch",
    title: "Wall calf stretch (knee straight)",
    steps: [
      { order: 1, instruction: "Face a wall, place hands at shoulder height." },
      { order: 2, instruction: "Step the target leg back 2–3 feet, keeping heel flat." },
      { order: 3, instruction: "Keep the back knee locked straight and lean hips forward until a stretch is felt in the calf." },
      { order: 4, instruction: "Hold 30–45 seconds; repeat 2–3 sets." },
    ],
    caution: "Avoid bouncing. Stop if Achilles pain is felt.",
    tags: ["ankle", "squat-prep"],
  },
  {
    id: "rem-gastroc-tight-release",
    muscleBaseId: "gastrocnemius",
    forState: "tight",
    type: "release",
    title: "Foam roll calves",
    steps: [
      { order: 1, instruction: "Sit on the floor, place foam roller under one calf." },
      { order: 2, instruction: "Cross the opposite leg on top for pressure." },
      { order: 3, instruction: "Roll slowly from ankle to below the knee for 60–90 seconds." },
      { order: 4, instruction: "Pause on tender spots for 20–30 seconds." },
    ],
    tags: ["ankle", "self-massage"],
  },

  // ── Glute max ───────────────────────────────────────────────────────
  {
    id: "rem-glutemax-weak-activate",
    muscleBaseId: "glute-max",
    forState: "weak",
    type: "activate",
    title: "Glute bridge with 2-second hold",
    steps: [
      { order: 1, instruction: "Lie supine, knees bent, feet flat on the floor." },
      { order: 2, instruction: "Squeeze glutes and lift hips until torso and thighs form a straight line." },
      { order: 3, instruction: "Hold the top for 2 seconds, focusing on glute contraction — not hamstrings." },
      { order: 4, instruction: "Lower slowly. 3 sets of 12–15 reps." },
    ],
    tags: ["hip", "activation"],
  },
  {
    id: "rem-glutemax-weak-strengthen",
    muscleBaseId: "glute-max",
    forState: "weak",
    type: "strengthen",
    title: "Hip thrust (barbell or bodyweight)",
    steps: [
      { order: 1, instruction: "Sit on the floor with upper back against a bench, knees bent." },
      { order: 2, instruction: "Drive through heels, extending hips to full lockout." },
      { order: 3, instruction: "Squeeze glutes hard at the top; avoid hyperextending the lumbar spine." },
      { order: 4, instruction: "Lower under control. 3 sets of 8–12 reps." },
    ],
    caution: "Keep ribs down to avoid lumbar hyperextension.",
    tags: ["hip", "strength"],
  },

  // ── Iliopsoas ───────────────────────────────────────────────────────
  {
    id: "rem-iliopsoas-tight-stretch",
    muscleBaseId: "iliopsoas",
    forState: "tight",
    type: "stretch",
    title: "Half-kneeling hip flexor stretch",
    steps: [
      { order: 1, instruction: "Kneel on the target leg, opposite foot flat in front." },
      { order: 2, instruction: "Tuck the pelvis (posterior tilt) to feel a stretch in the front of the hip." },
      { order: 3, instruction: "Gently lean forward while maintaining the tuck." },
      { order: 4, instruction: "Hold 30–45 seconds; repeat 2–3 sets per side." },
    ],
    caution: "Avoid lumbar extension — the stretch should be felt in the hip, not the low back.",
    tags: ["hip", "posture"],
  },

  // ── Upper trap ──────────────────────────────────────────────────────
  {
    id: "rem-uppertrap-tight-stretch",
    muscleBaseId: "upper-trap",
    forState: "tight",
    type: "stretch",
    title: "Seated upper trap stretch",
    steps: [
      { order: 1, instruction: "Sit tall, anchor the target-side hand under the chair seat." },
      { order: 2, instruction: "Gently tilt the head away from the target side." },
      { order: 3, instruction: "Apply light overpressure with the opposite hand on the temple." },
      { order: 4, instruction: "Hold 20–30 seconds; 2–3 sets." },
    ],
    tags: ["neck", "posture", "upper-cross"],
  },

  // ── Lower trap ──────────────────────────────────────────────────────
  {
    id: "rem-lowertrap-weak-strengthen",
    muscleBaseId: "lower-trap",
    forState: "weak",
    type: "strengthen",
    title: "Prone Y-raise",
    steps: [
      { order: 1, instruction: "Lie face down on a bench or the floor, arms overhead forming a Y." },
      { order: 2, instruction: "Lift arms by squeezing the lower traps, thumbs pointing up." },
      { order: 3, instruction: "Hold the top for 2–3 seconds." },
      { order: 4, instruction: "Lower slowly. 3 sets of 10–12 reps." },
    ],
    tags: ["shoulder", "scapular", "posture"],
  },

  // ── Pec minor ───────────────────────────────────────────────────────
  {
    id: "rem-pecminor-tight-stretch",
    muscleBaseId: "pec-minor",
    forState: "tight",
    type: "stretch",
    title: "Doorway pec stretch (low hand position)",
    steps: [
      { order: 1, instruction: "Stand in a doorway, place the forearm against the frame at about 45° below shoulder height." },
      { order: 2, instruction: "Step through with the same-side foot until a stretch is felt in the front of the chest/shoulder." },
      { order: 3, instruction: "Hold 30 seconds; 2–3 sets." },
    ],
    caution: "Avoid if anterior shoulder instability is present.",
    tags: ["posture", "upper-cross", "shoulder"],
  },

  // ── Erector spinae ──────────────────────────────────────────────────
  {
    id: "rem-erector-tight-mobilize",
    muscleBaseId: "erector-spinae",
    forState: "tight",
    type: "mobilize",
    title: "Cat-cow spinal mobilization",
    steps: [
      { order: 1, instruction: "Start on hands and knees, wrists under shoulders, knees under hips." },
      { order: 2, instruction: "Inhale and arch the spine (cow), lifting tailbone and chest." },
      { order: 3, instruction: "Exhale and round the spine (cat), tucking chin and pelvis." },
      { order: 4, instruction: "Move slowly through 10–15 cycles." },
    ],
    tags: ["spine", "warm-up"],
  },

  // ── Serratus anterior ──────────────────────────────────────────────
  {
    id: "rem-serratus-weak-strengthen",
    muscleBaseId: "serratus-ant",
    forState: "weak",
    type: "strengthen",
    title: "Push-up plus (scapular protraction)",
    steps: [
      { order: 1, instruction: "Assume a push-up position (knees or toes)." },
      { order: 2, instruction: "At the top of a push-up, push further by protracting the scapulae (rounding the upper back)." },
      { order: 3, instruction: "Hold 2 seconds, then retract back to neutral." },
      { order: 4, instruction: "3 sets of 10–12 reps." },
    ],
    tags: ["shoulder", "scapular"],
  },

  // ── Rectus abdominis ────────────────────────────────────────────────
  {
    id: "rem-abs-weak-strengthen",
    muscleBaseId: "rectus-abdominis",
    forState: "weak",
    type: "strengthen",
    title: "Dead bug",
    steps: [
      { order: 1, instruction: "Lie supine, arms straight up, knees at 90°." },
      { order: 2, instruction: "Brace the core and lower the opposite arm and leg toward the floor without arching the low back." },
      { order: 3, instruction: "Return to start and repeat on the other side." },
      { order: 4, instruction: "3 sets of 8–10 reps per side." },
    ],
    tags: ["core", "stabilization"],
  },

  // ── Anterior deltoid ─────────────────────────────────────────────
  {
    id: "rem-antdelt-tight-stretch",
    muscleBaseId: "anterior-delt",
    forState: "tight",
    type: "stretch",
    title: "Behind-back doorway stretch",
    steps: [
      { order: 1, instruction: "Stand in a doorway, reach the target arm behind you and grip the door frame at hip height." },
      { order: 2, instruction: "Turn your body away from the arm until a stretch is felt across the front of the shoulder." },
      { order: 3, instruction: "Hold 20–30 seconds; 2–3 sets." },
    ],
    caution: "Avoid if anterior shoulder instability is present.",
    tags: ["shoulder", "posture"],
  },

  // ── Posterior deltoid ─────────────────────────────────────────────
  {
    id: "rem-postdelt-weak-strengthen",
    muscleBaseId: "posterior-delt",
    forState: "weak",
    type: "strengthen",
    title: "Reverse pec-deck fly",
    steps: [
      { order: 1, instruction: "Sit facing the pad of a pec-deck machine, handles at shoulder height." },
      { order: 2, instruction: "With a slight bend in elbows, pull handles back by squeezing rear delts." },
      { order: 3, instruction: "Hold the peak contraction for 1–2 seconds." },
      { order: 4, instruction: "3 sets of 12–15 reps with controlled tempo." },
    ],
    tags: ["shoulder", "posture"],
  },

  // ── Upper trap (weak — complement existing tight entry) ──────────
  {
    id: "rem-uppertrap-weak-strengthen",
    muscleBaseId: "upper-trap",
    forState: "weak",
    type: "strengthen",
    title: "Barbell shrug with pause",
    steps: [
      { order: 1, instruction: "Stand holding a barbell at arms' length, shoulder-width grip." },
      { order: 2, instruction: "Shrug shoulders straight up toward ears." },
      { order: 3, instruction: "Hold the top for 2 seconds, squeezing the upper traps." },
      { order: 4, instruction: "Lower under control. 3 sets of 10–12 reps." },
    ],
    tags: ["neck", "upper-cross"],
  },

  // ── Pec major ────────────────────────────────────────────────────
  {
    id: "rem-pecmajor-tight-stretch",
    muscleBaseId: "pec-major",
    forState: "tight",
    type: "stretch",
    title: "Doorway pec stretch (high hand position)",
    steps: [
      { order: 1, instruction: "Stand in a doorway, place forearm against the frame at shoulder height or slightly above." },
      { order: 2, instruction: "Step through with the same-side foot until a stretch is felt across the chest." },
      { order: 3, instruction: "Hold 30 seconds; 2–3 sets each side." },
    ],
    tags: ["posture", "upper-cross", "chest"],
  },

  // ── Infraspinatus ────────────────────────────────────────────────
  {
    id: "rem-infraspinatus-weak-strengthen",
    muscleBaseId: "infraspinatus",
    forState: "weak",
    type: "strengthen",
    title: "Side-lying external rotation",
    steps: [
      { order: 1, instruction: "Lie on the non-target side, elbow of the target arm bent 90° and pinned to your side." },
      { order: 2, instruction: "Rotate the forearm upward (external rotation) against a light dumbbell." },
      { order: 3, instruction: "Lower under control. 3 sets of 12–15 reps." },
    ],
    caution: "Use light weight; this is a rotator cuff isolation exercise.",
    tags: ["shoulder", "rotator-cuff"],
  },

  // ── Subscapularis ────────────────────────────────────────────────
  {
    id: "rem-subscap-tight-release",
    muscleBaseId: "subscapularis",
    forState: "tight",
    type: "release",
    title: "Lacrosse ball subscapularis release",
    steps: [
      { order: 1, instruction: "Lie on your back, place a lacrosse ball between the inner edge of the scapula and the rib cage on the target side." },
      { order: 2, instruction: "Gently roll or hold pressure on tender spots for 30–60 seconds." },
      { order: 3, instruction: "Slowly move the arm through small arcs to mobilize under pressure." },
    ],
    caution: "Avoid excessive pressure; the subscapularis is deep and sensitive.",
    tags: ["shoulder", "rotator-cuff", "self-massage"],
  },

  // ── Glute medius ─────────────────────────────────────────────────
  {
    id: "rem-glutemed-weak-activate",
    muscleBaseId: "glute-med",
    forState: "weak",
    type: "activate",
    title: "Side-lying clamshell",
    steps: [
      { order: 1, instruction: "Lie on your side, knees bent at 45°, feet together." },
      { order: 2, instruction: "Keeping feet in contact, lift the top knee by rotating at the hip." },
      { order: 3, instruction: "Hold the top for 2 seconds, focusing on glute med contraction." },
      { order: 4, instruction: "3 sets of 15 reps. Add a mini-band for progression." },
    ],
    tags: ["hip", "activation", "single-leg"],
  },

  // ── Glute minimus ────────────────────────────────────────────────
  {
    id: "rem-glutemin-weak-activate",
    muscleBaseId: "glute-min",
    forState: "weak",
    type: "activate",
    title: "Banded side-lying hip abduction",
    steps: [
      { order: 1, instruction: "Lie on your side with a mini-band around both ankles." },
      { order: 2, instruction: "Keeping the leg straight, lift the top leg toward the ceiling (pure abduction)." },
      { order: 3, instruction: "Hold 1–2 seconds at the top. Lower slowly." },
      { order: 4, instruction: "3 sets of 12–15 reps per side." },
    ],
    tags: ["hip", "activation"],
  },

  // ── TFL ──────────────────────────────────────────────────────────
  {
    id: "rem-tfl-tight-release",
    muscleBaseId: "tfl",
    forState: "tight",
    type: "release",
    title: "Foam roll TFL / IT band",
    steps: [
      { order: 1, instruction: "Lie on your side with a foam roller under the outer hip, just below the hip bone." },
      { order: 2, instruction: "Roll slowly from the hip to mid-thigh for 60–90 seconds." },
      { order: 3, instruction: "Pause on tender spots for 20–30 seconds." },
    ],
    caution: "Avoid rolling directly on the IT band's bony insertion at the knee.",
    tags: ["hip", "self-massage"],
  },

  // ── Adductors ────────────────────────────────────────────────────
  {
    id: "rem-adductormag-tight-stretch",
    muscleBaseId: "adductor-magnus",
    forState: "tight",
    type: "stretch",
    title: "Wide-stance adductor rock-back",
    steps: [
      { order: 1, instruction: "Kneel on all fours, extend one leg straight out to the side." },
      { order: 2, instruction: "Rock hips back toward the heel of the bent leg." },
      { order: 3, instruction: "Hold the end range for 20–30 seconds; 2–3 sets per side." },
    ],
    tags: ["hip", "squat-prep"],
  },
  {
    id: "rem-adductorlong-tight-stretch",
    muscleBaseId: "adductor-longus",
    forState: "tight",
    type: "stretch",
    title: "Half-kneeling adductor stretch",
    steps: [
      { order: 1, instruction: "Kneel on one knee, extend the other leg straight to the side with foot flat." },
      { order: 2, instruction: "Shift hips laterally toward the extended leg until a groin stretch is felt." },
      { order: 3, instruction: "Hold 20–30 seconds; 2–3 sets." },
    ],
    tags: ["hip", "squat-prep"],
  },

  // ── Rectus femoris ───────────────────────────────────────────────
  {
    id: "rem-rectfem-tight-stretch",
    muscleBaseId: "rectus-femoris",
    forState: "tight",
    type: "stretch",
    title: "Couch stretch (rear-foot elevated)",
    steps: [
      { order: 1, instruction: "Kneel with back foot on a bench or wall behind you, front foot flat on the floor." },
      { order: 2, instruction: "Squeeze the glute on the kneeling side and tuck the pelvis (posterior tilt)." },
      { order: 3, instruction: "Hold 30–45 seconds; 2–3 sets per side." },
    ],
    caution: "Avoid lumbar extension — the stretch should be felt in the front of the thigh/hip.",
    tags: ["hip", "posture", "lower-cross"],
  },

  // ── Biceps femoris ───────────────────────────────────────────────
  {
    id: "rem-bicepsfem-tight-stretch",
    muscleBaseId: "biceps-femoris",
    forState: "tight",
    type: "stretch",
    title: "Supine hamstring stretch with strap",
    steps: [
      { order: 1, instruction: "Lie on your back, loop a strap or towel around one foot." },
      { order: 2, instruction: "Keep the knee straight and pull the leg toward vertical until a stretch is felt in the back of the thigh." },
      { order: 3, instruction: "Hold 30 seconds; 2–3 sets per side." },
    ],
    caution: "Distinguish muscle tightness from neural tension (sciatic). Reduce intensity if tingling occurs.",
    tags: ["hinge-prep", "chain-lower"],
  },

  // ── Vastus medialis ──────────────────────────────────────────────
  {
    id: "rem-vmo-weak-strengthen",
    muscleBaseId: "vastus-medialis",
    forState: "weak",
    type: "strengthen",
    title: "Terminal knee extension (TKE) with band",
    steps: [
      { order: 1, instruction: "Loop a resistance band behind the knee while standing. The band pulls the knee into flexion." },
      { order: 2, instruction: "From a slight knee bend (~20°), extend the knee fully against the band." },
      { order: 3, instruction: "Squeeze the VMO at full extension for 2 seconds." },
      { order: 4, instruction: "3 sets of 15 reps per side." },
    ],
    tags: ["knee", "rehab"],
  },

  // ── External oblique ─────────────────────────────────────────────
  {
    id: "rem-extoblique-weak-strengthen",
    muscleBaseId: "external-oblique",
    forState: "weak",
    type: "strengthen",
    title: "Side plank",
    steps: [
      { order: 1, instruction: "Lie on your side, propped on the elbow directly beneath the shoulder." },
      { order: 2, instruction: "Lift hips off the ground, forming a straight line from head to feet." },
      { order: 3, instruction: "Hold 20–30 seconds; build to 45 seconds. 2–3 sets per side." },
    ],
    tags: ["core", "stabilization"],
  },

  // ── Quadratus lumborum ───────────────────────────────────────────
  {
    id: "rem-ql-tight-stretch",
    muscleBaseId: "quadratus-lumborum",
    forState: "tight",
    type: "stretch",
    title: "Side-lying QL stretch over foam roller",
    steps: [
      { order: 1, instruction: "Lie on your side with a foam roller under the waist, bottom arm extended overhead." },
      { order: 2, instruction: "Let gravity create a lateral stretch through the QL and lateral trunk." },
      { order: 3, instruction: "Hold 30–45 seconds; 2 sets per side." },
    ],
    tags: ["low-back", "core"],
  },

  // ── Multifidus ───────────────────────────────────────────────────
  {
    id: "rem-multifidus-weak-activate",
    muscleBaseId: "multifidus",
    forState: "weak",
    type: "activate",
    title: "Bird dog (contralateral reach)",
    steps: [
      { order: 1, instruction: "Start on hands and knees, spine neutral." },
      { order: 2, instruction: "Extend the right arm and left leg simultaneously, keeping hips level." },
      { order: 3, instruction: "Hold 3–5 seconds at full extension, focusing on segmental spinal stability." },
      { order: 4, instruction: "Return and switch sides. 3 sets of 8–10 reps per side." },
    ],
    tags: ["core", "stabilization", "rehab"],
  },

  // ── Transverse abdominis ─────────────────────────────────────────
  {
    id: "rem-tva-weak-activate",
    muscleBaseId: "transverse-abdominis",
    forState: "weak",
    type: "activate",
    title: "Supine abdominal draw-in (vacuum)",
    steps: [
      { order: 1, instruction: "Lie on your back, knees bent, feet flat." },
      { order: 2, instruction: "Exhale fully and draw the navel toward the spine without moving the pelvis." },
      { order: 3, instruction: "Hold the contraction for 8–10 seconds while breathing shallowly." },
      { order: 4, instruction: "3 sets of 8–10 holds." },
    ],
    tags: ["core", "stabilization", "rehab"],
  },

  // ── Soleus ───────────────────────────────────────────────────────
  {
    id: "rem-soleus-tight-stretch",
    muscleBaseId: "soleus",
    forState: "tight",
    type: "stretch",
    title: "Wall calf stretch (knee bent)",
    steps: [
      { order: 1, instruction: "Face a wall, step the target leg back 1–2 feet." },
      { order: 2, instruction: "Bend the back knee while keeping the heel flat." },
      { order: 3, instruction: "Lean hips forward to deepen the stretch in the lower calf/Achilles region." },
      { order: 4, instruction: "Hold 30–45 seconds; 2–3 sets." },
    ],
    caution: "Stop if Achilles tendon pain is felt.",
    tags: ["ankle", "squat-prep"],
  },

  // ── Levator scapulae ─────────────────────────────────────────────
  {
    id: "rem-levscap-tight-stretch",
    muscleBaseId: "levator-scapulae",
    forState: "tight",
    type: "stretch",
    title: "Seated levator scapulae stretch",
    steps: [
      { order: 1, instruction: "Sit tall, anchor the target-side hand under the chair seat." },
      { order: 2, instruction: "Turn your head 45° toward the opposite side." },
      { order: 3, instruction: "Tuck chin and look toward the opposite armpit, applying light overpressure with the free hand." },
      { order: 4, instruction: "Hold 20–30 seconds; 2–3 sets." },
    ],
    tags: ["neck", "posture"],
  },

  // ── Sternocleidomastoid ──────────────────────────────────────────
  {
    id: "rem-scm-tight-stretch",
    muscleBaseId: "sternocleidomastoid",
    forState: "tight",
    type: "stretch",
    title: "Seated SCM stretch",
    steps: [
      { order: 1, instruction: "Sit tall, gently extend the neck (look up) and rotate the chin toward the target side." },
      { order: 2, instruction: "You should feel a stretch along the front/side of the neck on the opposite side." },
      { order: 3, instruction: "Hold 15–20 seconds; 2 sets per side." },
    ],
    caution: "Move slowly and avoid aggressive ranges — the cervical spine is sensitive.",
    tags: ["neck", "posture"],
  },

  // ── Latissimus dorsi ─────────────────────────────────────────────
  {
    id: "rem-lat-tight-stretch",
    muscleBaseId: "latissimus-dorsi",
    forState: "tight",
    type: "stretch",
    title: "Child's pose lat stretch",
    steps: [
      { order: 1, instruction: "Kneel on the floor, sit hips back toward heels, arms extended forward on the ground." },
      { order: 2, instruction: "Walk hands to one side to bias the stretch toward the opposite lat." },
      { order: 3, instruction: "Hold 30 seconds; 2–3 sets per side." },
    ],
    tags: ["shoulder", "overhead", "pull-pattern"],
  },

  // ── Wrist extensors ──────────────────────────────────────────────
  {
    id: "rem-wristext-weak-strengthen",
    muscleBaseId: "wrist-extensors",
    forState: "weak",
    type: "strengthen",
    title: "Reverse wrist curl",
    steps: [
      { order: 1, instruction: "Sit with forearm resting on a bench, wrist hanging off the edge, palm facing down." },
      { order: 2, instruction: "Curl a light dumbbell upward by extending the wrist." },
      { order: 3, instruction: "Lower slowly. 3 sets of 15–20 reps." },
    ],
    tags: ["forearm", "rehab"],
  },
];

/**
 * Get remedies for a given muscle base ID and state.
 * @param {string} muscleBaseId
 * @param {'tight'|'weak'|'normal'} forState
 */
export function getRemedies(muscleBaseId, forState) {
  return REMEDIES.filter(
    (r) => r.muscleBaseId === muscleBaseId && r.forState === forState,
  );
}

/**
 * Get all remedies for a muscle regardless of state.
 */
export function getAllRemediesForMuscle(muscleBaseId) {
  return REMEDIES.filter((r) => r.muscleBaseId === muscleBaseId);
}
