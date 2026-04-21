/**
 * Female back atlas: vendor bodyFemaleBack passed through for now.
 *
 * FUTURE: Split deltoids, upper-back, trapezius, gluteal, hamstring etc.
 * using the same flatMap pattern as the male bodyBack.js. Requires manually
 * splitting each female SVG path's geometry (different from male proportions).
 */
import { bodyFemaleBack as vendorBack } from '../../vendor/react-muscle-highlighter/dist/esm/assets/bodyFemaleBack.js'

export const bodyFemaleBack = vendorBack.flatMap((part) => {
  // Infrastructure for future splits:
  // if (part.slug === 'deltoids')   return FEMALE_BACK_DELTOID_PARTS;
  // if (part.slug === 'upper-back') return FEMALE_BACK_UPPERBACK_PARTS;
  // if (part.slug === 'trapezius')  return FEMALE_BACK_TRAP_PARTS;
  // if (part.slug === 'gluteal')    return FEMALE_BACK_GLUTE_PARTS;
  // if (part.slug === 'hamstring')  return FEMALE_BACK_HAM_PARTS;
  return [part]
})

export const FEMALE_BACK_DIVIDERS = []
