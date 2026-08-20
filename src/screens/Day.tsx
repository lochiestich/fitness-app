import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { allExercises, loadDB } from '../lib/store'
import SessionRow from '../components/SessionRow'
import './Day.css'
import './log/LogForm.css'

const DATE_LABEL = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function Day() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const [db, setDb] = useState(() => loadDB())
  const exercises = allExercises(db)

  if (!date) return null

  const sessions = db.sessions.filter((s) => s.date === date)
  const label = DATE_LABEL.format(new Date(`${date}T00:00:00`))

  return (
    <section>
      <button type="button" className="day-back" onClick={() => navigate('/calendar')}>
        ‹ Calendar
      </button>
      <h1>{label}</h1>

      {sessions.length === 0 ? (
        <p className="day-empty">Nothing logged this day.</p>
      ) : (
        <div className="day-sessions">
          {sessions.map((s) => (
            <SessionRow
              key={s.id}
              session={s}
              exercises={exercises}
              onDeleted={() => setDb(loadDB())}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        className="log-form__button log-form__button--primary day-add"
        onClick={() => navigate('/log', { state: { type: 'lift', date } })}
      >
        Add a session for this day
      </button>
    </section>
  )
}
