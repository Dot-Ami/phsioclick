import { useState, useMemo, useCallback } from 'react';
import BodyAtlas from './BodyAtlas';
import {
  getMuscle,
  toMuscleId,
  getBodySlug,
  getSubMuscles,
  ATLAS_SLUG_TO_SUB,
  PARENT_TO_ATLAS_SLUGS,
} from './muscle-data';

export default function MuscleAtlas({
  view = 'front',
  onSelect,
  origin,
  sensation,
  heatScores = {},
  showHeat = false,
  pickMode,
  recruitmentTint = null,
  stateColors = null,
}) {

  const bodyData = useMemo(() => {
    const parts = [];
    const usedSlugs = new Map();

    const addPart = (muscleId, color) => {
      const body = getBodySlug(muscleId);
      if (!body) return;

      const atlasExpansion = PARENT_TO_ATLAS_SLUGS[body.slug];
      if (atlasExpansion) {
        const key0 = `${body.slug}-${body.side || 'mid'}`;
        if (!usedSlugs.has(key0)) {
          usedSlugs.set(key0, true);
          parts.push({ slug: body.slug, color, side: body.side });
        }
        for (const s of atlasExpansion) {
          const key = `${s}-${body.side || 'mid'}`;
          if (usedSlugs.has(key)) continue;
          usedSlugs.set(key, true);
          parts.push({ slug: s, color, side: body.side });
        }
        return;
      }

      const key = `${body.slug}-${body.side || 'mid'}`;
      if (usedSlugs.has(key)) return;
      usedSlugs.set(key, true);
      parts.push({ slug: body.slug, color, side: body.side });
    };

    if (recruitmentTint) {
      for (const [baseId, color] of Object.entries(recruitmentTint)) {
        addPart(`${baseId}-l`, color);
        addPart(`${baseId}-r`, color);
      }
    }

    // Stage 02-A.5 / U4: state heat (tight=amber, weak=indigo, balanced=teal)
    // Keys are full muscle ids (with -l/-r suffix) so we can paint each side
    // independently. Painted before origin/sensation so the active selection
    // still wins visually.
    if (stateColors) {
      for (const [muscleId, color] of Object.entries(stateColors)) {
        if (color) addPart(muscleId, color);
      }
    }

    if (origin) addPart(origin, '#22d3ee');
    if (sensation) addPart(sensation, '#f472b6');

    if (showHeat) {
      Object.entries(heatScores).forEach(([id, score]) => {
        const s = Math.min(score, 10) / 10;
        addPart(id, `rgba(239,68,68,${(0.3 + s * 0.5).toFixed(2)})`);
      });
    }

    return parts;
  }, [origin, sensation, heatScores, showHeat, view, recruitmentTint, stateColors]);

  const [hoveredLabel, setHoveredLabel] = useState('');

  /**
   * One rule for all regions: map click always commits a selection immediately.
   * - Split atlas slugs → sub-muscle id (e.g. quad-rectus-femoris → rectus-femoris-l).
   * - Parent with sub-muscles → whole group for that side (e.g. forearm-r); refine via dropdown.
   * - No subs → parent id (head / hair) or toMuscleId(slug, side).
   */
  const handlePress = useCallback(
    (bodyPart, side) => {
      if (bodyPart.slug === 'head' || bodyPart.slug === 'hair') {
        if (onSelect) onSelect(bodyPart.slug);
        return;
      }

      const sideStr = side === 'left' ? 'l' : side === 'right' ? 'r' : null;
      if (!sideStr) return;

      const subBase = ATLAS_SLUG_TO_SUB[bodyPart.slug];
      if (subBase) {
        if (onSelect) onSelect(`${subBase}-${sideStr}`);
        return;
      }

      const subs = getSubMuscles(bodyPart.slug);
      if (subs && subs.length > 0) {
        if (onSelect) onSelect(`${bodyPart.slug}-${sideStr}`);
        return;
      }

      const id = toMuscleId(bodyPart.slug, side);
      if (onSelect) onSelect(id);
    },
    [onSelect],
  );

  const handlePointerEnter = useCallback((e) => {
    const pathEl = e.target.closest?.('path[data-body-slug]');
    if (!pathEl) return;
    const slug = pathEl.getAttribute('data-body-slug');
    const ps = pathEl.getAttribute('data-path-side') || '';
    const sub = ATLAS_SLUG_TO_SUB[slug];
    if (sub && (ps === 'left' || ps === 'right')) {
      const suf = ps === 'left' ? 'l' : 'r';
      const m = getMuscle(`${sub}-${suf}`);
      setHoveredLabel(m?.label?.replace(/ \(.\)$/, '') || `${sub}-${suf}`);
      return;
    }
    if (ps === 'common') {
      const m = getMuscle(`${slug}-l`) || getMuscle(slug);
      setHoveredLabel(m?.label?.replace(/ \(.\)$/, '') || slug);
      return;
    }
    if (ps === 'left' || ps === 'right') {
      const suf = ps === 'left' ? 'l' : 'r';
      const m = getMuscle(`${slug}-${suf}`);
      setHoveredLabel(m?.label?.replace(/ \(.\)$/, '') || slug);
      return;
    }
    const m = getMuscle(`${slug}-l`) || getMuscle(slug);
    setHoveredLabel(m?.label?.replace(/ \(.\)$/, '') || slug);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setHoveredLabel('');
  }, []);

  const originMuscle = origin ? getMuscle(origin) : null;
  const sensationMuscle = sensation ? getMuscle(sensation) : null;

  return (
    <div
      className="flex flex-col items-center w-full atlas-wrap relative"
      onPointerOver={handlePointerEnter}
      onPointerOut={handlePointerLeave}
    >
      <style>{`
        .atlas-body-frame {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
        .atlas-body-frame .atlas-base-svg svg {
          width: 100% !important;
          height: auto !important;
          display: block;
        }
        .atlas-body-frame .atlas-base-svg svg path[style*="cursor: pointer"] {
          transition: filter 0.15s ease, opacity 0.15s ease;
        }
        .atlas-body-frame .atlas-base-svg svg path[style*="cursor: pointer"]:hover {
          filter: brightness(1.8) drop-shadow(0 0 10px rgba(100,180,255,0.4));
        }
      `}</style>

      <div className="atlas-body-frame">
        <div className="atlas-base-svg">
          <BodyAtlas
            data={bodyData}
            side={view}
            gender="male"
            scale={2}
            onBodyPartPress={handlePress}
            border="#2a2a44"
            defaultFill="#1e1030"
            defaultStroke="none"
          />
        </div>
      </div>

      {hoveredLabel && (
        <div className="mt-1 text-center text-xs text-zinc-300 font-medium">
          {hoveredLabel}
        </div>
      )}

      <p className="mt-2 max-w-[400px] text-center text-[10px] leading-snug text-zinc-500">
        Click sets <span className="text-zinc-400">whole group</span> for that side (L/R). Use the origin dropdown for sub-muscles (e.g. wrist flexors).
      </p>

      <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#22d3ee' }} />
          Origin
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#f472b6' }} />
          Sensation
        </span>
        {pickMode && (
          <span className="text-yellow-400 font-medium animate-pulse">
            Click to set {pickMode}
          </span>
        )}
      </div>

      {(origin || sensation) && (
        <div className="w-full mt-2 space-y-1 text-[11px]">
          {originMuscle && (
            <div className="bg-cyan-950/40 border border-cyan-800/30 rounded px-2 py-1">
              <span className="text-cyan-300 font-medium">Origin:</span>{' '}
              <span className="text-gray-300">{originMuscle.label}</span>
              {originMuscle.isSubMuscle && (
                <span className="ml-1 text-cyan-600 text-[10px]">
                  ({getMuscle(`${originMuscle.parentSlug}-${originMuscle.side === 'left' ? 'l' : 'r'}`)?.label?.replace(/ \(.\)$/, '') || ''})
                </span>
              )}
              {originMuscle.clinicalNotes && (
                <p className="text-gray-500 mt-0.5 leading-tight">{originMuscle.clinicalNotes}</p>
              )}
            </div>
          )}
          {sensationMuscle && (
            <div className="bg-pink-950/40 border border-pink-800/30 rounded px-2 py-1">
              <span className="text-pink-300 font-medium">Sensation:</span>{' '}
              <span className="text-gray-300">{sensationMuscle.label}</span>
              {sensationMuscle.isSubMuscle && (
                <span className="ml-1 text-pink-600 text-[10px]">
                  ({getMuscle(`${sensationMuscle.parentSlug}-${sensationMuscle.side === 'left' ? 'l' : 'r'}`)?.label?.replace(/ \(.\)$/, '') || ''})
                </span>
              )}
              {sensationMuscle.clinicalNotes && (
                <p className="text-gray-500 mt-0.5 leading-tight">{sensationMuscle.clinicalNotes}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
