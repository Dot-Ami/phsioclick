/**
 * Female front atlas: vendor bodyFemaleFront passed through for now.
 *
 * FUTURE: Split deltoids, chest, quadriceps etc. using the same flatMap
 * pattern as the male bodyFront.js. Requires manually splitting each
 * female SVG path's geometry (different from male proportions).
 */
import { bodyFemaleFront as vendorFront } from '../../vendor/react-muscle-highlighter/dist/esm/assets/bodyFemaleFront.js'

export const bodyFemaleFront = vendorFront.flatMap((part) => {
  // Infrastructure for future splits:
  // if (part.slug === 'deltoids') return FEMALE_FRONT_DELTOID_PARTS;
  // if (part.slug === 'chest')    return FEMALE_FRONT_CHEST_PARTS;
  // if (part.slug === 'quadriceps') return FEMALE_FRONT_QUAD_PARTS;
  return [part]
})

export const FEMALE_FRONT_DIVIDERS = []
