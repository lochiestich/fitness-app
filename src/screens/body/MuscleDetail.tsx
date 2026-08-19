import {
  contributingExercises,
  daysSinceLastWorked,
  muscleVolumeInWindow,
} from '../../lib/metrics'
import type { Exercise, MuscleId, Session } from '../../types'
import './MuscleDetail.css'

type Props = {
  label: string
  muscles: MuscleId[]
  sessions: Session[]
  exercises: Exercise[]
  bodyweightKg: number
  referenceDate: string
}

const CONTRIBUTOR_WINDOW_DAYS = 28

function mergeContributors(
  lists: { exerciseId: string; volume: number }[][],
): { exerciseId: string; volume: number }[] {
  const totals = new Map<string, number>()
  for (const list of lists) {
    for (const c of list) totals.set(c.exerciseId, (totals.get(c.exerciseId) ?? 0) + c.volume)
  }
  return [...totals.entries()]
    .map(([exerciseId, volume]) => ({ exerciseId, volume }))
    .sort((a, b) => b.volume - a.volume)
}

export default function MuscleDetail({
  label,
  muscles,
  sessions,
  exercises,
  bodyweightKg,
  referenceDate,
}: Props) {
  const daysList = muscles
    .map((m) => daysSinceLastWorked(sessions, exercises, bodyweightKg, m, referenceDate))
    .filter((d): d is number => d !== undefined)
  const days = daysList.length > 0 ? Math.min(...daysList) : undefined

  const vol7Map = muscleVolumeInWindow(sessions, exercises, bodyweightKg, 7, referenceDate)
  const vol28Map = muscleVolumeInWindow(sessions, exercises, bodyweightKg, 28, referenceDate)
  const vol7 = muscles.reduce((sum, m) => sum + vol7Map[m], 0)
  const vol28 = muscles.reduce((sum, m) => sum + vol28Map[m], 0)

  const contributors = mergeContributors(
    muscles.map((m) =>
      contributingExercises(
        sessions,
        exercises,
        bodyweightKg,
        m,
        CONTRIBUTOR_WINDOW_DAYS,
        referenceDate,
      ),
    ),
  )

  const sinceLabel =
    days === undefined
      ? 'Never logged'
      : days === 0
        ? 'Worked today'
        : `${days} day${days === 1 ? '' : 's'} since last worked`

  return (
    <div className="muscle-detail">
      <h2>{label}</h2>
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
