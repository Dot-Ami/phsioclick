/**
 * L0 muscle mechanics — keys are SUB_MUSCLES base ids (no -l / -r).
 * Use getMuscleMechanics(muscleId) with full ids from the app (e.g. biceps-long-l).
 *
 * CONVENTIONS (L0.4):
 * - Keys MUST match a SUB_MUSCLES `id` in muscle-data.js.
 * - antagonistSubIds: functional opposites for the primary actions listed in
 *   primaryActionKeys. Prefer 2–6 ids; use notes for debatable pairings.
 * - synergistSubIds: muscles that assist the same primary actions.
 * - Multi-joint muscles list ALL crossed joints in jointIds.
 * - planeTags: dominant plane(s) for the listed actions; optional when obvious.
 * - Bump MUSCLE_MECHANICS_SCHEMA_VERSION when removing/renaming keys.
 */

import { fromMuscleId } from '../muscle-data.js';

export const MUSCLE_MECHANICS_SCHEMA_VERSION = 1;

/**
 * @typedef {Object} MuscleMechanicsEntry
 * @property {string[]} jointIds — keys into joints.js
 * @property {string[]} primaryActionKeys — stable verb keys for queries / future L1
 * @property {string[]} [planeTags]
 * @property {string[]} antagonistSubIds — SUB_MUSCLES base ids
 * @property {string[]} [synergistSubIds]
 * @property {string} [notes]
 */

/** @type {Record<string, MuscleMechanicsEntry>} */
export const MUSCLE_MECHANICS = {
  'biceps-long': {
    jointIds: ['joint-elbow', 'joint-gh'],
    primaryActionKeys: ['elbow-flexion', 'forearm-supination', 'shoulder-flexion'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['triceps-long', 'triceps-lateral', 'triceps-medial'],
    synergistSubIds: ['biceps-short', 'brachialis'],
    notes: 'Biarticular: crosses shoulder and elbow.',
  },
  'biceps-short': {
    jointIds: ['joint-elbow', 'joint-gh'],
    primaryActionKeys: ['elbow-flexion', 'forearm-supination'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['triceps-long', 'triceps-lateral', 'triceps-medial'],
    synergistSubIds: ['biceps-long', 'brachialis'],
    notes: '',
  },
  brachialis: {
    jointIds: ['joint-elbow'],
    primaryActionKeys: ['elbow-flexion'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['triceps-long', 'triceps-lateral', 'triceps-medial'],
    synergistSubIds: ['biceps-long', 'biceps-short'],
    notes: 'Primary elbow flexor regardless of forearm rotation.',
  },
  'triceps-long': {
    jointIds: ['joint-elbow', 'joint-gh'],
    primaryActionKeys: ['elbow-extension', 'shoulder-extension', 'shoulder-adduction'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['biceps-long', 'biceps-short', 'brachialis'],
    synergistSubIds: ['triceps-lateral', 'triceps-medial'],
    notes: 'Long head crosses shoulder.',
  },
  'triceps-lateral': {
    jointIds: ['joint-elbow'],
    primaryActionKeys: ['elbow-extension'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['biceps-long', 'biceps-short', 'brachialis'],
    synergistSubIds: ['triceps-long', 'triceps-medial'],
    notes: '',
  },
  'triceps-medial': {
    jointIds: ['joint-elbow'],
    primaryActionKeys: ['elbow-extension'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['biceps-long', 'biceps-short', 'brachialis'],
    synergistSubIds: ['triceps-long', 'triceps-lateral'],
    notes: '',
  },
  'rectus-femoris': {
    jointIds: ['joint-knee', 'joint-hip'],
    primaryActionKeys: ['knee-extension', 'hip-flexion'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['biceps-femoris', 'semitendinosus', 'semimembranosus'],
    synergistSubIds: ['vastus-lateralis', 'vastus-medialis'],
    notes: 'Biarticular quad; hip flexion + knee extension.',
  },
  'vastus-lateralis': {
    jointIds: ['joint-knee'],
    primaryActionKeys: ['knee-extension'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['biceps-femoris', 'semitendinosus', 'semimembranosus'],
    synergistSubIds: ['rectus-femoris', 'vastus-medialis'],
    notes: '',
  },
  'vastus-medialis': {
    jointIds: ['joint-knee'],
    primaryActionKeys: ['knee-extension'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['biceps-femoris', 'semitendinosus', 'semimembranosus'],
    synergistSubIds: ['rectus-femoris', 'vastus-lateralis'],
    notes: '',
  },
  'biceps-femoris': {
    jointIds: ['joint-knee', 'joint-hip'],
    primaryActionKeys: ['knee-flexion', 'hip-extension', 'tibia-external-rotation'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['rectus-femoris', 'vastus-lateralis', 'vastus-medialis'],
    synergistSubIds: ['semitendinosus', 'semimembranosus'],
    notes: 'Lateral hamstring; biarticular.',
  },
  semitendinosus: {
    jointIds: ['joint-knee', 'joint-hip'],
    primaryActionKeys: ['knee-flexion', 'hip-extension', 'tibia-internal-rotation'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['rectus-femoris', 'vastus-lateralis', 'vastus-medialis'],
    synergistSubIds: ['biceps-femoris', 'semimembranosus'],
    notes: 'Medial hamstring.',
  },
  semimembranosus: {
    jointIds: ['joint-knee', 'joint-hip'],
    primaryActionKeys: ['knee-flexion', 'hip-extension', 'tibia-internal-rotation'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['rectus-femoris', 'vastus-lateralis', 'vastus-medialis'],
    synergistSubIds: ['biceps-femoris', 'semitendinosus'],
    notes: 'Medial hamstring.',
  },

  'vastus-intermedius': {
    jointIds: ['joint-knee'],
    primaryActionKeys: ['knee-extension'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['biceps-femoris', 'semitendinosus', 'semimembranosus'],
    synergistSubIds: ['rectus-femoris', 'vastus-lateralis', 'vastus-medialis'],
    notes: 'Deep quad beneath rectus femoris.',
  },

  'anterior-delt': {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['shoulder-flexion', 'horizontal-adduction', 'shoulder-internal-rotation'],
    planeTags: ['sagittal', 'transverse'],
    antagonistSubIds: ['posterior-delt', 'infraspinatus', 'teres-minor'],
    synergistSubIds: ['pec-upper', 'pec-major', 'lateral-delt'],
    notes: 'Often overactive vs posterior delt in pressing-dominant programs.',
  },
  'lateral-delt': {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['shoulder-abduction'],
    planeTags: ['frontal'],
    antagonistSubIds: ['latissimus-dorsi', 'pec-lower', 'teres-major'],
    synergistSubIds: ['supraspinatus', 'anterior-delt'],
    notes: 'Supraspinatus assists initiation of abduction.',
  },
  'posterior-delt': {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['shoulder-extension', 'horizontal-abduction', 'shoulder-external-rotation'],
    planeTags: ['sagittal', 'transverse'],
    antagonistSubIds: ['anterior-delt', 'pec-upper', 'pec-major'],
    synergistSubIds: ['infraspinatus', 'teres-minor', 'latissimus-dorsi'],
    notes: 'Commonly undertrained relative to anterior delt.',
  },

  'pec-major': {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['horizontal-adduction', 'shoulder-flexion', 'shoulder-internal-rotation'],
    planeTags: ['sagittal', 'transverse'],
    antagonistSubIds: ['posterior-delt', 'infraspinatus', 'teres-minor'],
    synergistSubIds: ['pec-upper', 'pec-lower', 'anterior-delt'],
    notes: '',
  },
  'pec-upper': {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['shoulder-flexion', 'horizontal-adduction'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['posterior-delt', 'latissimus-dorsi', 'teres-major'],
    synergistSubIds: ['pec-major', 'pec-lower', 'anterior-delt'],
    notes: 'Clavicular pec fibers.',
  },
  'pec-lower': {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['horizontal-adduction', 'shoulder-internal-rotation', 'shoulder-extension-from-flexed'],
    planeTags: ['transverse', 'sagittal'],
    antagonistSubIds: ['posterior-delt', 'infraspinatus', 'teres-minor'],
    synergistSubIds: ['pec-major', 'pec-upper', 'anterior-delt'],
    notes: 'Sternal fibers; dominant in flat/decline pressing.',
  },
  'pec-minor': {
    jointIds: ['joint-scapula'],
    primaryActionKeys: ['scapular-protraction', 'scapular-depression', 'scapular-downward-rotation'],
    planeTags: ['transverse', 'frontal'],
    antagonistSubIds: ['middle-trap', 'rhomboid-major', 'lower-trap'],
    synergistSubIds: ['serratus-ant'],
    notes: 'Tightness contributes to rounded shoulder posture.',
  },

  'latissimus-dorsi': {
    jointIds: ['joint-gh', 'joint-spine-lumbar'],
    primaryActionKeys: ['shoulder-extension', 'shoulder-adduction', 'shoulder-internal-rotation'],
    planeTags: ['sagittal', 'frontal'],
    antagonistSubIds: ['anterior-delt', 'pec-upper', 'lateral-delt'],
    synergistSubIds: ['teres-major', 'pec-lower'],
    notes: 'Thoracolumbar fascia attachment; tightness limits overhead reach.',
  },
  'teres-major': {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['shoulder-adduction', 'shoulder-extension', 'shoulder-internal-rotation'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['lateral-delt', 'posterior-delt'],
    synergistSubIds: ['latissimus-dorsi', 'pec-lower'],
    notes: 'Functional “little lat.”',
  },
  infraspinatus: {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['shoulder-external-rotation', 'shoulder-stabilization'],
    planeTags: ['transverse'],
    antagonistSubIds: ['subscapularis', 'pec-major', 'pec-lower'],
    synergistSubIds: ['teres-minor', 'posterior-delt'],
    notes: 'Rotator cuff; posterior cuff.',
  },
  'teres-minor': {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['shoulder-external-rotation', 'shoulder-stabilization'],
    planeTags: ['transverse'],
    antagonistSubIds: ['subscapularis', 'pec-major', 'pec-lower'],
    synergistSubIds: ['infraspinatus', 'posterior-delt'],
    notes: '',
  },
  supraspinatus: {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['shoulder-abduction-initiation', 'shoulder-stabilization'],
    planeTags: ['frontal'],
    antagonistSubIds: ['latissimus-dorsi', 'pec-lower', 'teres-major'],
    synergistSubIds: ['lateral-delt'],
    notes: 'First ~15° abduction; common cuff tendon stress.',
  },
  subscapularis: {
    jointIds: ['joint-gh'],
    primaryActionKeys: ['shoulder-internal-rotation', 'shoulder-stabilization', 'shoulder-adduction'],
    planeTags: ['transverse'],
    antagonistSubIds: ['infraspinatus', 'teres-minor', 'posterior-delt'],
    synergistSubIds: ['pec-major', 'pec-lower', 'anterior-delt'],
    notes: 'Largest rotator cuff muscle; anterior stability.',
  },

  'rhomboid-major': {
    jointIds: ['joint-scapula'],
    primaryActionKeys: ['scapular-retraction', 'scapular-downward-rotation'],
    planeTags: ['transverse'],
    antagonistSubIds: ['serratus-ant', 'pec-minor'],
    synergistSubIds: ['rhomboid-minor', 'middle-trap'],
    notes: 'Shares atlas region with rhomboid minor in app.',
  },
  'rhomboid-minor': {
    jointIds: ['joint-scapula'],
    primaryActionKeys: ['scapular-retraction', 'scapular-stabilization'],
    planeTags: ['transverse'],
    antagonistSubIds: ['serratus-ant', 'pec-minor'],
    synergistSubIds: ['rhomboid-major', 'middle-trap'],
    notes: '',
  },

  'upper-trap': {
    jointIds: ['joint-scapula', 'joint-spine-cervical'],
    primaryActionKeys: ['scapular-elevation', 'cervical-extension', 'cervical-lateral-flexion'],
    planeTags: ['frontal', 'sagittal'],
    antagonistSubIds: ['lower-trap', 'serratus-ant'],
    synergistSubIds: ['levator-scapulae', 'middle-trap'],
    notes: 'Often overactive with forward-head posture.',
  },
  'middle-trap': {
    jointIds: ['joint-scapula'],
    primaryActionKeys: ['scapular-retraction', 'scapular-stabilization'],
    planeTags: ['transverse'],
    antagonistSubIds: ['pec-minor', 'serratus-ant'],
    synergistSubIds: ['rhomboid-major', 'lower-trap'],
    notes: '',
  },
  'lower-trap': {
    jointIds: ['joint-scapula'],
    primaryActionKeys: ['scapular-depression', 'scapular-upward-rotation'],
    planeTags: ['frontal', 'sagittal'],
    antagonistSubIds: ['upper-trap', 'pec-minor'],
    synergistSubIds: ['serratus-ant', 'middle-trap'],
    notes: 'Critical for overhead scapular mechanics.',
  },

  'glute-max': {
    jointIds: ['joint-hip'],
    primaryActionKeys: ['hip-extension', 'hip-external-rotation', 'hip-abduction-upper-fibers'],
    planeTags: ['sagittal', 'transverse', 'frontal'],
    antagonistSubIds: ['iliopsoas', 'rectus-femoris', 'sartorius'],
    synergistSubIds: ['glute-med', 'biceps-femoris', 'semimembranosus', 'semitendinosus'],
    notes: 'Inhibition → hamstring/low-back compensation common.',
  },
  'glute-med': {
    jointIds: ['joint-hip'],
    primaryActionKeys: ['hip-abduction', 'hip-internal-rotation-anterior', 'hip-external-rotation-posterior'],
    planeTags: ['frontal', 'transverse'],
    antagonistSubIds: ['adductor-magnus', 'adductor-longus', 'gracilis'],
    synergistSubIds: ['glute-min', 'tfl'],
    notes: 'Single-leg stance; weakness → hip drop / knee valgus risk.',
  },
  'glute-min': {
    jointIds: ['joint-hip'],
    primaryActionKeys: ['hip-abduction', 'hip-internal-rotation'],
    planeTags: ['frontal'],
    antagonistSubIds: ['adductor-magnus', 'adductor-longus', 'gracilis'],
    synergistSubIds: ['glute-med'],
    notes: 'Deep to glute medius.',
  },

  gastrocnemius: {
    jointIds: ['joint-knee', 'joint-ankle'],
    primaryActionKeys: ['ankle-plantarflexion', 'knee-flexion'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['tibialis-anterior', 'rectus-femoris', 'vastus-lateralis', 'vastus-medialis'],
    synergistSubIds: ['soleus'],
    notes: 'Biarticular; length tested with knee extended.',
  },
  soleus: {
    jointIds: ['joint-ankle'],
    primaryActionKeys: ['ankle-plantarflexion'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['tibialis-anterior'],
    synergistSubIds: ['gastrocnemius'],
    notes: 'Postural plantarflexor; knee-flexed bias.',
  },
  'tibialis-anterior': {
    jointIds: ['joint-ankle'],
    primaryActionKeys: ['ankle-dorsiflexion', 'foot-inversion'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['gastrocnemius', 'soleus'],
    synergistSubIds: [],
    notes: 'Toe clearance in gait; shin splint overlap.',
  },

  'erector-spinae': {
    jointIds: ['joint-spine-lumbar'],
    primaryActionKeys: ['spinal-extension', 'lateral-flexion', 'rotation'],
    planeTags: ['sagittal', 'frontal', 'transverse'],
    antagonistSubIds: ['rectus-abdominis', 'transverse-abdominis'],
    synergistSubIds: ['multifidus', 'quadratus-lumborum'],
    notes: 'Regional lumbar model; three columns grouped.',
  },
  'quadratus-lumborum': {
    jointIds: ['joint-spine-lumbar', 'joint-hip'],
    primaryActionKeys: ['lateral-flexion', 'hip-hiking', 'spinal-extension-assist'],
    planeTags: ['frontal', 'sagittal'],
    antagonistSubIds: ['external-oblique', 'internal-oblique'],
    synergistSubIds: ['erector-spinae', 'multifidus'],
    notes: 'Common ipsilateral low-back ache contributor.',
  },
  multifidus: {
    jointIds: ['joint-spine-lumbar'],
    primaryActionKeys: ['segmental-stabilization', 'spinal-extension'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['rectus-abdominis'],
    synergistSubIds: ['transverse-abdominis', 'erector-spinae'],
    notes: 'Deep stabilizer; atrophies after injury.',
  },

  'rectus-abdominis': {
    jointIds: ['joint-spine-lumbar'],
    primaryActionKeys: ['trunk-flexion', 'posterior-pelvic-tilt'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['erector-spinae', 'quadratus-lumborum'],
    synergistSubIds: ['transverse-abdominis', 'external-oblique', 'internal-oblique'],
    notes: '',
  },
  'transverse-abdominis': {
    jointIds: ['joint-spine-lumbar'],
    primaryActionKeys: ['core-compression', 'spinal-stabilization', 'forced-expiration'],
    planeTags: ['transverse'],
    antagonistSubIds: ['erector-spinae'],
    synergistSubIds: ['multifidus', 'internal-oblique'],
    notes: 'Anticipatory stabilizer before limb movement.',
  },
  'external-oblique': {
    jointIds: ['joint-spine-lumbar'],
    primaryActionKeys: ['contralateral-rotation', 'lateral-flexion', 'trunk-flexion'],
    planeTags: ['transverse', 'frontal'],
    antagonistSubIds: ['internal-oblique'],
    synergistSubIds: ['internal-oblique', 'rectus-abdominis'],
    notes: 'Works with contralateral internal oblique for rotation.',
  },
  'internal-oblique': {
    jointIds: ['joint-spine-lumbar'],
    primaryActionKeys: ['ipsilateral-rotation', 'lateral-flexion', 'trunk-flexion'],
    planeTags: ['transverse', 'frontal'],
    antagonistSubIds: ['external-oblique'],
    synergistSubIds: ['external-oblique', 'transverse-abdominis'],
    notes: '',
  },

  'wrist-flexors': {
    jointIds: ['joint-wrist', 'joint-elbow'],
    primaryActionKeys: ['wrist-flexion', 'forearm-pronation-assist'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['wrist-extensors'],
    synergistSubIds: ['brachioradialis'],
    notes: 'Medial epicondyle group.',
  },
  'wrist-extensors': {
    jointIds: ['joint-wrist', 'joint-elbow'],
    primaryActionKeys: ['wrist-extension', 'forearm-supination-assist'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['wrist-flexors'],
    synergistSubIds: ['brachioradialis'],
    notes: 'Lateral epicondyle group.',
  },
  brachioradialis: {
    jointIds: ['joint-elbow'],
    primaryActionKeys: ['elbow-flexion-neutral', 'forearm-to-neutral'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['triceps-long', 'triceps-lateral', 'triceps-medial'],
    synergistSubIds: ['brachialis', 'biceps-long'],
    notes: 'Mid-pronation strongest.',
  },

  iliopsoas: {
    jointIds: ['joint-hip', 'joint-spine-lumbar'],
    primaryActionKeys: ['hip-flexion', 'trunk-flexion-assist', 'anterior-pelvic-tilt'],
    planeTags: ['sagittal'],
    antagonistSubIds: ['glute-max', 'biceps-femoris', 'semimembranosus', 'semitendinosus'],
    synergistSubIds: ['rectus-femoris', 'sartorius', 'tfl'],
    notes: 'Psoas crosses lumbar spine; tightness from sitting.',
  },
  tfl: {
    jointIds: ['joint-hip'],
    primaryActionKeys: ['hip-flexion', 'hip-abduction', 'hip-internal-rotation'],
    planeTags: ['sagittal', 'frontal'],
    antagonistSubIds: ['glute-max', 'adductor-magnus', 'adductor-longus'],
    synergistSubIds: ['sartorius', 'glute-med'],
    notes: 'IT band tension overlap.',
  },
  sartorius: {
    jointIds: ['joint-hip', 'joint-knee'],
    primaryActionKeys: ['hip-flexion', 'hip-abduction', 'hip-external-rotation', 'knee-flexion'],
    planeTags: ['sagittal', 'frontal', 'transverse'],
    antagonistSubIds: ['glute-max', 'rectus-femoris', 'vastus-lateralis'],
    synergistSubIds: ['iliopsoas', 'tfl'],
    notes: 'Longest muscle; pes anserinus with semitendinosus/gracilis.',
  },

  'adductor-magnus': {
    jointIds: ['joint-hip'],
    primaryActionKeys: ['hip-adduction', 'hip-extension-posterior-fibers'],
    planeTags: ['frontal', 'sagittal'],
    antagonistSubIds: ['glute-med', 'glute-min', 'tfl'],
    synergistSubIds: ['adductor-longus', 'gracilis'],
    notes: 'Posterior fibers act as hip extensors.',
  },
  'adductor-longus': {
    jointIds: ['joint-hip'],
    primaryActionKeys: ['hip-adduction', 'hip-flexion'],
    planeTags: ['frontal', 'sagittal'],
    antagonistSubIds: ['glute-med', 'glute-min', 'tfl'],
    synergistSubIds: ['adductor-magnus', 'gracilis'],
    notes: 'Common groin strain.',
  },
  gracilis: {
    jointIds: ['joint-hip', 'joint-knee'],
    primaryActionKeys: ['hip-adduction', 'knee-flexion', 'tibia-internal-rotation'],
    planeTags: ['frontal', 'sagittal', 'transverse'],
    antagonistSubIds: ['glute-med', 'glute-min', 'biceps-femoris'],
    synergistSubIds: ['adductor-magnus', 'semitendinosus', 'semimembranosus'],
    notes: 'Pes anserinus.',
  },

  sternocleidomastoid: {
    jointIds: ['joint-spine-cervical'],
    primaryActionKeys: ['cervical-flexion-bilateral', 'contralateral-rotation', 'cervical-lateral-flexion'],
    planeTags: ['sagittal', 'transverse', 'frontal'],
    antagonistSubIds: ['levator-scapulae', 'upper-trap'],
    synergistSubIds: ['scalenes'],
    notes: 'Unilateral actions paired; simplified antagonists for hypertonicity patterns.',
  },
  scalenes: {
    jointIds: ['joint-spine-cervical'],
    primaryActionKeys: ['cervical-lateral-flexion', 'rib-elevation-assist'],
    planeTags: ['frontal'],
    antagonistSubIds: ['sternocleidomastoid'],
    synergistSubIds: ['levator-scapulae'],
    notes: 'Thoracic outlet / neurovascular entrapment relevance.',
  },
  'levator-scapulae': {
    jointIds: ['joint-spine-cervical', 'joint-scapula'],
    primaryActionKeys: ['scapular-elevation', 'cervical-lateral-flexion', 'cervical-rotation'],
    planeTags: ['frontal'],
    antagonistSubIds: ['lower-trap', 'serratus-ant'],
    synergistSubIds: ['upper-trap'],
    notes: 'Cervical attachment C1–C4.',
  },

  'serratus-ant': {
    jointIds: ['joint-scapula'],
    primaryActionKeys: ['scapular-protraction', 'scapular-upward-rotation', 'scapular-stabilization'],
    planeTags: ['transverse', 'sagittal'],
    antagonistSubIds: ['rhomboid-major', 'middle-trap'],
    synergistSubIds: ['lower-trap', 'pec-minor'],
    notes: 'Chest-tab id; obliques tab duplicates as serratus-anterior.',
  },
  'serratus-anterior': {
    jointIds: ['joint-scapula'],
    primaryActionKeys: ['scapular-protraction', 'scapular-upward-rotation', 'scapular-stabilization'],
    planeTags: ['transverse', 'sagittal'],
    antagonistSubIds: ['rhomboid-major', 'middle-trap'],
    synergistSubIds: ['lower-trap', 'pec-minor'],
    notes: 'Same muscle as serratus-ant; obliques parent in app.',
  },
};

/**
 * @param {string} muscleId — full id e.g. biceps-long-l, or parent biceps-l (returns null for parents without a sub row)
 * @returns {MuscleMechanicsEntry | null}
 */
export function getMuscleMechanics(muscleId) {
  const parsed = fromMuscleId(muscleId);
  if (!parsed?.slug) return null;
  return MUSCLE_MECHANICS[parsed.slug] || null;
}

export function listMechanicsBaseIds() {
  return Object.keys(MUSCLE_MECHANICS);
}
