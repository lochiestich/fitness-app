import { MUSCLE_LABELS } from '../lib/muscles'
import { fatigueColor } from '../lib/color'
import {
  BACK_REGIONS,
  BACK_VIEWBOX_HEIGHT,
  FRONT_REGIONS,
  FRONT_VIEWBOX_HEIGHT,
  type BodyRegion,
} from '../lib/bodyRegions'
import type { MuscleId } from '../types'
import './BodyMap.css'

type Props = {
  fatigue: Record<MuscleId, number>
  selected: MuscleId | null
  onSelect: (muscle: MuscleId) => void
}

const HIT_PADDING = 3

function Figure({
  label,
  regions,
  viewBoxHeight,
  fatigue,
  selected,
  onSelect,
}: {
  label: string
  regions: BodyRegion[]
  viewBoxHeight: number
  fatigue: Record<MuscleId, number>
  selected: MuscleId | null
  onSelect: (muscle: MuscleId) => void
}) {
  return (
    <div className="body-map__figure-wrap">
      <svg
        viewBox={`0 0 100 ${viewBoxHeight}`}
        className="body-map__figure"
        role="img"
        aria-label={`${label} view`}
      >
        <circle cx="50" cy="14" r="12" className="body-map__head" />
        {regions.map((region) => (
          <g
            key={region.muscle}
            role="button"
            tabIndex={0}
            aria-label={MUSCLE_LABELS[region.muscle]}
            className={
              region.muscle === selected
                ? 'body-map__region body-map__region--selected'
                : 'body-map__region'
            }
            onClick={() => onSelect(region.muscle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(region.muscle)
            }}
          >
            {region.shapes.map((shape, i) => (
              <rect
                key={`hit-${i}`}
                x={shape.x - HIT_PADDING}
                y={shape.y - HIT_PADDING}
                width={shape.w + HIT_PADDING * 2}
                height={shape.h + HIT_PADDING * 2}
                rx={shape.rx + HIT_PADDING}
                fill="transparent"
              />
            ))}
            {region.shapes.map((shape, i) => (
              <rect
                key={`shape-${i}`}
                x={shape.x}
                y={shape.y}
                width={shape.w}
                height={shape.h}
                rx={shape.rx}
                fill={fatigueColor(fatigue[region.muscle] ?? 0)}
              />
            ))}
          </g>
        ))}
      </svg>
      <span className="body-map__caption">{label}</span>
    </div>
  )
}

export default function BodyMap({ fatigue, selected, onSelect }: Props) {
  return (
    <div className="body-map">
      <Figure
        label="Front"
        regions={FRONT_REGIONS}
        viewBoxHeight={FRONT_VIEWBOX_HEIGHT}
        fatigue={fatigue}
        selected={selected}
        onSelect={onSelect}
      />
      <Figure
        label="Back"
        regions={BACK_REGIONS}
        viewBoxHeight={BACK_VIEWBOX_HEIGHT}
        fatigue={fatigue}
        selected={selected}
        onSelect={onSelect}
      />
    </div>
  )
}
