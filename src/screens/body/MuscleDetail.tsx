import {
  contributingExercises,
  daysSinceLastWorked,
  muscleVolumeInWindow,
} from '../../lib/metrics'
import { MUSCLE_LABELS } from '../../lib/muscles'
import type { Exercise, MuscleId, Session } from '../../types'
import './MuscleDetail.css'

type Props = {
  muscle: MuscleId
  sessions: Session[]
  exercises: Exercise[]
  bodyweightKg: number
  referenceDate: string
}

const CONTRIBUTOR_WINDOW_DAYS = 28

export default function MuscleDetail({
  muscle,
  sessions,
  exercises,
  bodyweightKg,
  referenceDate,
}: Props) {
  const days = daysSinceLastWorked(sessions, exercises, bodyweightKg, muscle, referenceDate)
  const vol7 = muscleVolumeInWindow(sessions, exercises, bodyweightKg, 7, referenceDate)[muscle]
  const vol28 = muscleVolumeInWindow(sessions, exercises, bodyweightKg, 28, referenceDate)[muscle]
  const contributors = contributingExercises(
    sessions,
    exercises,
    bodyweightKg,
    muscle,
    CONTRIBUTOR_WINDOW_DAYS,
    referenceDate,
  )

  const sinceLabel =
    days === undefined
      ? 'Never logged'
      : days === 0
        ? 'Worked today'
        : `${days} day${days === 1 ? '' : 's'} since last worked`

  return (
    <div className="muscle-detail">
      <h2>{MUSCLE_LABELS[muscle]}</h2>
      <p className="muscle-detail__since">{sinceLabel}</p>
      <div className="muscle-detail__volumes">
        <div className="muscle-detail__volume">
          <span className="muscle-detail__value">{Math.round(vol7)}</span>
          <span className="muscle-detail__label">7 day volume</span>
        </div>
        <div className="muscle-detail__volume">
          <span className="muscle-detail__value">{Math.round(vol28)}</span>
          <span className="muscle-detail__label">28 day volume</span>
        </div>
      </div>
      {contributors.length > 0 && (
        <div className="muscle-detail__contributors">
          <p className="muscle-detail__label">
            Contributing exercises ({CONTRIBUTOR_WINDOW_DAYS} days)
          </p>
          {contributors.map((c) => (
            <div key={c.exerciseId} className="muscle-detail__contributor">
              <span>{exercises.find((e) => e.id === c.exerciseId)?.name ?? c.exerciseId}</span>
              <span>{Math.round(c.volume)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
