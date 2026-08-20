import { useState } from 'react'
import { allExercises, currentBodyweightKg, loadDB, todayLocalDate } from '../lib/store'
import StreakBar from './today/StreakBar'
import GoalsWidget from './today/GoalsWidget'
import LeastLoaded from './today/LeastLoaded'
import RecentSessions from './today/RecentSessions'
import './today/Today.css'

export default function Today() {
  const [db, setDb] = useState(() => loadDB())
  const exercises = allExercises(db)

  return (
    <section>
      <h1>Today</h1>
      <div className="card today-overview">
        <StreakBar sessions={db.sessions} />
        <GoalsWidget sessions={db.sessions} />
      </div>
      <LeastLoaded
        sessions={db.sessions}
        exercises={exercises}
        bodyweightKg={currentBodyweightKg(db)}
        referenceDate={todayLocalDate()}
      />
      <RecentSessions db={db} onChange={() => setDb(loadDB())} />
    </section>
  )
}
