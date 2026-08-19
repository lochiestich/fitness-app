import { sessionLoad, sessionsInRange, startOfWeek } from '../../lib/metrics'
import { todayLocalDate } from '../../lib/store'
import type { Session } from '../../types'

type Props = {
  sessions: Session[]
}

export default function WeekSummary({ sessions }: Props) {
  const today = todayLocalDate()
  const weekStart = startOfWeek(today)
  const weekSessions = sessionsInRange(sessions, weekStart, today)
  const totalLoad = Math.round(
    weekSessions.reduce((sum, s) => sum + sessionLoad(s), 0),
  )
  const chukkas = weekSessions
    .filter((s): s is Session & { type: 'polo' } => s.type === 'polo')
    .reduce((sum, s) => sum + s.chukkas, 0)

  return (
    <div className="week-summary">
      <div className="week-summary__stat">
        <span className="week-summary__value">{weekSessions.length}</span>
        <span className="week-summary__label">sessions</span>
      </div>
      <div className="week-summary__stat">
        <span className="week-summary__value">{totalLoad}</span>
        <span className="week-summary__label">load</span>
      </div>
      <div className="week-summary__stat">
        <span className="week-summary__value">{chukkas}</span>
        <span className="week-summary__label">chukkas</span>
      </div>
    </div>
  )
}
