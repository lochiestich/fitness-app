import { sessionsInRange, startOfWeek } from '../../lib/metrics'
import { todayLocalDate } from '../../lib/store'
import type { Session } from '../../types'
import ProgressRing from '../../components/ProgressRing'
import './Today.css'

type Props = {
  sessions: Session[]
}

const LIFT_TARGET = 3
const CARDIO_TARGET = 3

export default function GoalsWidget({ sessions }: Props) {
  const today = todayLocalDate()
  const weekStart = startOfWeek(today)
  const weekSessions = sessionsInRange(sessions, weekStart, today)
  const liftCount = weekSessions.filter((s) => s.type === 'lift').length
  // Polo counts toward cardio -- it's just another activity, not tracked separately.
  const cardioCount = weekSessions.filter(
    (s) => s.type === 'cardio' || s.type === 'polo',
  ).length

  return (
    <div className="goals-widget">
      <ProgressRing
        value={liftCount}
        target={LIFT_TARGET}
        label="Lifts"
        color="var(--color-type-lift)"
      />
      <ProgressRing
        value={cardioCount}
        target={CARDIO_TARGET}
        label="Cardio"
        color="var(--color-type-cardio)"
      />
    </div>
  )
}
