import { useRef, useState } from 'react'
import type { Exercise, Session } from '../../types'
import { deleteSession } from '../../lib/store'

type Props = {
  session: Session
  exercises: Exercise[]
  onDeleted: () => void
}

const LONG_PRESS_MS = 550

function summarize(session: Session): string {
  if (session.type === 'lift') {
    const exerciseCount = new Set(session.sets.map((s) => s.exerciseId)).size
    return `Lift — ${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}, ${session.sets.length} set${session.sets.length === 1 ? '' : 's'}`
  }
  if (session.type === 'cardio') {
    const label = session.activity[0].toUpperCase() + session.activity.slice(1)
    return `${label} — ${session.durationMin} min`
  }
  return `Polo — ${session.chukkas} chukka${session.chukkas === 1 ? '' : 's'}`
}

export default function SessionRow({ session, exercises, onDeleted }: Props) {
  const [expanded, setExpanded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressed = useRef(false)

  const exerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? id

  const startPress = () => {
    longPressed.current = false
    timerRef.current = setTimeout(() => {
      longPressed.current = true
      if (window.confirm('Delete this session?')) {
        deleteSession(session.id)
        onDeleted()
      }
    }, LONG_PRESS_MS)
  }

  const cancelPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  return (
    <div
      className="session-row"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onClick={() => {
        if (!longPressed.current) setExpanded((e) => !e)
      }}
    >
      <div className="session-row__summary">
        <span className="session-row__date">{session.date}</span>
        <span>{summarize(session)}</span>
      </div>

      {expanded && (
        <div className="session-row__detail">
          {session.type === 'lift' &&
            session.sets.map((s, i) => (
              <div key={i}>
                {exerciseName(s.exerciseId)} — {s.weightKg}kg × {s.reps}
              </div>
            ))}
          {session.type === 'cardio' && (
            <div>
              {session.durationMin} min
              {session.distanceKm ? `, ${session.distanceKm.toFixed(2)} km` : ''}
              {session.rpe !== undefined ? `, RPE ${session.rpe}` : ''}
            </div>
          )}
          {session.type === 'polo' && (
            <div>
              {session.chukkas} chukkas
              {session.horses.length ? `, ${session.horses.join(', ')}` : ''}
            </div>
          )}
          {session.notes && <div className="session-row__notes">{session.notes}</div>}
        </div>
      )}
    </div>
  )
}
