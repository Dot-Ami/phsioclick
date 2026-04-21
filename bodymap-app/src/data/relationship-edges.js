/**
 * L1 inter-regional relationship edges.
 *
 * Each edge encodes a directional relationship between two muscle/region IDs
 * (or sub-muscle base IDs without -l/-r). The `mechanism` text MUST reference
 * L0 vocabulary (joints, actions, pairs) where possible so links stay auditable.
 *
 * CONVENTIONS:
 * - `from` / `to` use base IDs from muscle-data.js (parent slug or SUB_MUSCLES id).
 * - `kind` is one of: compensation, load-chain, adjacency, referral, inhibition.
 * - `confidence` is 0–1 float (1 = textbook fact, <0.5 = clinical heuristic).
 * - `bidirectional` defaults to false; set true when the relationship runs both ways
 *   with the same mechanism (avoids duplicate edges).
 * - `tags` are free-form for filtering (e.g. 'squat-pattern', 'chain-lower').
 * - Bump RELATIONSHIP_EDGES_SCHEMA_VERSION when removing or renaming edge keys.
 */

export const RELATIONSHIP_EDGES_SCHEMA_VERSION = 1;

/**
 * @typedef {Object} RelationshipEdge
 * @property {string} id - Unique edge identifier
 * @property {string} from - Source muscle/region base ID
 * @property {string} to - Target muscle/region base ID
 * @property {'compensation'|'load-chain'|'adjacency'|'referral'|'inhibition'} kind
 * @property {string} mechanism - Explanation grounded in L0 vocabulary
 * @property {number} confidence - 0–1 float
 * @property {boolean} [bidirectional] - True if same mechanism runs both ways
 * @property {string[]} [tags]
 * @property {string} [evidence] - Optional citation or reasoning note
 */

/** @type {RelationshipEdge[]} */
export const RELATIONSHIP_EDGES = [
  // ── Lower-extremity chain ───────────────────────────────────────────
  {
    id: 'edge-ankle-knee-chain',
    from: 'gastrocnemius',
    to: 'rectus-femoris',
    kind: 'load-chain',
    mechanism: 'Limited ankle dorsiflexion (gastrocnemius tightness) restricts knee tracking over toes, shifting knee-extension demand to quads and increasing patellar load.',
    confidence: 0.85,
    tags: ['squat-pattern', 'chain-lower'],
  },
  {
    id: 'edge-ankle-hip-comp',
    from: 'gastrocnemius',
    to: 'erector-spinae',
    kind: 'compensation',
    mechanism: 'Ankle dorsiflexion deficit causes forward trunk lean in squat patterns, increasing lumbar extension demand on erector spinae.',
    confidence: 0.75,
    tags: ['squat-pattern', 'chain-lower'],
  },
  {
    id: 'edge-glute-hamstring-comp',
    from: 'glute-max',
    to: 'biceps-femoris',
    kind: 'compensation',
    mechanism: 'Gluteus maximus inhibition (weakness or delayed activation) shifts hip extension load to hamstrings, increasing strain risk during hinge patterns.',
    confidence: 0.9,
    tags: ['hinge-pattern', 'chain-lower'],
  },
  {
    id: 'edge-glute-lowback-comp',
    from: 'glute-max',
    to: 'erector-spinae',
    kind: 'compensation',
    mechanism: 'Weak glute max during hip extension causes lumbar erector spinae to compensate, contributing to low-back fatigue and pain in deadlifts and standing.',
    confidence: 0.9,
    tags: ['hinge-pattern', 'chain-lower', 'low-back'],
  },
  {
    id: 'edge-glutemed-tfl-comp',
    from: 'glute-med',
    to: 'tfl',
    kind: 'compensation',
    mechanism: 'Weak gluteus medius in frontal-plane hip stabilization causes TFL to dominate hip abduction and internal rotation, increasing IT band tension.',
    confidence: 0.85,
    tags: ['single-leg', 'chain-lower'],
  },
  {
    id: 'edge-hip-flexor-glute-inhibition',
    from: 'iliopsoas',
    to: 'glute-max',
    kind: 'inhibition',
    mechanism: 'Chronically shortened iliopsoas (from prolonged sitting) reciprocally inhibits gluteus maximus activation via altered length-tension and neural drive.',
    confidence: 0.8,
    tags: ['posture', 'chain-lower'],
  },

  // ── Scapular / shoulder chain ───────────────────────────────────────
  {
    id: 'edge-scapula-gh-stability',
    from: 'lower-trap',
    to: 'supraspinatus',
    kind: 'load-chain',
    mechanism: 'Weak lower trapezius impairs scapular upward rotation, narrowing subacromial space and increasing supraspinatus tendon stress during overhead movements.',
    confidence: 0.85,
    tags: ['overhead', 'chain-upper', 'shoulder'],
  },
  {
    id: 'edge-serratus-scapwing',
    from: 'serratus-ant',
    to: 'upper-trap',
    kind: 'compensation',
    mechanism: 'Serratus anterior weakness prevents scapular protraction and upward rotation; upper trapezius compensates with excessive elevation, causing neck tension.',
    confidence: 0.85,
    tags: ['overhead', 'chain-upper', 'posture'],
  },
  {
    id: 'edge-pecminor-posture',
    from: 'pec-minor',
    to: 'rhomboid-major',
    kind: 'inhibition',
    mechanism: 'Tight pectoralis minor pulls scapulae into protraction and downward rotation, lengthening and inhibiting rhomboids and middle trapezius.',
    confidence: 0.8,
    bidirectional: false,
    tags: ['posture', 'chain-upper'],
  },
  {
    id: 'edge-antdelt-postdelt-imbalance',
    from: 'anterior-delt',
    to: 'posterior-delt',
    kind: 'inhibition',
    mechanism: 'Anterior deltoid overdevelopment (pressing-heavy programs) creates a strength imbalance with posterior deltoid, contributing to internal rotation bias and rounded-shoulder posture.',
    confidence: 0.75,
    tags: ['posture', 'shoulder'],
  },

  // ── Cervical / upper cross ──────────────────────────────────────────
  {
    id: 'edge-uppertrap-neck',
    from: 'upper-trap',
    to: 'sternocleidomastoid',
    kind: 'load-chain',
    mechanism: 'Upper trapezius hypertonicity elevates the scapulae and extends the cervical spine, increasing SCM and deep cervical flexor load to maintain head position.',
    confidence: 0.75,
    tags: ['posture', 'neck', 'upper-cross'],
  },
  {
    id: 'edge-levscap-neck',
    from: 'levator-scapulae',
    to: 'lower-trap',
    kind: 'compensation',
    mechanism: 'Tight levator scapulae maintains scapular elevation and downward rotation, opposing lower trapezius function and contributing to scapular dyskinesis.',
    confidence: 0.7,
    tags: ['posture', 'neck', 'chain-upper'],
  },

  // ── Core / trunk ────────────────────────────────────────────────────
  {
    id: 'edge-tva-multifidus-coactivation',
    from: 'transverse-abdominis',
    to: 'multifidus',
    kind: 'load-chain',
    mechanism: 'Transverse abdominis and multifidus co-contract anticipatorily before limb movement for segmental spinal stabilization; weakness in either shifts load to global movers (erector spinae, rectus abdominis).',
    confidence: 0.85,
    bidirectional: true,
    tags: ['core', 'stabilization'],
  },
  {
    id: 'edge-core-weak-lowback',
    from: 'rectus-abdominis',
    to: 'erector-spinae',
    kind: 'compensation',
    mechanism: 'Weak anterior core (rectus abdominis, obliques) allows excessive anterior pelvic tilt and lumbar lordosis, overloading erector spinae as a postural stabilizer.',
    confidence: 0.8,
    tags: ['posture', 'core', 'low-back'],
  },

  // ── Cross-body / diagonal ──────────────────────────────────────────
  {
    id: 'edge-lat-contralateral-glute',
    from: 'latissimus-dorsi',
    to: 'glute-max',
    kind: 'load-chain',
    mechanism: 'Latissimus dorsi and contralateral gluteus maximus are linked through the thoracolumbar fascia, forming a posterior oblique sling that stabilizes the trunk during gait and rotation.',
    confidence: 0.8,
    bidirectional: true,
    tags: ['gait', 'sling', 'rotation'],
  },

  // ── Upper cross / shoulder (new edges) ────────────────────────────
  {
    id: 'edge-pecmajor-midtrap-inhibition',
    from: 'pec-major',
    to: 'middle-trap',
    kind: 'inhibition',
    mechanism: 'Chronically shortened pectoralis major (pressing-dominant programs, desk posture) reciprocally inhibits middle trapezius and rhomboids, allowing scapular protraction and contributing to upper-cross syndrome.',
    confidence: 0.8,
    tags: ['posture', 'upper-cross', 'shoulder'],
  },
  {
    id: 'edge-subscap-supraspinatus',
    from: 'subscapularis',
    to: 'supraspinatus',
    kind: 'load-chain',
    mechanism: 'Subscapularis tightness biases the humeral head anteriorly, narrowing the subacromial space and increasing supraspinatus impingement risk during abduction.',
    confidence: 0.75,
    tags: ['shoulder', 'rotator-cuff'],
  },
  {
    id: 'edge-infraspinatus-antdelt',
    from: 'infraspinatus',
    to: 'anterior-delt',
    kind: 'compensation',
    mechanism: 'Weak infraspinatus (external rotation deficit) allows excessive internal rotation dominance by subscapularis and anterior deltoid, increasing anterior shoulder instability.',
    confidence: 0.75,
    tags: ['shoulder', 'rotator-cuff'],
  },
  {
    id: 'edge-rhomboid-serratus-comp',
    from: 'rhomboid-major',
    to: 'serratus-ant',
    kind: 'compensation',
    mechanism: 'Overactive rhomboids can oppose serratus anterior upward rotation, restricting scapular movement during overhead patterns and contributing to dyskinesis.',
    confidence: 0.7,
    tags: ['shoulder', 'scapular', 'overhead'],
  },
  {
    id: 'edge-uppertrap-lowertrap-inhibition',
    from: 'upper-trap',
    to: 'lower-trap',
    kind: 'inhibition',
    mechanism: 'Upper trapezius dominance during scapular upward rotation inhibits lower trapezius depression force couple, leading to scapular elevation bias and subacromial impingement risk.',
    confidence: 0.8,
    tags: ['posture', 'upper-cross', 'shoulder'],
  },

  // ── Lower cross / hip (new edges) ────────────────────────────────
  {
    id: 'edge-rectfem-glutemax-inhibition',
    from: 'rectus-femoris',
    to: 'glute-max',
    kind: 'inhibition',
    mechanism: 'Tight rectus femoris maintains anterior pelvic tilt and hip flexion bias, reciprocally inhibiting gluteus maximus activation during hip extension movements.',
    confidence: 0.8,
    tags: ['posture', 'lower-cross', 'chain-lower'],
  },
  {
    id: 'edge-adductor-glutemed-chain',
    from: 'adductor-magnus',
    to: 'glute-med',
    kind: 'load-chain',
    mechanism: 'Tight or overactive adductor magnus can oppose gluteus medius hip abduction, contributing to frontal-plane instability and Trendelenburg gait pattern.',
    confidence: 0.75,
    tags: ['single-leg', 'chain-lower'],
  },
  {
    id: 'edge-hamstring-erector-comp',
    from: 'biceps-femoris',
    to: 'erector-spinae',
    kind: 'compensation',
    mechanism: 'Tight hamstrings restrict hip flexion ROM during forward bending, forcing lumbar flexion compensation and overloading erector spinae in deadlift and picking patterns.',
    confidence: 0.8,
    tags: ['hinge-pattern', 'chain-lower', 'low-back'],
  },
  {
    id: 'edge-tfl-glutemax-inhibition',
    from: 'tfl',
    to: 'glute-max',
    kind: 'inhibition',
    mechanism: 'Overactive TFL dominates hip abduction and internal rotation, neurally inhibiting gluteus maximus activation and contributing to IT band syndrome and knee valgus.',
    confidence: 0.75,
    tags: ['single-leg', 'chain-lower', 'posture'],
  },

  // ── Ankle / knee / lower leg (new edges) ──────────────────────────
  {
    id: 'edge-soleus-ankle-knee',
    from: 'soleus',
    to: 'vastus-medialis',
    kind: 'load-chain',
    mechanism: 'Tight soleus limits ankle dorsiflexion with bent knee, restricting deep squat depth and shifting knee-extension demand to VMO while promoting lateral tracking.',
    confidence: 0.75,
    tags: ['squat-pattern', 'chain-lower', 'ankle'],
  },
  {
    id: 'edge-tibant-gastroc-antagonist',
    from: 'tibialis-anterior',
    to: 'gastrocnemius',
    kind: 'load-chain',
    mechanism: 'Tibialis anterior and gastrocnemius form the primary dorsiflexion-plantarflexion antagonist pair at the ankle; weakness in either shifts gait mechanics and ankle stability demands.',
    confidence: 0.85,
    bidirectional: true,
    tags: ['gait', 'chain-lower', 'ankle'],
  },

  // ── Core / trunk (new edges) ──────────────────────────────────────
  {
    id: 'edge-obliques-erector-comp',
    from: 'external-oblique',
    to: 'erector-spinae',
    kind: 'compensation',
    mechanism: 'Weak obliques reduce lateral trunk stabilization, causing erector spinae to compensate during asymmetric loading, single-leg stance, and rotational movements.',
    confidence: 0.75,
    tags: ['core', 'stabilization', 'rotation'],
  },
  {
    id: 'edge-ql-glutemed-hiphike',
    from: 'quadratus-lumborum',
    to: 'glute-med',
    kind: 'compensation',
    mechanism: 'Tight or overactive QL performs hip hiking during single-leg stance, compensating for weak gluteus medius pelvic stabilization and contributing to lateral low-back pain.',
    confidence: 0.75,
    tags: ['single-leg', 'core', 'low-back'],
  },

  // ── Upper limb (new edges) ────────────────────────────────────────
  {
    id: 'edge-wristflex-epicondyle',
    from: 'wrist-flexors',
    to: 'wrist-extensors',
    kind: 'load-chain',
    mechanism: 'Overuse of wrist flexors (gripping, curling) creates imbalance with wrist extensors; the lateral epicondyle common extensor origin bears compensatory load, increasing lateral epicondylitis risk.',
    confidence: 0.75,
    tags: ['forearm', 'overuse'],
  },
  {
    id: 'edge-bicepslong-supraspinatus',
    from: 'biceps-long',
    to: 'supraspinatus',
    kind: 'load-chain',
    mechanism: 'Biceps long head tendon runs through the bicipital groove adjacent to supraspinatus insertion; biceps tendinopathy and supraspinatus impingement often co-present due to shared subacromial space.',
    confidence: 0.7,
    tags: ['shoulder', 'chain-upper'],
  },
  {
    id: 'edge-lat-teres-synergy',
    from: 'latissimus-dorsi',
    to: 'teres-major',
    kind: 'load-chain',
    mechanism: 'Latissimus dorsi and teres major share shoulder extension, adduction, and internal rotation actions; teres major compensates when lat recruitment is impaired, and vice versa.',
    confidence: 0.8,
    bidirectional: true,
    tags: ['pull-pattern', 'chain-upper'],
  },
];

/**
 * Look up all edges involving a given muscle/region base ID.
 * Returns { inbound, outbound } arrays.
 * @param {string} baseId - Muscle or region base ID (no -l/-r)
 */
export function getEdgesForMuscle(baseId) {
  const inbound = [];
  const outbound = [];
  for (const edge of RELATIONSHIP_EDGES) {
    if (edge.from === baseId) outbound.push(edge);
    if (edge.to === baseId) inbound.push(edge);
    if (edge.bidirectional) {
      if (edge.from === baseId && edge.to !== baseId) inbound.push(edge);
      if (edge.to === baseId && edge.from !== baseId) outbound.push(edge);
    }
  }
  return { inbound, outbound };
}

/**
 * Filter edges by kind.
 * @param {'compensation'|'load-chain'|'adjacency'|'referral'|'inhibition'} kind
 */
export function getEdgesByKind(kind) {
  return RELATIONSHIP_EDGES.filter((e) => e.kind === kind);
}

/**
 * Get all unique muscle IDs referenced by edges (for validation).
 */
export function listEdgeMuscleIds() {
  const ids = new Set();
  for (const edge of RELATIONSHIP_EDGES) {
    ids.add(edge.from);
    ids.add(edge.to);
  }
  return [...ids];
}
