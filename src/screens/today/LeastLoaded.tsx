import { leastLoadedMuscles, muscleVolumeInWindow } from '../../lib/metrics'
import { MUSCLE_LABELS } from '../../lib/muscles'
import type { Exercise, Session } from '../../types'

type Props = {
  sessions: Session[]
  exercises: Exercise[]
  bodyweightKg: number
  referenceDate: string
}

const WINDOW_DAYS = 10
const COUNT = 3

export default function LeastLoaded({
  sessions,
  exercises,
  bodyweightKg,
  referenceDate,
}: Props) {
  const volumes = muscleVolumeInWindow(
    sessions,
    exercises,
    bodyweightKg,
    WINDOW_DAYS,
    referenceDate,
  )
  const total = Object.values(volumes).reduce((a, b) => a + b, 0)

  if (total === 0) {
    return (
      <p className="least-loaded">
        No lifting logged in the last {WINDOW_DAYS} days yet.
      </p>
    )
  }

  const least = leastLoadedMuscles(volumes, COUNT).map((m) => MUSCLE_LABELS[m])
  const names =
    least.length > 1
      ? `${least.slice(0, -1).join(', ')} and ${least[least.length - 1]}`
      : least[0]
  const verb = least.length > 1 ? "haven't" : "hasn't"

  return (
    <p className="least-loaded">
      {names} {verb} been worked much in the last {WINDOW_DAYS} days.
    </p>
  )
}
