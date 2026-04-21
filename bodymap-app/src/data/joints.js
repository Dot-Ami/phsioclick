/**
 * L0 joint catalog — stable IDs referenced by muscle-mechanics.js.
 * Planes use conventional kinesiology labels (movement relative to anatomical position).
 *
 * CONVENTIONS (L0.4):
 * - Joint IDs use prefix "joint-" and are kebab-case.
 * - degreesOfFreedom lists the DOF the app models; real joints may have more
 *   (document omissions in `note`).
 * - Bump JOINTS_SCHEMA_VERSION when removing or renaming a joint key.
 *
 * INTENTIONALLY OMITTED (v1):
 * - Radioulnar (pronation/supination folded into elbow + wrist for simplicity).
 * - Subtalar (inversion/eversion noted in ankle but not separately modeled).
 * - Thoracic spine (rotation-heavy; add when needed for rotation L1 edges).
 * - SI joint (minimal; add if pelvic mechanics require it).
 */

export const JOINTS_SCHEMA_VERSION = 1;

/** @type {Record<string, { id: string, label: string, degreesOfFreedom: Array<{ kind: string, plane?: string, note?: string }> }>} */
export const JOINTS = {
  'joint-elbow': {
    id: 'joint-elbow',
    label: 'Elbow (humeroulnar / humeroradial)',
    degreesOfFreedom: [
      { kind: 'flexion-extension', plane: 'sagittal', note: 'Primary hinge; forearm moves toward/away from humerus.' },
    ],
  },
  'joint-gh': {
    id: 'joint-gh',
    label: 'Glenohumeral (shoulder) joint',
    degreesOfFreedom: [
      { kind: 'flexion-extension', plane: 'sagittal' },
      { kind: 'abduction-adduction', plane: 'frontal' },
      { kind: 'internal-external-rotation', plane: 'transverse' },
    ],
  },
  'joint-knee': {
    id: 'joint-knee',
    label: 'Knee (tibiofemoral)',
    degreesOfFreedom: [
      { kind: 'flexion-extension', plane: 'sagittal', note: 'Small transverse rotation possible in flexion; omitted for v1.' },
    ],
  },
  'joint-hip': {
    id: 'joint-hip',
    label: 'Hip (femoroacetabular)',
    degreesOfFreedom: [
      { kind: 'flexion-extension', plane: 'sagittal' },
      { kind: 'abduction-adduction', plane: 'frontal' },
      { kind: 'internal-external-rotation', plane: 'transverse' },
    ],
  },
  'joint-ankle': {
    id: 'joint-ankle',
    label: 'Ankle (talocrural)',
    degreesOfFreedom: [
      { kind: 'dorsiflexion-plantarflexion', plane: 'sagittal', note: 'Subtalar inversion/eversion omitted in v1.' },
    ],
  },
  'joint-wrist': {
    id: 'joint-wrist',
    label: 'Wrist (radiocarpal)',
    degreesOfFreedom: [
      { kind: 'flexion-extension', plane: 'sagittal' },
      { kind: 'radial-ulnar-deviation', plane: 'frontal' },
    ],
  },
  'joint-scapula': {
    id: 'joint-scapula',
    label: 'Scapulothoracic (scapula on rib cage)',
    degreesOfFreedom: [
      { kind: 'elevation-depression', plane: 'frontal', note: 'Pseudojoint; no single capsule.' },
      { kind: 'protraction-retraction', plane: 'transverse' },
      { kind: 'upward-downward-rotation', plane: 'sagittal' },
    ],
  },
  'joint-spine-lumbar': {
    id: 'joint-spine-lumbar',
    label: 'Lumbar spine (regional)',
    degreesOfFreedom: [
      { kind: 'flexion-extension', plane: 'sagittal' },
      { kind: 'lateral-flexion', plane: 'frontal' },
      { kind: 'rotation', plane: 'transverse', note: 'Limited relative to thoracic; regional model.' },
    ],
  },
  'joint-spine-cervical': {
    id: 'joint-spine-cervical',
    label: 'Cervical spine (regional)',
    degreesOfFreedom: [
      { kind: 'flexion-extension', plane: 'sagittal' },
      { kind: 'lateral-flexion', plane: 'frontal' },
      { kind: 'rotation', plane: 'transverse' },
    ],
  },
};

export function getJoint(jointId) {
  return JOINTS[jointId] || null;
}
