import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadDB, todayLocalDate } from '../lib/store'
import { toLocalDateString } from '../lib/metrics'
import './Calendar.css'

const MONTH_LABEL = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function mondayOffset(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay() // 0=Sun..6=Sat
  return jsDay === 0 ? 6 : jsDay - 1
}

export default function Calendar() {
  const navigate = useNavigate()
  const today = todayLocalDate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const trainedDates = new Set(loadDB().sessions.map((s) => s.date))

  const totalDays = daysInMonth(year, month)
  const offset = mondayOffset(year, month)
  const cells: (string | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) =>
      toLocalDateString(new Date(year, month, i + 1)),
    ),
  ]

  const changeMonth = (delta: number) => {
    let m = month + delta
    let y = year
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setMonth(m)
    setYear(y)
  }

  return (
    <section>
      <h1>Calendar</h1>
      <div className="calendar-nav">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
          ‹
        </button>
        <span>{MONTH_LABEL.format(new Date(year, month, 1))}</span>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {WEEKDAY_LABELS.map((label, i) => (
          <span className="calendar-weekday" key={i}>
            {label}
          </span>
        ))}
        {cells.map((date, i) =>
          date ? (
            <button
              key={date}
              type="button"
              className={[
                'calendar-day',
                trainedDates.has(date) && 'calendar-day--trained',
                date === today && 'calendar-day--today',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => navigate(`/day/${date}`)}
            >
              {Number(date.slice(-2))}
            </button>
          ) : (
            <span key={`empty-${i}`} className="calendar-day calendar-day--empty" />
          ),
        )}
      </div>
    </section>
  )
}
