import { useState } from 'react'
import { allExercises, currentBodyweightKg, loadDB, todayLocalDate } from '../lib/store'
import WeeklyLoadChart from './progress/WeeklyLoadChart'
import ConsistencyGrid from './progress/ConsistencyGrid'
import CategoryBreakdown from './progress/CategoryBreakdown'
import LiftingProgress from './progress/LiftingProgress'
import CardioProgress from './progress/CardioProgress'
import PoloProgress from './progress/PoloProgress'
import BodyweightProgress from './progress/BodyweightProgress'
import PersonalRecords from './progress/PersonalRecords'

export default function Progress() {
  const [db, setDb] = useState(() => loadDB())
  const exercises = allExercises(db)
  const today = todayLocalDate()

  return (
    <section>
      <h1>Progress</h1>
      <WeeklyLoadChart sessions={db.sessions} referenceDate={today} />
      <ConsistencyGrid sessions={db.sessions} referenceDate={today} />
      <CategoryBreakdown
        sessions={db.sessions}
        exercises={exercises}
        bodyweightKg={currentBodyweightKg(db)}
        referenceDate={today}
      />
      <LiftingProgress
        sessions={db.sessions}
        exercises={exercises}
        bodyweightKg={currentBodyweightKg(db)}
      />
      <CardioProgress sessions={db.sessions} referenceDate={today} />
      <PoloProgress sessions={db.sessions} referenceDate={today} />
      <BodyweightProgress db={db} onChange={() => setDb(loadDB())} />
      <PersonalRecords
        sessions={db.sessions}
        exercises={exercises}
        bodyweightKg={currentBodyweightKg(db)}
      />
    </section>
  )
}
