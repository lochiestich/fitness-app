import { fatigueColor } from '../lib/color'
import { REGIONS, FRONT_VIEWBOX, BACK_VIEWBOX } from '../lib/bodyRegions'
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
  view,
  viewBox,
  fatigue,
}: {
  label: string
  view: 'front' | 'back'
  viewBox: string
  fatigue: Record<MuscleId, number>
}) {
  return (
    <div className="body-map__figure-wrap">
      <svg
        viewBox={viewBox}
        className="body-map__figure"
        role="img"
        aria-label={`${label} view, muscles coloured by recent training load`}
      >
        {REGIONS.map((region) =>
          region[view].map((d, i) => (
            <path
              key={`${region.id}-${i}`}
              d={d}
              fill={fatigueColor(averageFatigue(fatigue, region.muscles))}
            />
          )),
        )}
      </svg>
      <span className="body-map__caption">{label}</span>
    </div>
  )
}

export default function BodyMap({ fatigue }: Props) {
  return (
    <div className="body-map">
      <Figure label="Front" view="front" viewBox={FRONT_VIEWBOX} fatigue={fatigue} />
      <Figure label="Back" view="back" viewBox={BACK_VIEWBOX} fatigue={fatigue} />
    </div>
  )
}
