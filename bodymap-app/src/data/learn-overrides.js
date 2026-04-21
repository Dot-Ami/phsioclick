// Stage 02-A.5 / U4 — Hand-tuned Learn records for the highest-traffic muscles.
// Auto-generated content from LearnPanel.jsx covers every muscle in
// SUB_MUSCLES; entries here override the generator for the muscles users hit
// most. Spec: stages/02a-ux-foundation/output/learn-layer-spec.md §Override file
// + §Copywriting style guide + §Acceptance criteria for ticket U4 (suggested
// 10 high-traffic muscles).
//
// Style constraints (enforced by reading the spec — no automated lint here):
//   - Second person, calm tone, short sentences (avg 12–18 words, max 25).
//   - Educational, never medical. No diagnose/treat/cure/should/must.
//   - First mention defines the term (English first, Latin in parens).
//   - "If this is tight" / "If this is weak" framing on whenItActsUp.
//   - "Try this:" prefix on howToTest.
//
// Keys are SUB_MUSCLES base ids (no -l/-r). See bodymap-app/src/muscle-data.js.

/** @type {Record<string, import('./learn-types').LearnContent>} */
export const LEARN_OVERRIDES = {
  iliopsoas: {
    description:
      "Your iliopsoas is the deepest of the hip-flexor muscles, running from your lower spine down to the inside of your thigh. It lifts your thigh forward whenever you walk, run, or climb stairs. Because most of us sit a lot, it's one of the first places tightness shows up.",
    whatItDoes: [
      "Lifts your thigh toward your chest when you walk or run",
      "Helps you sit up from lying down",
      "Steadies your pelvis when you stand on one leg",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might notice a pinching at the front of your hip, an arched lower back when you stand for a while, or stiffness during the first few steps after sitting.",
      weak:
        "If this is weak, lifting your knee high (like climbing stairs two at a time) may feel surprisingly hard, and your lower back may take over the job instead.",
    },
    howToTest:
      "Try this: stand tall and slowly lift one knee toward your chest. If one side feels noticeably harder or tighter than the other, that side often benefits from a kneeling hip-flexor stretch.",
  },

  "glute-max": {
    description:
      "Your gluteus maximus is the largest muscle in your body, sitting at the back of your hip. It drives your thigh backward — the engine behind every step, jump, and stand-up. When it goes quiet, your lower back and hamstrings tend to take over.",
    whatItDoes: [
      "Drives your thigh back behind you when you walk, run, or stand up",
      "Rotates your thigh outward when you change direction",
      "Steadies your pelvis when you climb or carry weight",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might feel restriction when bringing your knee toward your chest, or notice that you can't fully relax your seat.",
      weak:
        "If this is weak, you might feel your hamstrings or lower back doing the work during deadlifts and bridges, and standing up from a low chair may feel harder than it should.",
    },
    howToTest:
      "Try this: lie face-down and lift one straight leg a few inches off the floor while keeping your knee locked. If you feel hamstring before glute, that side may benefit from glute activation work.",
  },

  "glute-med": {
    description:
      "Your gluteus medius sits on the side of your hip and is the muscle that keeps your pelvis level when you stand on one leg. Walking, stairs, and any single-leg movement rely on it. It's commonly underused after long stretches of sitting.",
    whatItDoes: [
      "Lifts your leg out to the side",
      "Keeps your pelvis level when you stand on one foot",
      "Rotates your thigh inward and outward depending on which fibers are firing",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might notice a pinch on the outside of your hip when you sit cross-legged or sleep on your side.",
      weak:
        "If this is weak, your hip may drop when you walk or run, your knee may cave inward during squats, and the IT band on the side of your thigh may feel cranky.",
    },
    howToTest:
      "Try this: stand on one leg in front of a mirror for 20 seconds. If your hip drops or your standing knee drifts inward, that side often benefits from side-lying clamshells or lateral band walks.",
  },

  "latissimus-dorsi": {
    description:
      "Your latissimus dorsi (or \"lat\") is the broad fan of muscle that wraps the side of your back from your spine down to your upper arm. It pulls your arm down and back, and it's what makes your torso look wide. Tight lats often quietly limit how high you can reach overhead.",
    whatItDoes: [
      "Pulls your arm down and back (rowing, pulling yourself up)",
      "Brings your arm in toward your body",
      "Helps stabilize your shoulder during overhead and pulling movements",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might notice your lower back arching when you reach overhead, or your shoulder shrugging up to compensate for limited range.",
      weak:
        "If this is weak, pulling movements like rows and pull-ups may feel like all-arms, and you may struggle to feel your back working.",
    },
    howToTest:
      "Try this: lie on your back with your knees bent and try to reach both arms straight overhead and rest them flat on the floor. If your lower back arches off the floor or your arms can't reach the floor, your lats are likely contributing.",
  },

  "pec-upper": {
    description:
      "Your upper pec (the clavicular head of your pectoralis major) is the part of your chest that runs from your collarbone to your upper arm. It lifts and pushes your arm forward and up. It's often underdeveloped relative to the lower chest.",
    whatItDoes: [
      "Pushes your arm forward and slightly upward (an incline press motion)",
      "Brings your arm across your chest",
      "Helps stabilize your shoulder during pressing",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might notice your shoulders rolling forward or a pinch at the front of your shoulder when you reach overhead.",
      weak:
        "If this is weak, incline pressing may feel disproportionately hard compared to flat pressing, and the front of your shoulder may take over.",
    },
    howToTest:
      "Try this: stand in a doorway with your forearm at a high angle (slightly above shoulder height) and lean gently through. A clear pull along the upper chest tells you the muscle is in play; a hot spot at the front of your shoulder says shoulder, not chest.",
  },

  "pec-lower": {
    description:
      "Your lower pec (the sternal head of your pectoralis major) is the larger part of your chest that connects your sternum to your upper arm. It's the dominant part of most pressing movements. It tends to get tight in anyone who trains a lot of bench-style work.",
    whatItDoes: [
      "Pushes your arm forward (the main bench-press motion)",
      "Brings your arm in across your chest",
      "Rotates your arm inward",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might notice rounded shoulders, restricted overhead reach, or a feeling that your chest is always braced.",
      weak:
        "If this is weak, pressing may feel underpowered and your front shoulder will likely fatigue first.",
    },
    howToTest:
      "Try this: stand in a doorway with your forearm at shoulder height and lean gently through. A clear pull across the middle of your chest tells you the lower pec is in play.",
  },

  "erector-spinae": {
    description:
      "Your erector spinae are three columns of muscle running up either side of your spine. They straighten your back and steady your trunk through every lift, carry, and step. They're built for endurance, not big efforts.",
    whatItDoes: [
      "Straightens your spine when you stand back up from a bend",
      "Bends your trunk side to side",
      "Braces your spine during lifts and carries",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, your lower back may feel \"on\" all the time and stiff after sitting, and bending forward may feel restricted.",
      weak:
        "If this is weak, holding a tall posture for long periods may feel exhausting, and your lower back may fatigue before your legs do during hinges.",
    },
    howToTest:
      "Try this: lie face-down with your hands at your temples and lift your chest off the floor a few inches. Aim to hold for 30 seconds. If it lights up sharply or you can't hold it, that's a useful baseline to revisit.",
  },

  "biceps-femoris": {
    description:
      "Your biceps femoris is the outer hamstring, running from your sit bone down to the outside of your knee. It bends your knee and helps drive your thigh back. It's the most commonly strained of the three hamstrings, especially in sprinting.",
    whatItDoes: [
      "Bends your knee",
      "Drives your thigh back behind you",
      "Rotates your shin outward when your knee is bent",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might notice a pulling sensation at the back of your thigh, especially when you bend forward with straight legs.",
      weak:
        "If this is weak, your glutes may not have a partner for hip extension, and you may feel knee or hamstring strain during fast running or quick changes of direction.",
    },
    howToTest:
      "Try this: stand and slowly bend forward to touch your toes, keeping your knees straight. Notice where you feel the stretch first — outer or inner hamstring — and how the two sides compare.",
  },

  "rectus-femoris": {
    description:
      "Your rectus femoris is the central quadriceps muscle, the only one that crosses both your hip and knee. It straightens your knee and helps lift your thigh. Long hours of sitting tend to leave it short and twitchy.",
    whatItDoes: [
      "Straightens your knee (kicking, standing up)",
      "Lifts your thigh toward your chest",
      "Helps stabilize your kneecap as your knee bends and straightens",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might feel your lower back arch when you stand up tall, or a pull at the front of your hip and thigh during lunges.",
      weak:
        "If this is weak, your knee may feel unstable on stairs or when stepping down, and your hip flexors as a group will tire faster.",
    },
    howToTest:
      "Try this: stand and pull one heel toward your seat, keeping your knee pointing straight down. Compare sides. If your hip pulls forward into a deep arch, that side often benefits from a couch stretch.",
  },

  "anterior-delt": {
    description:
      "Your anterior deltoid is the front of your shoulder cap. It lifts your arm forward and helps with every pressing movement. It tends to get overdeveloped in lifters who press a lot and rarely pull.",
    whatItDoes: [
      "Lifts your arm forward and overhead",
      "Pushes your arm forward (pressing, punching)",
      "Helps rotate your arm inward",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might feel a pinch at the front of your shoulder when reaching back, and your shoulder may sit forward of your ear at rest.",
      weak:
        "If this is weak, pressing and reaching forward will feel underpowered, and your upper traps may take over.",
    },
    howToTest:
      "Try this: with arms at your sides, slowly raise both arms straight forward to shoulder height and back down for 10 reps. Compare sides for ease, range, and any catch.",
  },

  "upper-trap": {
    description:
      "Your upper trapezius runs from the back of your neck to the top of your shoulder. It lifts your shoulder blade — the shrug muscle. It tends to be the muscle most people \"hold\" in stress, sitting, and screen time.",
    whatItDoes: [
      "Lifts your shoulder blade toward your ear (a shrug)",
      "Helps tilt your head to the side",
      "Helps rotate your shoulder blade up so you can reach overhead",
    ],
    whenItActsUp: {
      tight:
        "If this is tight, you might notice your shoulders sitting up near your ears, headaches that start at the base of your skull, or neck stiffness after a long workday.",
      weak:
        "If this is weak, holding heavy objects for long periods may fatigue your shoulders quickly.",
    },
    howToTest:
      "Try this: sit tall, drop your shoulders down, and gently tilt your ear toward the opposite shoulder. Compare sides — the side that's tighter usually pulls back faster.",
  },
};

/**
 * Lookup helper used by LearnPanel.jsx.
 */
export function getLearnOverride(baseId) {
  if (!baseId) return null;
  return LEARN_OVERRIDES[baseId] || null;
}
