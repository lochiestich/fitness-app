import { useState } from 'react'
import { allExercises, loadDB, todayLocalDate } from '../lib/store'
import WeekSummary from './today/WeekSummary'
import LeastLoaded from './today/LeastLoaded'
import RecentSessions from './today/RecentSessions'
import './today/Today.css'

export default function Today() {
  const [db, setDb] = useState(() => loadDB())
  const exercises = allExercises(db)

  return (
    <section>
      <h1>Today</h1>
      <WeekSummary sessions={db.sessions} />
      <LeastLoaded
        sessions={db.sessions}
        exercises={exercises}
        bodyweightKg={db.settings.bodyweightKg}
        referenceDate={todayLocalDate()}
      />
      <RecentSessions db={db} onChange={() => setDb(loadDB())} />
    </section>
  )
}
