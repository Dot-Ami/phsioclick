import { useCallback } from 'react'
import { getSubMuscles } from './muscle-data.js'
import { inferLateralSideFromPointerEvent } from './atlas-pointer-utils.js'
import { bodyFront, FRONT_DIVIDERS } from './atlas-assets/bodyFront.js'
import { bodyBack, BACK_DIVIDERS } from './atlas-assets/bodyBack.js'
import { bodyFemaleFront, FEMALE_FRONT_DIVIDERS } from './atlas-assets/bodyFemaleFront.js'
import { bodyFemaleBack, FEMALE_BACK_DIVIDERS } from './atlas-assets/bodyFemaleBack.js'
import { SvgMaleWrapper } from '../vendor/react-muscle-highlighter/dist/esm/components/SvgMaleWrapper.js'
import { SvgFemaleWrapper } from '../vendor/react-muscle-highlighter/dist/esm/components/SvgFemaleWrapper.js'

/**
 * Drop-in replacement for react-muscle-highlighter Body using patched male
 * front/back assets (split deltoids). Adds data-path-side for hover labels.
 */
export default function BodyAtlas({
  colors = ['#0984e3', '#74b9ff'],
  data,
  scale = 1,
  side = 'front',
  gender = 'male',
  onBodyPartPress,
  border = '#dfdfdf',
  disabledParts = [],
  hiddenParts = [],
  defaultFill = '#3f3f3f',
  defaultStroke = 'none',
  defaultStrokeWidth = 0,
}) {
  const getPartStyles = useCallback(
    (bodyPart) => ({
      fill: bodyPart.styles?.fill ?? defaultFill,
      stroke: bodyPart.styles?.stroke ?? defaultStroke,
      strokeWidth: bodyPart.styles?.strokeWidth ?? defaultStrokeWidth,
    }),
    [defaultFill, defaultStroke, defaultStrokeWidth],
  )

  const mergedBodyParts = useCallback(
    (dataSource) => {
      const filtered = dataSource.filter((part) => !hiddenParts.includes(part.slug))
      const userDataMap = new Map()
      data.forEach((userPart) => {
        if (userPart.slug) userDataMap.set(userPart.slug, userPart)
      })
      return filtered.map((assetPart) => {
        const userPart = userDataMap.get(assetPart.slug)
        if (!userPart) return assetPart
        const merged = {
          ...assetPart,
          styles: userPart.styles,
          intensity: userPart.intensity,
          side: userPart.side,
          color: userPart.color,
        }
        if (!merged.styles?.fill && !merged.color && merged.intensity) {
          merged.color = colors[merged.intensity - 1]
        }
        return merged
      })
    },
    [data, colors, hiddenParts],
  )

  const getColorToFill = (bodyPart) => {
    if (bodyPart.slug && disabledParts.includes(bodyPart.slug)) return '#EBEBE4'
    if (bodyPart.styles?.fill) return bodyPart.styles.fill
    if (bodyPart.color) return bodyPart.color
    if (bodyPart.intensity && bodyPart.intensity > 0) return colors[bodyPart.intensity - 1]
    return undefined
  }

  const isPartDisabled = (slug) => slug && disabledParts.includes(slug)

  const bodyToRender =
    gender === 'female'
      ? side === 'front'
        ? bodyFemaleFront
        : bodyFemaleBack
      : side === 'front'
        ? bodyFront
        : bodyBack

  const SvgWrapper = gender === 'male' ? SvgMaleWrapper : SvgFemaleWrapper

  return (
    <SvgWrapper side={side} scale={scale} border={border}>
      {mergedBodyParts(bodyToRender).flatMap((bodyPart) => {
        const partStyles = getPartStyles(bodyPart)
        const commonPaths = (bodyPart.path?.common || []).map((pathD, index) => {
          const fillColor = getColorToFill(bodyPart)
          return (
            <path
              key={`${bodyPart.slug}-common-${index}`}
              data-body-slug={bodyPart.slug}
              data-path-side="common"
              onClick={
                isPartDisabled(bodyPart.slug)
                  ? undefined
                  : (e) => {
                      const subs = getSubMuscles(bodyPart.slug);
                      if (subs && subs.length > 0) {
                        onBodyPartPress?.(bodyPart, inferLateralSideFromPointerEvent(e));
                      } else {
                        onBodyPartPress?.(bodyPart);
                      }
                    }
              }
              style={{
                cursor: isPartDisabled(bodyPart.slug) ? 'not-allowed' : 'pointer',
                opacity: isPartDisabled(bodyPart.slug) ? 0.6 : 1,
              }}
              aria-disabled={isPartDisabled(bodyPart.slug)}
              id={`${bodyPart.slug}-common-${index}`}
              fill={fillColor ?? partStyles.fill}
              stroke={partStyles.stroke}
              strokeWidth={partStyles.strokeWidth}
              d={pathD}
            />
          )
        })

        const leftPaths = (bodyPart.path?.left || []).map((pathD, index) => {
          const isOnlyRight = data.find((d) => d.slug === bodyPart.slug)?.side === 'right'
          const fillColor = isOnlyRight ? defaultFill : getColorToFill(bodyPart)
          return (
            <path
              key={`${bodyPart.slug}-left-${index}`}
              data-body-slug={bodyPart.slug}
              data-path-side="left"
              onClick={
                isPartDisabled(bodyPart.slug)
                  ? undefined
                  : () => onBodyPartPress?.(bodyPart, 'left')
              }
              style={{
                cursor: isPartDisabled(bodyPart.slug) ? 'not-allowed' : 'pointer',
                opacity: isPartDisabled(bodyPart.slug) ? 0.6 : 1,
              }}
              id={`${bodyPart.slug}-left-${index}`}
              fill={fillColor ?? partStyles.fill}
              stroke={partStyles.stroke}
              strokeWidth={partStyles.strokeWidth}
              d={pathD}
            />
          )
        })

        const rightPaths = (bodyPart.path?.right || []).map((pathD, index) => {
          const isOnlyLeft = data.find((d) => d.slug === bodyPart.slug)?.side === 'left'
          const fillColor = isOnlyLeft ? defaultFill : getColorToFill(bodyPart)
          return (
            <path
              key={`${bodyPart.slug}-right-${index}`}
              data-body-slug={bodyPart.slug}
              data-path-side="right"
              onClick={
                isPartDisabled(bodyPart.slug)
                  ? undefined
                  : () => onBodyPartPress?.(bodyPart, 'right')
              }
              style={{
                cursor: isPartDisabled(bodyPart.slug) ? 'not-allowed' : 'pointer',
                opacity: isPartDisabled(bodyPart.slug) ? 0.6 : 1,
              }}
              id={`${bodyPart.slug}-right-${index}`}
              fill={fillColor ?? partStyles.fill}
              stroke={partStyles.stroke}
              strokeWidth={partStyles.strokeWidth}
              d={pathD}
            />
          )
        })

        return [...commonPaths, ...leftPaths, ...rightPaths]
      })}
      {(gender === 'male'
        ? (side === 'front' ? FRONT_DIVIDERS : BACK_DIVIDERS)
        : (side === 'front' ? FEMALE_FRONT_DIVIDERS : FEMALE_BACK_DIVIDERS)
      ).map(
          (d, i) => (
            <path
              key={`muscle-divider-${i}`}
              d={d}
              fill="none"
              stroke={border}
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ pointerEvents: 'none' }}
            />
          ),
        )}
    </SvgWrapper>
  )
}

