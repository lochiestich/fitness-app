import { useState } from 'react'
import { allExercises, loadDB, todayLocalDate } from '../lib/store'
import { muscleFatigue } from '../lib/metrics'
import type { MuscleId } from '../types'
import BodyMap from '../components/BodyMap'
import MuscleDetail from './body/MuscleDetail'
import VolumeBars from './body/VolumeBars'
import './body/Body.css'

export default function Body() {
  const [db] = useState(() => loadDB())
  const exercises = allExercises(db)
  const today = todayLocalDate()
  const fatigue = muscleFatigue(db.sessions, exercises, db.settings.bodyweightKg, today)
  const [selected, setSelected] = useState<MuscleId | null>(null)

  return (
    <section>
      <h1>Body</h1>
      <BodyMap fatigue={fatigue} selected={selected} onSelect={setSelected} />
      <p className="body-legend">
        Cooler means trained longer ago, hotter means trained more recently — hot
        doesn't mean it needs work.
      </p>

      {selected && (
        <MuscleDetail
          muscle={selected}
          sessions={db.sessions}
          exercises={exercises}
          bodyweightKg={db.settings.bodyweightKg}
          referenceDate={today}
        />
      )}

      <VolumeBars
        sessions={db.sessions}
        exercises={exercises}
        bodyweightKg={db.settings.bodyweightKg}
        referenceDate={today}
      />
    </section>
  )
}
