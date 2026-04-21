/**
 * Shared divider-curve generator for deltoid sub-region boundaries.
 *
 * HOW IT WORKS (de Casteljau / Bezier splitting recap):
 * ─────────────────────────────────────────────────────
 * Each deltoid SVG path from the vendor is ONE closed Bezier.
 * To split it into anterior/lateral (front) or posterior/lateral (back):
 *   1. Pick a point on the TOP cap curve and one on the BOTTOM transition curve
 *      (computed via de Casteljau subdivision at t ≈ 0.5).
 *   2. Draw a smooth cubic Bezier between those two points (the "divider").
 *   3. Construct TWO closed paths: each reuses the ORIGINAL Bezier segments for
 *      its outer boundary + the shared divider (forward on one side, reversed on
 *      the other) so fills meet with zero gap.
 *
 * The constants below control where the divider's control points sit as
 * fractions of the total start→end displacement.  Both sides (left / right)
 * use the SAME fractions so the curves always look symmetric.
 *
 * To adjust the curvature, change CP_FRACS — nothing else needs editing.
 */

const CP_FRACS = { fx: 0.30, fy: 0.31, sx: 0.68, sy: 0.67 }

function r(n) { return Math.round(n * 100) / 100 }

export function deltoidDivider(sx, sy, ex, ey) {
  const dx = ex - sx, dy = ey - sy
  const p1x = dx * CP_FRACS.fx, p1y = dy * CP_FRACS.fy
  const p2x = dx * CP_FRACS.sx, p2y = dy * CP_FRACS.sy
  const ap1x = sx + p1x, ap1y = sy + p1y
  const ap2x = sx + p2x, ap2y = sy + p2y
  return {
    forward:  `c${r(p1x)} ${r(p1y)} ${r(p2x)} ${r(p2y)} ${r(dx)} ${r(dy)}`,
    reverse:  `c${r(ap2x - ex)} ${r(ap2y - ey)} ${r(ap1x - ex)} ${r(ap1y - ey)} ${r(-dx)} ${r(-dy)}`,
    stroke:   `M${r(sx)} ${r(sy)}c${r(p1x)} ${r(p1y)} ${r(p2x)} ${r(p2y)} ${r(dx)} ${r(dy)}`,
  }
}
