/**
 * Infer left vs right body side from pointer X relative to the SVG viewport.
 * Used for centerline / "common" paths that still need a lateral muscle id (e.g. front neck).
 */
export function inferLateralSideFromPointerEvent(event) {
  const svg = event.currentTarget?.closest?.('svg');
  if (!svg) return 'left';
  const rect = svg.getBoundingClientRect();
  if (rect.width <= 0) return 'left';
  const mid = rect.left + rect.width / 2;
  return event.clientX < mid ? 'left' : 'right';
}
