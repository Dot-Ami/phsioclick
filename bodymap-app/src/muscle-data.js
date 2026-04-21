const SLUG_META = {
  chest: {
    label: 'Chest (Pectoralis)',
    primaryView: 'front',
    movementGroups: ['push'],
    primaryActions: ['Horizontal adduction', 'Shoulder flexion', 'Internal rotation'],
    clinicalNotes: 'Often tight from desk posture; reciprocal inhibition of mid/lower traps.',
  },
  obliques: {
    label: 'Obliques',
    primaryView: 'front',
    movementGroups: ['rotation', 'daily'],
    primaryActions: ['Trunk rotation', 'Lateral flexion', 'Compression of abdomen'],
    clinicalNotes: 'Key anti-rotation stabilizer. Weakness may present as low-back compensation.',
  },
  abs: {
    label: 'Abs (Rectus Abdominis)',
    primaryView: 'front',
    movementGroups: ['rotation', 'daily', 'squat'],
    primaryActions: ['Trunk flexion', 'Posterior pelvic tilt', 'Compression of abdomen'],
    clinicalNotes: 'Anterior core; excessive dominance can inhibit diaphragmatic breathing.',
  },
  biceps: {
    label: 'Biceps',
    primaryView: 'front',
    movementGroups: ['pull'],
    primaryActions: ['Elbow flexion', 'Forearm supination', 'Shoulder flexion assist'],
    clinicalNotes: 'Overuse may indicate lat or scapular weakness during pulling patterns.',
  },
  triceps: {
    label: 'Triceps',
    primaryView: 'front',
    movementGroups: ['push'],
    primaryActions: ['Elbow extension', 'Shoulder extension assist'],
    clinicalNotes: 'Long head crosses shoulder; tightness may limit overhead reach.',
  },
  neck: {
    label: 'Neck',
    primaryView: 'front',
    movementGroups: ['daily'],
    primaryActions: ['Cervical flexion/extension', 'Lateral flexion', 'Rotation'],
    clinicalNotes: 'SCM and scalene tension common with forward-head posture.',
  },
  trapezius: {
    label: 'Trapezius',
    primaryView: 'back',
    movementGroups: ['pull', 'daily'],
    primaryActions: ['Scapular elevation', 'Scapular retraction', 'Scapular depression'],
    clinicalNotes: 'Upper trap dominance is extremely common; lower trap often weak.',
  },
  deltoids: {
    label: 'Deltoids (Shoulder)',
    primaryView: 'front',
    movementGroups: ['push', 'pull'],
    primaryActions: ['Shoulder abduction', 'Flexion', 'Extension'],
    clinicalNotes: 'Posterior deltoid often weak relative to anterior; contributes to rounded shoulders.',
  },
  forearm: {
    label: 'Forearm',
    primaryView: 'front',
    movementGroups: ['pull', 'daily'],
    primaryActions: ['Wrist flexion/extension', 'Grip strength', 'Pronation/supination'],
    clinicalNotes: 'Grip fatigue may limit pulling volume; lateral epicondylitis risk.',
  },
  head: {
    label: 'Head',
    primaryView: 'front',
    movementGroups: ['daily'],
    primaryActions: [],
    clinicalNotes: 'Temporalis and masseter tension may relate to cervical dysfunction.',
  },
  hands: {
    label: 'Hands',
    primaryView: 'front',
    movementGroups: ['daily'],
    primaryActions: ['Grip', 'Fine motor control'],
    clinicalNotes: 'Hand/wrist pain may indicate forearm or nerve entrapment issues.',
  },
  quadriceps: {
    label: 'Quadriceps',
    primaryView: 'front',
    movementGroups: ['squat', 'daily'],
    primaryActions: ['Knee extension', 'Hip flexion (rectus femoris)'],
    clinicalNotes: 'Quad dominance vs glute weakness is a common compensation pattern.',
  },
  adductors: {
    label: 'Adductors (Inner Thigh)',
    primaryView: 'front',
    movementGroups: ['squat', 'daily'],
    primaryActions: ['Hip adduction', 'Hip flexion assist', 'Pelvic stabilization'],
    clinicalNotes: 'Often compensate for weak glute medius; groin strain risk.',
  },
  tibialis: {
    label: 'Tibialis Anterior',
    primaryView: 'front',
    movementGroups: ['daily'],
    primaryActions: ['Ankle dorsiflexion', 'Foot inversion'],
    clinicalNotes: 'Shin splint risk; weakness affects gait toe clearance.',
  },
  calves: {
    label: 'Calves (Gastrocnemius/Soleus)',
    primaryView: 'front',
    movementGroups: ['squat', 'daily'],
    primaryActions: ['Ankle plantarflexion', 'Knee flexion assist (gastroc)'],
    clinicalNotes: 'Tightness limits ankle dorsiflexion → squat depth and knee valgus.',
  },
  knees: {
    label: 'Knees',
    primaryView: 'front',
    movementGroups: ['squat', 'daily'],
    primaryActions: [],
    clinicalNotes: 'Knee pain often stems from hip or ankle dysfunction, not the knee itself.',
  },
  ankles: {
    label: 'Ankles',
    primaryView: 'front',
    movementGroups: ['squat', 'daily'],
    primaryActions: [],
    clinicalNotes: 'Ankle mobility is foundational for squat depth and single-leg stability.',
  },
  feet: {
    label: 'Feet',
    primaryView: 'front',
    movementGroups: ['daily'],
    primaryActions: [],
    clinicalNotes: 'Arch collapse or rigidity affects entire kinetic chain.',
  },
  'upper-back': {
    label: 'Upper Back (Rhomboids/Lats)',
    primaryView: 'back',
    movementGroups: ['pull'],
    primaryActions: ['Scapular retraction', 'Shoulder extension', 'Shoulder adduction'],
    clinicalNotes: 'Lat tightness limits overhead mobility; rhomboid weakness allows scapular winging.',
  },
  'lower-back': {
    label: 'Lower Back (Erector Spinae)',
    primaryView: 'back',
    movementGroups: ['hinge', 'daily'],
    primaryActions: ['Spinal extension', 'Lateral flexion', 'Anti-flexion bracing'],
    clinicalNotes: 'Low back pain is often a symptom of hip or core weakness, not the primary issue.',
  },
  gluteal: {
    label: 'Glutes',
    primaryView: 'back',
    movementGroups: ['hinge', 'squat'],
    primaryActions: ['Hip extension', 'Hip abduction', 'External rotation'],
    clinicalNotes: 'Glute amnesia is extremely common; linked to low back, knee, and ankle issues.',
  },
  hamstring: {
    label: 'Hamstrings',
    primaryView: 'back',
    movementGroups: ['hinge'],
    primaryActions: ['Knee flexion', 'Hip extension', 'Pelvic posterior tilt'],
    clinicalNotes: 'Often "tight" due to neural tension, not actual shortness. Check SLR vs knee extension.',
  },
  hair: {
    label: 'Head (Back)',
    primaryView: 'back',
    movementGroups: ['daily'],
    primaryActions: [],
    clinicalNotes: '',
  },
  'hip-flexors': {
    label: 'Hip Flexors',
    primaryView: 'front',
    movementGroups: ['squat', 'daily'],
    primaryActions: ['Hip flexion', 'Anterior pelvic tilt', 'Trunk flexion assist'],
    clinicalNotes: 'Chronic tightness from prolonged sitting; reciprocal inhibition of glutes. Key contributor to anterior pelvic tilt and low-back pain.',
  },
};

export const SUB_MUSCLES = {
  chest: [
    { id: 'pec-major', label: 'Pectoralis Major', actions: ['Horizontal adduction', 'Shoulder flexion', 'Internal rotation'], notes: 'Large fan-shaped muscle; upper fibers assist flexion, lower fibers assist extension from flexed position.' },
    { id: 'pec-upper', label: 'Pec Major (Upper / Clavicular)', actions: ['Shoulder flexion', 'Horizontal adduction'], notes: 'Clavicular head; targeted with incline pressing movements. Often underdeveloped relative to sternal head.' },
    { id: 'pec-lower', label: 'Pec Major (Lower / Sternal)', actions: ['Horizontal adduction', 'Internal rotation', 'Shoulder extension from flexed'], notes: 'Sternal head; targeted with decline and flat pressing. Dominant in most pressing patterns.' },
    { id: 'pec-minor', label: 'Pectoralis Minor', actions: ['Scapular depression', 'Scapular protraction', 'Downward rotation'], notes: 'Beneath pec major; tightness contributes to forward shoulder posture and impingement.' },
    { id: 'serratus-ant', label: 'Serratus Anterior', actions: ['Scapular protraction', 'Upward rotation', 'Scapular stabilization'], notes: 'Critical for overhead movements; weakness causes scapular winging.' },
  ],
  deltoids: [
    { id: 'anterior-delt', label: 'Anterior Deltoid', actions: ['Shoulder flexion', 'Internal rotation', 'Horizontal adduction'], notes: 'Often overdeveloped relative to posterior; contributes to rounded shoulders.' },
    { id: 'lateral-delt', label: 'Lateral Deltoid', actions: ['Shoulder abduction'], notes: 'Primary mover for lateral raise; supraspinatus initiates first 15°.' },
    { id: 'posterior-delt', label: 'Posterior Deltoid', actions: ['Shoulder extension', 'Horizontal abduction', 'External rotation'], notes: 'Commonly weak; strengthening helps counter anterior dominance.' },
  ],
  trapezius: [
    { id: 'upper-trap', label: 'Upper Trapezius', actions: ['Scapular elevation', 'Cervical extension', 'Lateral flexion'], notes: 'Commonly overactive; contributes to neck tension and headaches.' },
    { id: 'middle-trap', label: 'Middle Trapezius', actions: ['Scapular retraction', 'Scapular stabilization'], notes: 'Works with rhomboids; weakness allows scapular protraction.' },
    { id: 'lower-trap', label: 'Lower Trapezius', actions: ['Scapular depression', 'Upward rotation'], notes: 'Often weak; critical for overhead mechanics and scapular positioning.' },
  ],
  biceps: [
    { id: 'biceps-long', label: 'Biceps (Long Head)', actions: ['Elbow flexion', 'Forearm supination', 'Shoulder flexion'], notes: 'Crosses shoulder joint; tendon impingement risk in bicipital groove.' },
    { id: 'biceps-short', label: 'Biceps (Short Head)', actions: ['Elbow flexion', 'Forearm supination'], notes: 'Originates from coracoid process; assists in horizontal adduction.' },
    { id: 'brachialis', label: 'Brachialis', actions: ['Elbow flexion'], notes: 'Primary elbow flexor regardless of forearm position; deeper than biceps.' },
  ],
  triceps: [
    { id: 'triceps-long', label: 'Triceps (Long Head)', actions: ['Elbow extension', 'Shoulder extension', 'Shoulder adduction'], notes: 'Crosses shoulder joint; tightness may limit overhead flexion.' },
    { id: 'triceps-lateral', label: 'Triceps (Lateral Head)', actions: ['Elbow extension'], notes: 'Strongest head; primary mover for pushdowns and pressing.' },
    { id: 'triceps-medial', label: 'Triceps (Medial Head)', actions: ['Elbow extension'], notes: 'Active across all ranges; stabilizer during fine elbow movements.' },
  ],
  quadriceps: [
    { id: 'rectus-femoris', label: 'Rectus Femoris', actions: ['Knee extension', 'Hip flexion'], notes: 'Only quad crossing the hip; tight RF limits hip extension and promotes anterior pelvic tilt.' },
    { id: 'vastus-lateralis', label: 'Vastus Lateralis', actions: ['Knee extension'], notes: 'Largest quad; lateral patellar tracking when dominant over VMO.' },
    { id: 'vastus-medialis', label: 'Vastus Medialis (VMO)', actions: ['Knee extension', 'Patellar stabilization'], notes: 'Critical for patellar tracking; first to atrophy after knee injury.' },
    { id: 'vastus-intermedius', label: 'Vastus Intermedius', actions: ['Knee extension'], notes: 'Deepest quad; beneath rectus femoris.' },
  ],
  hamstring: [
    { id: 'biceps-femoris', label: 'Biceps Femoris', actions: ['Knee flexion', 'Hip extension', 'External rotation of tibia'], notes: 'Lateral hamstring; most commonly strained of the group.' },
    { id: 'semitendinosus', label: 'Semitendinosus', actions: ['Knee flexion', 'Hip extension', 'Internal rotation of tibia'], notes: 'Medial hamstring; commonly used as ACL graft source.' },
    { id: 'semimembranosus', label: 'Semimembranosus', actions: ['Knee flexion', 'Hip extension', 'Internal rotation of tibia'], notes: 'Deepest medial hamstring; important for knee stability.' },
  ],
  gluteal: [
    { id: 'glute-max', label: 'Gluteus Maximus', actions: ['Hip extension', 'External rotation', 'Hip abduction (upper fibers)'], notes: 'Largest muscle in body; inhibition leads to hamstring and low-back compensation.' },
    { id: 'glute-med', label: 'Gluteus Medius', actions: ['Hip abduction', 'Internal rotation (anterior)', 'External rotation (posterior)'], notes: 'Critical for single-leg stability; weakness = Trendelenburg sign, knee valgus.' },
    { id: 'glute-min', label: 'Gluteus Minimus', actions: ['Hip abduction', 'Internal rotation'], notes: 'Deepest glute; works with medius for pelvic stabilization.' },
  ],
  calves: [
    { id: 'gastrocnemius', label: 'Gastrocnemius', actions: ['Ankle plantarflexion', 'Knee flexion'], notes: 'Crosses knee joint; test length with knee extended.' },
    { id: 'soleus', label: 'Soleus', actions: ['Ankle plantarflexion'], notes: 'Does not cross knee; test with knee bent. Critical for sustained standing and walking.' },
  ],
  'upper-back': [
    { id: 'latissimus-dorsi', label: 'Latissimus Dorsi', actions: ['Shoulder extension', 'Shoulder adduction', 'Internal rotation'], notes: 'Largest back muscle; tightness limits overhead mobility and contributes to impingement.' },
    { id: 'rhomboid-major', label: 'Rhomboid Major', actions: ['Scapular retraction', 'Downward rotation'], notes: 'Works with middle trap for scapular positioning; weakness allows protraction.' },
    { id: 'rhomboid-minor', label: 'Rhomboid Minor', actions: ['Scapular retraction', 'Scapular stabilization'], notes: 'Smaller superior rhomboid; often grouped with major clinically.' },
    { id: 'teres-major', label: 'Teres Major', actions: ['Shoulder adduction', 'Internal rotation', 'Shoulder extension'], notes: 'Works synergistically with lats; functionally the "little lat."' },
    { id: 'infraspinatus', label: 'Infraspinatus', actions: ['External rotation', 'Shoulder stabilization'], notes: 'Rotator cuff muscle; commonly injured in overhead athletes.' },
    { id: 'teres-minor', label: 'Teres Minor', actions: ['External rotation', 'Shoulder stabilization'], notes: 'Rotator cuff muscle; works with infraspinatus for external rotation.' },
    { id: 'supraspinatus', label: 'Supraspinatus', actions: ['Shoulder abduction (initiation)', 'Shoulder stabilization'], notes: 'Rotator cuff muscle; initiates first 15° of abduction. Most commonly torn rotator cuff tendon.' },
    { id: 'subscapularis', label: 'Subscapularis', actions: ['Internal rotation', 'Shoulder stabilization', 'Shoulder adduction'], notes: 'Largest rotator cuff muscle; lies on anterior scapula. Critical for anterior shoulder stability.' },
  ],
  'lower-back': [
    { id: 'erector-spinae', label: 'Erector Spinae', actions: ['Spinal extension', 'Lateral flexion', 'Rotation'], notes: 'Three columns (iliocostalis, longissimus, spinalis); primary back extensors.' },
    { id: 'quadratus-lumborum', label: 'Quadratus Lumborum (QL)', actions: ['Lateral flexion', 'Hip hiking', 'Spinal extension'], notes: 'Key pelvic stabilizer; tightness causes lateral shift. Common source of low-back pain.' },
    { id: 'multifidus', label: 'Multifidus', actions: ['Segmental spinal stabilization', 'Extension'], notes: 'Deep stabilizer; atrophies rapidly after injury. Critical for rehab.' },
  ],
  abs: [
    { id: 'rectus-abdominis', label: 'Rectus Abdominis', actions: ['Trunk flexion', 'Posterior pelvic tilt'], notes: 'Six-pack muscle; excessive training can inhibit deep core stabilizers.' },
    { id: 'transverse-abdominis', label: 'Transverse Abdominis', actions: ['Core compression', 'Spinal stabilization', 'Forced expiration'], notes: 'Deepest abdominal; anticipatory firing before limb movements. Key rehab target.' },
  ],
  obliques: [
    { id: 'external-oblique', label: 'External Oblique', actions: ['Contralateral rotation', 'Lateral flexion', 'Trunk flexion'], notes: 'Superficial oblique; fibers run downward and medially.' },
    { id: 'internal-oblique', label: 'Internal Oblique', actions: ['Ipsilateral rotation', 'Lateral flexion', 'Trunk flexion'], notes: 'Deep oblique; fibers run upward and medially. Works with contralateral external oblique.' },
    { id: 'serratus-anterior', label: 'Serratus Anterior', actions: ['Scapular protraction', 'Upward rotation', 'Scapular stabilization'], notes: 'Finger-like attachments on ribs; weakness causes scapular winging.' },
  ],
  forearm: [
    { id: 'wrist-flexors', label: 'Wrist Flexors', actions: ['Wrist flexion', 'Forearm pronation'], notes: 'Medial epicondyle group; overuse leads to medial epicondylitis (golfer\'s elbow).' },
    { id: 'wrist-extensors', label: 'Wrist Extensors', actions: ['Wrist extension', 'Forearm supination'], notes: 'Lateral epicondyle group; overuse leads to lateral epicondylitis (tennis elbow).' },
    { id: 'brachioradialis', label: 'Brachioradialis', actions: ['Elbow flexion (neutral grip)', 'Forearm pronation/supination to neutral'], notes: 'Most active during hammer curls; bridges forearm and upper arm.' },
  ],
  neck: [
    { id: 'sternocleidomastoid', label: 'Sternocleidomastoid (SCM)', actions: ['Cervical flexion (bilateral)', 'Contralateral rotation', 'Lateral flexion'], notes: 'Hypertonic SCM common with forward head posture; can contribute to headaches.' },
    { id: 'scalenes', label: 'Scalenes', actions: ['Cervical lateral flexion', 'Rib elevation (breathing assist)'], notes: 'Can entrap brachial plexus / subclavian artery (thoracic outlet syndrome).' },
    { id: 'levator-scapulae', label: 'Levator Scapulae', actions: ['Scapular elevation', 'Cervical lateral flexion', 'Cervical rotation'], notes: 'Common source of neck/shoulder pain; often tight from stress and desk posture.' },
  ],
  adductors: [
    { id: 'adductor-magnus', label: 'Adductor Magnus', actions: ['Hip adduction', 'Hip extension (posterior fibers)'], notes: 'Largest adductor; posterior fibers function like a hamstring.' },
    { id: 'adductor-longus', label: 'Adductor Longus', actions: ['Hip adduction', 'Hip flexion'], notes: 'Most commonly strained adductor; groin pull risk in sports.' },
    { id: 'gracilis', label: 'Gracilis', actions: ['Hip adduction', 'Knee flexion', 'Internal rotation of tibia'], notes: 'Only adductor crossing the knee; sometimes used as surgical graft.' },
  ],
  tibialis: [
    { id: 'tibialis-anterior', label: 'Tibialis Anterior', actions: ['Ankle dorsiflexion', 'Foot inversion'], notes: 'Shin splint risk; weakness affects gait toe clearance.' },
  ],
  'hip-flexors': [
    { id: 'iliopsoas', label: 'Iliopsoas (Psoas + Iliacus)', actions: ['Hip flexion', 'Trunk flexion', 'Anterior pelvic tilt'], notes: 'Primary hip flexor; psoas originates from lumbar spine. Tightness from sitting contributes to lordosis and low-back pain.' },
    { id: 'tfl', label: 'Tensor Fasciae Latae (TFL)', actions: ['Hip flexion', 'Hip abduction', 'Internal rotation'], notes: 'Attaches to IT band; overactivity contributes to IT band syndrome and lateral knee pain.' },
    { id: 'sartorius', label: 'Sartorius', actions: ['Hip flexion', 'Hip abduction', 'External rotation', 'Knee flexion'], notes: 'Longest muscle in the body; crosses both hip and knee joints. Part of pes anserinus at the knee.' },
  ],
};

const COMPENSATOR_MAP = {
  'chest': ['upper-back', 'trapezius', 'deltoids', 'neck'],
  'obliques': ['lower-back', 'abs', 'gluteal'],
  'abs': ['lower-back', 'obliques', 'neck'],
  'biceps': ['forearm', 'deltoids', 'trapezius'],
  'triceps': ['deltoids', 'chest', 'forearm'],
  'neck': ['trapezius', 'upper-back', 'deltoids'],
  'trapezius': ['neck', 'deltoids', 'upper-back'],
  'deltoids': ['trapezius', 'chest', 'triceps'],
  'forearm': ['biceps', 'triceps', 'hands'],
  'quadriceps': ['hamstring', 'gluteal', 'calves'],
  'adductors': ['gluteal', 'quadriceps', 'lower-back'],
  'tibialis': ['calves', 'ankles', 'quadriceps'],
  'calves': ['tibialis', 'hamstring', 'ankles'],
  'knees': ['quadriceps', 'hamstring', 'calves'],
  'ankles': ['calves', 'tibialis', 'feet'],
  'feet': ['calves', 'ankles', 'tibialis'],
  'upper-back': ['chest', 'trapezius', 'deltoids'],
  'lower-back': ['gluteal', 'abs', 'hamstring'],
  'gluteal': ['lower-back', 'hamstring', 'quadriceps'],
  'hamstring': ['gluteal', 'lower-back', 'calves'],
  'head': ['neck', 'trapezius'],
  'hands': ['forearm', 'biceps'],
  'hair': ['neck', 'trapezius'],
  'hip-flexors': ['gluteal', 'lower-back', 'quadriceps', 'hamstring'],
};

const SUB_TO_PARENT = {};
for (const [parentSlug, subs] of Object.entries(SUB_MUSCLES)) {
  for (const sub of subs) {
    SUB_TO_PARENT[sub.id] = parentSlug;
  }
}

function buildMuscles() {
  const muscles = [];
  const extra = [];

  for (const [slug, meta] of Object.entries(SLUG_META)) {
    const hasSides = slug !== 'head' && slug !== 'hair';
    const compensators = (COMPENSATOR_MAP[slug] || []).flatMap(s => [`${s}-l`, `${s}-r`]).slice(0, 6);

    if (hasSides) {
      for (const side of ['l', 'r']) {
        const sideLabel = side === 'l' ? 'L' : 'R';
        const fullSide = side === 'l' ? 'left' : 'right';
        muscles.push({
          id: `${slug}-${side}`,
          slug,
          side: fullSide,
          label: `${meta.label} (${sideLabel})`,
          primaryView: meta.primaryView,
          movementGroups: meta.movementGroups,
          primaryActions: meta.primaryActions,
          clinicalNotes: meta.clinicalNotes,
          commonCompensators: compensators,
        });

        const subs = SUB_MUSCLES[slug];
        if (subs) {
          for (const sub of subs) {
            extra.push({
              id: `${sub.id}-${side}`,
              slug: sub.id,
              parentSlug: slug,
              side: fullSide,
              label: `${sub.label} (${sideLabel})`,
              primaryView: meta.primaryView,
              movementGroups: meta.movementGroups,
              primaryActions: sub.actions,
              clinicalNotes: sub.notes,
              commonCompensators: compensators,
              isSubMuscle: true,
            });
          }
        }
      }
    } else {
      muscles.push({
        id: slug,
        slug,
        side: null,
        label: meta.label,
        primaryView: meta.primaryView,
        movementGroups: meta.movementGroups,
        primaryActions: meta.primaryActions,
        clinicalNotes: meta.clinicalNotes,
        commonCompensators: (COMPENSATOR_MAP[slug] || []).flatMap(s => [`${s}-l`, `${s}-r`]).slice(0, 6),
      });
    }
  }

  return { muscles, subMuscles: extra };
}

const built = buildMuscles();
export const MUSCLES = built.muscles;

const muscleMap = new Map(MUSCLES.map(m => [m.id, m]));
for (const sub of built.subMuscles) {
  muscleMap.set(sub.id, sub);
}

export function getMuscle(id) {
  return muscleMap.get(id) || null;
}

export function getMuscleLabel(id) {
  return muscleMap.get(id)?.label || id;
}

export function toMuscleId(slug, side) {
  if (!side) return slug;
  return `${slug}-${side === 'left' ? 'l' : 'r'}`;
}

export function fromMuscleId(muscleId) {
  if (!muscleId) return null;
  if (muscleId.endsWith('-l')) return { slug: muscleId.slice(0, -2), side: 'left' };
  if (muscleId.endsWith('-r')) return { slug: muscleId.slice(0, -2), side: 'right' };
  return { slug: muscleId, side: undefined };
}

/**
 * Maps SUB_MUSCLES sub-ids → atlas geometry slugs (split paths in BodyAtlas).
 * Used by getBodySlug to highlight the correct sub-region when a sub-muscle
 * is selected.
 */
const SUB_TO_ATLAS_SLUG = {
  'anterior-delt': 'deltoid-anterior',
  'lateral-delt': 'deltoid-lateral',
  'posterior-delt': 'deltoid-posterior',
  'rectus-femoris': 'quad-rectus-femoris',
  'vastus-lateralis': 'quad-vastus-lateralis',
  'vastus-medialis': 'quad-vastus-medialis',
  'glute-max': 'gluteal-maximus',
  'glute-med': 'gluteal-medius',
  'glute-min': 'gluteal-medius',
  'biceps-femoris': 'hamstring-biceps-femoris',
  'semitendinosus': 'hamstring-semitendinosus',
  'semimembranosus': 'hamstring-semimembranosus',
  'latissimus-dorsi': 'back-lats',
  'rhomboid-major': 'back-lats',
  'rhomboid-minor': 'back-lats',
  'teres-major': 'back-teres-major',
  'infraspinatus': 'back-infraspinatus',
  'teres-minor': 'back-infraspinatus',
  'supraspinatus': 'trap-upper',
  'subscapularis': 'back-infraspinatus',
  'pec-upper': 'chest-upper',
  'pec-lower': 'chest-lower',
  'pec-minor': 'chest-lower',
  'upper-trap': 'trap-upper',
  'middle-trap': 'trap-middle',
  'lower-trap': 'trap-lower',
  'iliopsoas': 'abs',
  'tfl': 'obliques',
  'sartorius': 'adductors',
};

export function getBodySlug(muscleId) {
  if (!muscleId) return null;
  const info = fromMuscleId(muscleId);
  if (!info) return null;
  if (SLUG_META[info.slug]) return info;
  const atlasSlug = SUB_TO_ATLAS_SLUG[info.slug];
  if (atlasSlug) return { slug: atlasSlug, side: info.side };
  const parent = SUB_TO_PARENT[info.slug];
  if (parent) return { slug: parent, side: info.side };
  return info;
}

/** Atlas slug → SUB_MUSCLES sub-id (for direct-select on click / tooltips). */
export const ATLAS_SLUG_TO_SUB = {
  'deltoid-anterior': 'anterior-delt',
  'deltoid-lateral': 'lateral-delt',
  'deltoid-posterior': 'posterior-delt',
  'quad-rectus-femoris': 'rectus-femoris',
  'quad-vastus-lateralis': 'vastus-lateralis',
  'quad-vastus-medialis': 'vastus-medialis',
  'gluteal-maximus': 'glute-max',
  'gluteal-medius': 'glute-med',
  'hamstring-biceps-femoris': 'biceps-femoris',
  'hamstring-semitendinosus': 'semitendinosus',
  'hamstring-semimembranosus': 'semimembranosus',
  'back-lats': 'latissimus-dorsi',
  'back-infraspinatus': 'infraspinatus',
  'back-teres-major': 'teres-major',
  'chest-upper': 'pec-upper',
  'chest-lower': 'pec-lower',
  'trap-upper': 'upper-trap',
  'trap-middle': 'middle-trap',
  'trap-lower': 'lower-trap',
};

/**
 * When a PARENT slug is selected (e.g. "entire quadriceps"), expand it to
 * the atlas sub-slugs so all sub-region paths light up.
 */
export const PARENT_TO_ATLAS_SLUGS = {
  deltoids: ['deltoid-anterior', 'deltoid-lateral', 'deltoid-posterior'],
  quadriceps: ['quad-rectus-femoris', 'quad-vastus-lateralis', 'quad-vastus-medialis'],
  gluteal: ['gluteal-maximus', 'gluteal-medius'],
  hamstring: ['hamstring-biceps-femoris', 'hamstring-semitendinosus', 'hamstring-semimembranosus'],
  'upper-back': ['back-lats', 'back-infraspinatus', 'back-teres-major'],
  chest: ['chest-upper', 'chest-lower'],
  trapezius: ['trap-upper', 'trap-middle', 'trap-lower'],
};

export function getSubMuscles(slug) {
  return SUB_MUSCLES[slug] || null;
}

export const LEGACY_ID_MAP = {
  'upper-chest': 'chest',
  'mid-chest': 'chest',
  'pec-major-upper-l': 'pec-upper-l',
  'pec-major-upper-r': 'pec-upper-r',
  'pec-major-lower-l': 'pec-lower-l',
  'pec-major-lower-r': 'pec-lower-r',
  'pec-minor-l': 'chest-l',
  'pec-minor-r': 'chest-r',
  'anterior-delt-l': 'anterior-delt-l',
  'anterior-delt-r': 'anterior-delt-r',
  'lateral-delt-l': 'lateral-delt-l',
  'lateral-delt-r': 'lateral-delt-r',
  'posterior-delt-l': 'posterior-delt-l',
  'posterior-delt-r': 'posterior-delt-r',
  'biceps-l': 'biceps-l',
  'biceps-r': 'biceps-r',
  'triceps-long-l': 'triceps-l',
  'triceps-long-r': 'triceps-r',
  'triceps-lateral-l': 'triceps-l',
  'triceps-lateral-r': 'triceps-r',
  'upper-trap-l': 'trapezius-l',
  'upper-trap-r': 'trapezius-r',
  'middle-trap-l': 'trapezius-l',
  'middle-trap-r': 'trapezius-r',
  'lower-trap-l': 'trapezius-l',
  'lower-trap-r': 'trapezius-r',
  'latissimus-dorsi-l': 'upper-back-l',
  'latissimus-dorsi-r': 'upper-back-r',
  'rhomboid-major-l': 'upper-back-l',
  'rhomboid-major-r': 'upper-back-r',
  'erector-spinae-l': 'lower-back-l',
  'erector-spinae-r': 'lower-back-r',
  'rectus-abdominis-upper-l': 'abs-l',
  'rectus-abdominis-upper-r': 'abs-r',
  'rectus-abdominis-lower-l': 'abs-l',
  'rectus-abdominis-lower-r': 'abs-r',
  'external-oblique-l': 'obliques-l',
  'external-oblique-r': 'obliques-r',
  'internal-oblique-l': 'obliques-l',
  'internal-oblique-r': 'obliques-r',
  'gluteus-maximus-l': 'gluteal-l',
  'gluteus-maximus-r': 'gluteal-r',
  'gluteus-medius-l': 'gluteal-l',
  'gluteus-medius-r': 'gluteal-r',
  'rectus-femoris-l': 'quadriceps-l',
  'rectus-femoris-r': 'quadriceps-r',
  'vastus-lateralis-l': 'quadriceps-l',
  'vastus-lateralis-r': 'quadriceps-r',
  'vastus-medialis-l': 'quadriceps-l',
  'vastus-medialis-r': 'quadriceps-r',
  'semitendinosus-l': 'hamstring-l',
  'semitendinosus-r': 'hamstring-r',
  'biceps-femoris-l': 'hamstring-l',
  'biceps-femoris-r': 'hamstring-r',
  'semimembranosus-l': 'hamstring-l',
  'semimembranosus-r': 'hamstring-r',
  'gastrocnemius-medial-l': 'calves-l',
  'gastrocnemius-medial-r': 'calves-r',
  'gastrocnemius-lateral-l': 'calves-l',
  'gastrocnemius-lateral-r': 'calves-r',
  'soleus-l': 'calves-l',
  'soleus-r': 'calves-r',
  'tibialis-anterior-l': 'tibialis-l',
  'tibialis-anterior-r': 'tibialis-r',
  'serratus-anterior-l': 'obliques-l',
  'serratus-anterior-r': 'obliques-r',
  'iliopsoas-l': 'iliopsoas-l',
  'iliopsoas-r': 'iliopsoas-r',
  'hip-joint-l': 'gluteal-l',
  'hip-joint-r': 'gluteal-r',
  'knee-joint-l': 'knees-l',
  'knee-joint-r': 'knees-r',
  'ankle-joint-l': 'ankles-l',
  'ankle-joint-r': 'ankles-r',
  'shoulder-joint-l': 'deltoids-l',
  'shoulder-joint-r': 'deltoids-r',
  'elbow-joint-l': 'forearm-l',
  'elbow-joint-r': 'forearm-r',
  'wrist-joint-l': 'hands-l',
  'wrist-joint-r': 'hands-r',
};

export function migrateLegacyId(id) {
  if (!id) return id;
  if (muscleMap.has(id)) return id;
  return LEGACY_ID_MAP[id] || id;
}
