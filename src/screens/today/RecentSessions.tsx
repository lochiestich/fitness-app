import type { DB } from '../../types'
import { allExercises, sessionsMostRecentFirst } from '../../lib/store'
import SessionRow from './SessionRow'

type Props = {
  db: DB
  onChange: () => void
}

const RECENT_COUNT = 10

export default function RecentSessions({ db, onChange }: Props) {
  const exercises = allExercises(db)
  const recent = sessionsMostRecentFirst(db).slice(0, RECENT_COUNT)

  return (
    <div className="recent-sessions">
      <h2>Recent sessions</h2>
      {recent.length === 0 && (
        <p className="recent-sessions__empty">Nothing logged yet.</p>
      )}
      {recent.map((s) => (
        <SessionRow key={s.id} session={s} exercises={exercises} onDeleted={onChange} />
      ))}
    </div>
  )
}
