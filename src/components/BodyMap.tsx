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
}

function averageFatigue(fatigue: Record<MuscleId, number>, muscles: MuscleId[]): number {
  const sum = muscles.reduce((total, m) => total + (fatigue[m] ?? 0), 0)
  return sum / muscles.length
}

function Figure({
  label,
  regions,
  viewBoxHeight,
  fatigue,
}: {
  label: string
  regions: BodyRegion[]
  viewBoxHeight: number
  fatigue: Record<MuscleId, number>
}) {
  return (
    <div className="body-map__figure-wrap">
      <svg
        viewBox={`0 0 100 ${viewBoxHeight}`}
        className="body-map__figure"
        role="img"
        aria-label={`${label} view, muscles coloured by recent training load`}
      >
        <circle cx="50" cy="14" r="12" className="body-map__head" />
        <rect x="43" y="20" width="14" height="12" rx="4" className="body-map__neck" />
        {regions.map((region) => (
          <g key={region.id}>
            {region.shapes.map((shape, i) => (
              <rect
                key={i}
                x={shape.x}
                y={shape.y}
                width={shape.w}
                height={shape.h}
                rx={Math.min(shape.w, shape.h) / 2}
                fill={fatigueColor(averageFatigue(fatigue, region.muscles))}
              />
            ))}
          </g>
        ))}
      </svg>
      <span className="body-map__caption">{label}</span>
    </div>
  )
}

export default function BodyMap({ fatigue }: Props) {
  return (
    <div className="body-map">
      <Figure
        label="Front"
        regions={FRONT_REGIONS}
        viewBoxHeight={FRONT_VIEWBOX_HEIGHT}
        fatigue={fatigue}
      />
      <Figure
        label="Back"
        regions={BACK_REGIONS}
        viewBoxHeight={BACK_VIEWBOX_HEIGHT}
        fatigue={fatigue}
      />
    </div>
  )
}
