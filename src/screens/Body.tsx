import { useState } from 'react'
import { allExercises, currentBodyweightKg, loadDB, todayLocalDate } from '../lib/store'
import { muscleFatigue } from '../lib/metrics'
import BodyMap from '../components/BodyMap'
import MuscleScores from './body/MuscleScores'
import VolumeBars from './body/VolumeBars'
import './body/Body.css'

export default function Body() {
  const [db] = useState(() => loadDB())
  const exercises = allExercises(db)
  const today = todayLocalDate()
  const bodyweightKg = currentBodyweightKg(db)
  const fatigue = muscleFatigue(db.sessions, exercises, bodyweightKg, today)

  return (
    <section>
      <h1>Body</h1>
      <BodyMap fatigue={fatigue} />
      <p className="body-legend">
        Cooler means trained longer ago, hotter means trained more recently — hot
        doesn't mean it needs work.
      </p>

      <MuscleScores fatigue={fatigue} />

      <VolumeBars
        sessions={db.sessions}
        exercises={exercises}
        bodyweightKg={bodyweightKg}
        referenceDate={today}
      />
    </section>
  )
}
