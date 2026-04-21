// Stage 02-B / F8 — assessment-to-driver-muscle map.
// Spec: stages/02-tracking-metrics/output/plan.md §3.4 (assessmentDrivers
// shape) + §4 F8 (assessment-to-state correlation view).
//
// Each entry maps an `ASSESSMENT_TESTS[i].name` (the testKey persisted on
// every `assessments[]` row in BodyMapApp.jsx — see the `test` field set by
// `recordAssessment`) to an array of SUB_MUSCLES base IDs that primarily
// drive the test result. M9 (`assessmentStateCorrelation`) joins each base
// ID against `${baseId}-l` / `${baseId}-r` and sums M1 flagged days for
// the visible side.
//
// Hard requirements (per the F-Phase 3 prompt + CONVENTIONS §5):
//   - Every key MUST exactly match an entry in `ASSESSMENT_TESTS` in
//     `BodyMapApp.jsx` (no orphaned tests). The current canonical list is:
//       Overhead Squat
//       Thomas Test
//       Wall Angel
//       Single-leg Balance
//       Hip Internal Rotation
//       Hip External Rotation
//       Ankle Dorsiflexion Knee-to-wall
//       90/90 Hip Lift Hold
//       Side Plank Endurance
//       Single-leg Sit-to-stand
//   - Every base ID MUST exactly match a SUB_MUSCLES entry in
//     `src/muscle-data.js` (verified manually against the export below).
//   - Apply `migrateLegacyId()` once at module load so the lookup is
//     resilient if any of the SUB_MUSCLES IDs ever migrate.
//
// Sources for the mapping decisions are inline next to each entry —
// standard movement-screen biomechanics references (NASM CES textbook +
// Cook's "Movement"). These are educational hypotheses, not diagnostic
// claims; F8's chart legend is explicit about that.

import { migrateLegacyId } from "../muscle-data.js";

const RAW_DRIVERS = {
  // Overhead Squat — composite screen (NASM CES Ch. 6). Heel rise / forward
  // lean → tight gastroc/soleus + lats. Arms fall forward → tight pec minor
  // + lats. Knee valgus → weak glute med (covered separately). The
  // shoulder-mobility + hip flexion + ankle dorsiflexion drivers below
  // surface the most actionable tightness signals.
  "Overhead Squat": [
    "latissimus-dorsi",
    "pec-minor",
    "iliopsoas",
    "gastrocnemius",
    "soleus",
  ],

  // Thomas Test — gold-standard hip flexor length test (Magee). Knee
  // hangs above table → tight RF; thigh rises off table → tight psoas;
  // thigh abducts → tight TFL.
  "Thomas Test": ["iliopsoas", "rectus-femoris", "tfl"],

  // Wall Angel — scapulohumeral rhythm + thoracic mobility screen. Inability
  // to keep wrists on the wall → tight pec minor / lats; subscap restricts
  // external rotation in the bottom position.
  "Wall Angel": ["pec-minor", "latissimus-dorsi", "subscapularis"],

  // Single-leg Balance — frontal-plane hip stability (Trendelenburg sign).
  // Glute med + min are the prime stabilizers; QL contributes via pelvic
  // hike when glute med is inhibited.
  "Single-leg Balance": ["glute-med", "glute-min", "quadratus-lumborum"],

  // Hip Internal Rotation — restricted IR points to tight external rotators
  // (glute max upper fibers + piriformis are not in SUB_MUSCLES; the closest
  // surrogates in the atlas are glute-max and the deep posterior glute mass
  // covered by glute-min). TFL is also implicated when capsular IR is
  // restricted in flexion.
  "Hip Internal Rotation": ["glute-max", "glute-min", "tfl"],

  // Hip External Rotation — limited ER usually = tight internal rotators
  // (TFL, anterior glute med fibers, adductor longus). Iliopsoas tightness
  // also shows up via anterior pelvic tilt that masks ER range.
  "Hip External Rotation": ["tfl", "adductor-longus", "iliopsoas"],

  // Ankle Dorsiflexion Knee-to-wall — classic gastroc/soleus length test.
  // Soleus dominates because the knee is bent; gastroc still contributes
  // when knee is near extension.
  "Ankle Dorsiflexion Knee-to-wall": ["soleus", "gastrocnemius", "tibialis-anterior"],

  // 90/90 Hip Lift Hold — posterior chain endurance. Hamstring (esp. biceps
  // femoris) cramping = weak/short; glute max should drive the lift.
  "90/90 Hip Lift Hold": ["biceps-femoris", "semitendinosus", "glute-max"],

  // Side Plank Endurance — McGill lateral core endurance test. Obliques
  // (external + internal) + QL are the prime stabilizers; glute med
  // contributes to pelvic alignment.
  "Side Plank Endurance": [
    "external-oblique",
    "internal-oblique",
    "quadratus-lumborum",
    "glute-med",
  ],

  // Single-leg Sit-to-stand — closed-chain quad + glute strength
  // composite. VMO drives terminal knee extension; glute max + med drive
  // the hip extension and frontal-plane control.
  "Single-leg Sit-to-stand": [
    "vastus-medialis",
    "vastus-lateralis",
    "glute-max",
    "glute-med",
  ],
};

// Apply migrateLegacyId once so any future ID renames stay coherent. Pure
// function call at module load — no runtime cost on the chart.
export const ASSESSMENT_DRIVERS = Object.fromEntries(
  Object.entries(RAW_DRIVERS).map(([testKey, baseIds]) => [
    testKey,
    baseIds.map((id) => migrateLegacyId(id)),
  ]),
);

export default ASSESSMENT_DRIVERS;
