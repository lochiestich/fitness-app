import { BACK_REGIONS, FRONT_REGIONS } from '../../lib/bodyRegions'
import type { MuscleId } from '../../types'
import './MuscleScores.css'

type Props = {
  fatigue: Record<MuscleId, number>
}

const ALL_REGIONS = [...FRONT_REGIONS, ...BACK_REGIONS]

export default function MuscleScores({ fatigue }: Props) {
  const rows = ALL_REGIONS.map((region) => {
    const sum = region.muscles.reduce((total, m) => total + (fatigue[m] ?? 0), 0)
    const score = Math.round((sum / region.muscles.length) * 100)
    return { label: region.label, score }
  }).sort((a, b) => b.score - a.score)

  return (
    <div className="muscle-scores">
      {rows.map((row) => (
        <div className="muscle-scores__row" key={row.label}>
          <span className="muscle-scores__label">{row.label}</span>
          <div className="muscle-scores__bar-track">
            <div className="muscle-scores__bar" style={{ width: `${row.score}%` }} />
          </div>
          <span className="muscle-scores__value">{row.score}</span>
        </div>
      ))}
    </div>
  )
}
