/**
 * Male front atlas: vendor bodyFront with deltoids replaced by split paths
 * (anterior + lateral).
 *
 * RIGHT side = reference geometry (de Casteljau split of vendor deltoid).
 * LEFT side  = exact mirror of right across x = 362 (viewBox center).
 * This guarantees both sides are perfectly proportional.
 */
import { bodyFront as vendorFront } from '../../vendor/react-muscle-highlighter/dist/esm/assets/bodyFront.js'
import { deltoidDivider } from './deltoidDivider.js'

const MIRROR = 724
const rightDiv = deltoidDivider(495.13, 306.98, 501.75, 395.98)
const leftDiv  = deltoidDivider(MIRROR - 495.13, 306.98, MIRROR - 501.75, 395.98)

const FRONT_DELTOID_PARTS = [
  {
    slug: 'deltoid-anterior',
    color: '#3f3f3f',
    path: {
      left: [
        `M228.87 306.98${leftDiv.forward}c1.52 -.94 2.87 -2.55 4.38 -4.29c5.81 -6.70 13.46 -14.12 15.99 -22.80c3.93 -13.43 -4.32 -27.54 9.64 -37.62q8.22 -5.93 17.99 -9.08q1.84 -.59 3.36 -1.44q.95 -.52 .70 -1.58c-1.57 -6.61 -5.80 -9.10 -12.14 -11.90c-12.50 -5.52 -23.44 -4.68 -33.30 -0.29Z`,
      ],
      right: [
        `M495.13 306.98${rightDiv.forward}c-1.52 -.94 -2.87 -2.55 -4.38 -4.29c-5.81 -6.70 -13.46 -14.12 -15.99 -22.80c-3.93 -13.43 4.32 -27.54 -9.64 -37.62q-8.22 -5.93 -17.99 -9.08q-1.84 -.59 -3.36 -1.44q-.95 -.52 -.70 -1.58c1.57 -6.61 5.80 -9.10 12.14 -11.90c12.50 -5.52 23.44 -4.68 33.30 -0.29Z`,
      ],
    },
  },
  {
    slug: 'deltoid-lateral',
    color: '#3f3f3f',
    path: {
      left: [
        `M228.87 306.98c-9.87 4.38 -18.67 12.33 -26.87 21.03c-20.73 21.99 -11.81 56.44 14.82 68.19c2.21 0.97 3.90 0.71 5.43 -0.22${leftDiv.reverse}Z`,
      ],
      right: [
        `M495.13 306.98c9.87 4.38 18.67 12.33 26.87 21.03c20.73 21.99 11.81 56.44 -14.82 68.19c-2.21 0.97 -3.90 0.71 -5.43 -0.22${rightDiv.reverse}Z`,
      ],
    },
  },
]

/* ── Chest split ──────────────────────────────────────────────────────────
 * Vendor chest = 1 path per side. Bezier-split into upper pec (clavicular)
 * and lower pec (sternal) at t=0.4 on both inner and outer edges.
 *
 * Right inner edge split (t=0.4): (369.42, 370.56)
 * Right outer edge split (t=0.4): (471.64, 389.57)
 * Left = mirror of right across x = 362 (MIRROR / 2).
 */
const chestRDiv = deltoidDivider(369.42, 370.56, 471.64, 389.57)
const chestLDiv = deltoidDivider(MIRROR - 369.42, 370.56, MIRROR - 471.64, 389.57)

const FRONT_CHEST_PARTS = [
  {
    slug: 'chest-upper',
    color: '#3f3f3f',
    path: {
      right: [
        `M369.42 370.56c-0.11 -15.73 2.25 -31.33 10.85 -44.01c4.26 -6.26 10.49 -7.93 18.36 -8.56q11.66 -.92 23.32 -.35c10.58 .53 18.02 2.74 26.62 7.87c12.81 7.65 19.73 14.52 22.67 29.75c1.98 10.22 2.41 22.53 0.40 34.31${chestRDiv.reverse}Z`,
      ],
      left: [
        `M354.58 370.56c0.11 -15.73 -2.25 -31.33 -10.85 -44.01c-4.26 -6.26 -10.49 -7.93 -18.36 -8.56q-11.66 -.92 -23.32 -.35c-10.58 .53 -18.02 2.74 -26.62 7.87c-12.81 7.65 -19.73 14.52 -22.67 29.75c-1.98 10.22 -2.41 22.53 -0.40 34.31${chestLDiv.reverse}Z`,
      ],
    },
  },
  {
    slug: 'chest-lower',
    color: '#3f3f3f',
    path: {
      right: [
        `M471.64 389.57c-3.02 17.68 -11.54 34.16 -28.61 40.66q-12.26 4.67 -26.99 4.77c-15.12 .11 -34.46 -6.78 -41.37 -21.48q-1.88 -3.99 -2.84 -12.18c-1.16 -9.76 -2.33 -20.29 -2.41 -30.78${chestRDiv.forward}Z`,
      ],
      left: [
        `M252.36 389.57c3.02 17.68 11.54 34.16 28.61 40.66q12.26 4.67 26.99 4.77c15.12 .11 34.46 -6.78 41.37 -21.48q1.88 -3.99 2.84 -12.18c1.16 -9.76 2.33 -20.29 2.41 -30.78${chestLDiv.forward}Z`,
      ],
    },
  },
]

export const FRONT_DIVIDERS = [
  leftDiv.stroke, rightDiv.stroke,
  chestLDiv.stroke, chestRDiv.stroke,
]

const FRONT_QUAD_PARTS = [
  {
    slug: 'quad-rectus-femoris',
    color: '#3f3f3f',
    path: {
      left: ['M292.42 935.6q-.95-.52-1.57-1.4-4.1-5.79-7-13.53-7.8-20.79-13.3-42.33c-9.06-35.53-19.33-71.36-25.03-107.59-5.33-33.86 4-74.19 20.7-103.37q.35-.62.53.07c14.44 55.57 39.03 107.94 41.45 165.34 1.11 26.34.66 52.96-3.6 79.03-.63 3.83-4.73 27.81-12.18 23.78z'],
      right: ['M437.82 933.52c-8.9 14.18-15.15-26.74-15.46-29.25q-5.26-43.04-1.19-86.08c4.9-51.8 26.91-99.32 40.38-150.92q.18-.66.5-.06c17.25 31.67 25.39 68.28 20.54 104.36q-2.29 17.02-8.71 42.76-7.56 30.25-15.2 60.47-6.13 24.25-15.06 47.61-1.83 4.79-5.8 11.11z'],
    },
  },
  {
    slug: 'quad-vastus-lateralis',
    color: '#3f3f3f',
    path: {
      left: ['M275.11 942.93q-2.42-2.18-3.57-5.24c-3.98-10.61-7.68-21.02-12.81-31.32-7.85-15.76-10.77-34.56-13.2-51.46-2.11-14.63-2.31-31.47-3.93-47.18-.22-2.16-1.04-12.78.46-13.79q1.36-.92 2.08.55c1.5 3.08 3.12 6.12 3.66 9.58q8.21 52.38 26.36 102.15c2.87 7.87 9.98 30.5 1.85 36.74a.71.7-42.5 01-.9-.03z'],
      right: ['M451.79 942.6c-9.95-10.01 4.97-42.91 8.94-55.41q12.55-39.53 19.27-80.47c.49-2.97 2.64-12.34 5.41-13.28a.83.83 0 011.09.64q.74 4 .45 7.92c-1.99 26.52-3.37 58.99-11.01 87.73q-2.53 9.5-7.46 18.8c-4.38 8.24-6.97 16.72-10.08 25.27q-1.66 4.54-4.55 8.63a1.35 1.35 0 01-2.06.17z'],
    },
  },
  {
    slug: 'quad-vastus-medialis',
    color: '#3f3f3f',
    path: {
      left: ['M322.69 945.72c-3.73 6.14-10.77-2.43-12.6-5.6-3.16-5.47-2.62-14.93-1.78-20.81 4.03-28.09 5.6-52.81 3.48-80.78q-.06-.79.28-.08 15.77 32.83 14.26 68.9c-.4 9.54-2.94 22.48-2.91 34.13q.01 3.02-.73 4.24z'],
      right: ['M406.69 946.81c-3.24-2.77-1.48-10.64-2.01-14.71q-2.23-17.18-2.57-22.16c-1.75-25.07 3.61-49.11 13.98-71.92q.23-.51.2.05c-1.2 19.15-1.28 38.18.83 57.38q1.68 15.4 3.39 30.8c.43 3.92-.31 9.71-2.09 13.33-1.62 3.28-7.58 10.77-11.73 7.23z'],
    },
  },
]

export const bodyFront = vendorFront
  .flatMap((part) => (part.slug === 'deltoids' ? FRONT_DELTOID_PARTS : [part]))
  .flatMap((part) => (part.slug === 'quadriceps' ? FRONT_QUAD_PARTS : [part]))
  .flatMap((part) => (part.slug === 'chest' ? FRONT_CHEST_PARTS : [part]))
