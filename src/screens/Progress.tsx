import { useState } from 'react'
import { allExercises, loadDB, todayLocalDate } from '../lib/store'
import WeeklyLoadChart from './progress/WeeklyLoadChart'
import ConsistencyGrid from './progress/ConsistencyGrid'
import LiftingProgress from './progress/LiftingProgress'
import CardioProgress from './progress/CardioProgress'
import PoloProgress from './progress/PoloProgress'
import PersonalRecords from './progress/PersonalRecords'

export default function Progress() {
  const [db] = useState(() => loadDB())
  const exercises = allExercises(db)
  const today = todayLocalDate()

  return (
    <section>
      <h1>Progress</h1>
      <WeeklyLoadChart sessions={db.sessions} referenceDate={today} />
      <ConsistencyGrid sessions={db.sessions} referenceDate={today} />
      <LiftingProgress
        sessions={db.sessions}
        exercises={exercises}
        bodyweightKg={db.settings.bodyweightKg}
      />
      <CardioProgress sessions={db.sessions} referenceDate={today} />
      <PoloProgress sessions={db.sessions} referenceDate={today} />
      <PersonalRecords
        sessions={db.sessions}
        exercises={exercises}
        bodyweightKg={db.settings.bodyweightKg}
      />
    </section>
  )
}
