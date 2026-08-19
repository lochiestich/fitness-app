import { useState } from 'react'
import { allExercises, loadDB, todayLocalDate } from '../lib/store'
import { muscleFatigue } from '../lib/metrics'
import type { BodyRegion } from '../lib/bodyRegions'
import BodyMap from '../components/BodyMap'
import MuscleDetail from './body/MuscleDetail'
import VolumeBars from './body/VolumeBars'
import './body/Body.css'

export default function Body() {
  const [db] = useState(() => loadDB())
  const exercises = allExercises(db)
  const today = todayLocalDate()
  const fatigue = muscleFatigue(db.sessions, exercises, db.settings.bodyweightKg, today)
  const [selected, setSelected] = useState<BodyRegion | null>(null)

  return (
    <section>
      <h1>Body</h1>
      <BodyMap fatigue={fatigue} selectedId={selected?.id ?? null} onSelect={setSelected} />
      <p className="body-legend">
        Cooler means trained longer ago, hotter means trained more recently — hot
        doesn't mean it needs work.
      </p>

      {selected && (
        <MuscleDetail
          label={selected.label}
          muscles={selected.muscles}
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
