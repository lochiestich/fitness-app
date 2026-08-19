import { addDays, startOfWeek } from '../../lib/metrics'
import { todayLocalDate } from '../../lib/store'
import type { Session } from '../../types'
import './Today.css'

type Props = {
  sessions: Session[]
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function StreakBar({ sessions }: Props) {
  const today = todayLocalDate()
  const weekStart = startOfWeek(today)
  const trainedDates = new Set(sessions.map((s) => s.date))
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="streak-bar">
      {days.map((date, i) => {
        const isFilled = trainedDates.has(date)
        const isToday = date === today
        const isFuture = date > today
        const classes = [
          'streak-bar__pip',
          isFilled && 'streak-bar__pip--filled',
          isFuture && 'streak-bar__pip--future',
          isToday && 'streak-bar__pip--today',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div className="streak-bar__day" key={date}>
            <span className="streak-bar__label">{DAY_LABELS[i]}</span>
            <span className={classes} />
          </div>
        )
      })}
    </div>
  )
}
