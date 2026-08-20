import { useNavigate } from 'react-router-dom'
import { consistencyGrid } from '../../lib/metrics'
import type { Session } from '../../types'
import './Progress.css'

type Props = {
  sessions: Session[]
  referenceDate: string
}

const WEEKS = 12
const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const TYPE_LABEL: Record<Session['type'], string> = {
  lift: 'Lift',
  cardio: 'Cardio',
  polo: 'Polo',
}

function cellClass(types: Session['type'][]): string {
  if (types.length === 0) return 'consistency-grid__cell'
  if (types.length > 1) return 'consistency-grid__cell consistency-grid__cell--mixed'
  return `consistency-grid__cell consistency-grid__cell--${types[0]}`
}

export default function ConsistencyGrid({ sessions, referenceDate }: Props) {
  const navigate = useNavigate()
  const days = consistencyGrid(sessions, referenceDate, WEEKS)
  const trainedDays = days.filter((d) => d.types.length > 0).length

  // Lay out as columns of 7 (Mon-Sun), oldest week first, so it reads left-to-right.
  const columns: (typeof days)[] = []
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7))

  return (
    <div className="progress-block">
      <div className="consistency-grid__header">
        <h2>Consistency</h2>
        <button
          type="button"
          className="consistency-grid__calendar-link"
          onClick={() => navigate('/calendar')}
        >
          Open calendar
        </button>
      </div>
      <div className="consistency-grid">
        <div className="consistency-grid__column consistency-grid__column--labels">
          {WEEKDAY_LABELS.map((label, i) => (
            <span className="consistency-grid__weekday" key={i}>
              {label}
            </span>
          ))}
        </div>
        {columns.map((week, i) => (
          <div className="consistency-grid__column" key={i}>
            {week.map((day) => (
              <div
                key={day.date}
                className={cellClass(day.types)}
                title={`${day.date}${day.types.length ? ' — ' + day.types.map((t) => TYPE_LABEL[t]).join(', ') : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="consistency-grid__count">
        {trainedDays} of {WEEKS * 7} days trained in the last {WEEKS} weeks
      </p>
    </div>
  )
}
