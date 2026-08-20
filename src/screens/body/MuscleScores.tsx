import { fatigueColor } from '../../lib/color'
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
    const value = sum / region.muscles.length
    return { label: region.label, score: Math.round(value * 100), value }
  }).sort((a, b) => b.score - a.score)

  return (
    <div className="muscle-scores">
      <h2>Load score</h2>
      {rows.map((row) => (
        <div className="muscle-scores__row" key={row.label}>
          <span className="muscle-scores__label">{row.label}</span>
          <div className="muscle-scores__bar-track">
            <div
              className="muscle-scores__bar"
              style={{ width: `${row.score}%`, background: fatigueColor(row.value) }}
            />
          </div>
          <span className="muscle-scores__value">{row.score}</span>
        </div>
      ))}
    </div>
  )
}
