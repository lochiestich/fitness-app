import {
  bestPaceForActivity,
  bestSetForExercise,
  loggedCardioActivities,
  loggedExerciseIds,
} from '../../lib/metrics'
import type { CardioActivity, Exercise, Session } from '../../types'
import './Progress.css'

type Props = {
  sessions: Session[]
  exercises: Exercise[]
  bodyweightKg: number
}

function formatPace(activity: CardioActivity, pace: number): string {
  if (activity === 'cycle' || activity === 'row') return `${pace.toFixed(1)} km/h`
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  const unit = activity === 'swim' ? '/100m' : '/km'
  return `${minutes}:${String(seconds).padStart(2, '0')}${unit}`
}

export default function PersonalRecords({ sessions, exercises, bodyweightKg }: Props) {
  const liftPRs = loggedExerciseIds(sessions)
    .map((id) => {
      const exercise = exercises.find((e) => e.id === id)
      const best = bestSetForExercise(sessions, exercises, bodyweightKg, id)
      if (!exercise || !best) return null
      return { name: exercise.name, value: `${best.weightKg}kg × ${best.reps}`, date: best.date }
    })
    .filter((pr): pr is NonNullable<typeof pr> => pr !== null)
    .sort((a, b) => a.name.localeCompare(b.name))

  const cardioPRs = loggedCardioActivities(sessions)
    .map((activity) => {
      const best = bestPaceForActivity(sessions, activity)
      if (!best) return null
      return {
        name: `${activity[0].toUpperCase() + activity.slice(1)} pace`,
        value: formatPace(activity, best.pace),
        date: best.date,
      }
    })
    .filter((pr): pr is NonNullable<typeof pr> => pr !== null)

  const records = [...liftPRs, ...cardioPRs]

  if (records.length === 0) {
    return (
      <div className="progress-block">
        <h2>Personal records</h2>
        <p className="progress-empty">Log a lift or cardio session to see PRs here.</p>
      </div>
    )
  }

  return (
    <div className="progress-block">
      <h2>Personal records</h2>
      <div className="personal-records">
        {records.map((pr) => (
          <div key={pr.name} className="personal-records__row">
            <span>{pr.name}</span>
            <span className="personal-records__value">{pr.value}</span>
            <span className="personal-records__date">{pr.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
