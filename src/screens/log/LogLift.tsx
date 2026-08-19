import { useState } from 'react'
import {
  addCustomExercise,
  allExercises,
  deleteSession,
  lastLiftSession,
  lastSetForExercise,
  loadDB,
  newId,
  todayLocalDate,
  todaysLiftSession,
  upsertSession,
} from '../../lib/store'
import { categoryForMuscle } from '../../lib/muscles'
import type { Exercise, LiftSet, MuscleId } from '../../types'
import ExercisePicker from '../../components/ExercisePicker'
import './LogForm.css'

export default function LogLift() {
  const [exercises, setExercises] = useState(() => allExercises(loadDB()))
  const today = todayLocalDate()
  const [sessionId] = useState(() => todaysLiftSession(loadDB(), today)?.id ?? newId())
  const [sets, setSets] = useState<LiftSet[]>(
    () => todaysLiftSession(loadDB(), today)?.sets ?? [],
  )
  const [notes, setNotes] = useState(() => todaysLiftSession(loadDB(), today)?.notes ?? '')
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [weightKg, setWeightKg] = useState<number | ''>('')
  const [reps, setReps] = useState<number | ''>('')

  const persist = (nextSets: LiftSet[], nextNotes: string) => {
    if (nextSets.length === 0) {
      deleteSession(sessionId)
      return
    }
    upsertSession({
      id: sessionId,
      date: today,
      type: 'lift',
      sets: nextSets,
      ...(nextNotes.trim() ? { notes: nextNotes.trim() } : {}),
    })
  }

  const selectExercise = (id: string) => {
    setExerciseId(id)
    const last = lastSetForExercise(loadDB(), id)
    setWeightKg(last?.weightKg ?? '')
    setReps(last?.reps ?? '')
  }

  const handleCreateExercise = (
    name: string,
    muscle: MuscleId,
    bodyweight: boolean,
  ) => {
    const exercise: Exercise = {
      id: newId(),
      name,
      category: categoryForMuscle(muscle),
      bodyweight,
      muscles: { [muscle]: 1.0 },
    }
    addCustomExercise(exercise)
    setExercises((prev) => [...prev, exercise])
    selectExercise(exercise.id)
  }

  const addSet = () => {
    if (!exerciseId || reps === '' || reps <= 0) return
    const next = [...sets, { exerciseId, weightKg: weightKg === '' ? 0 : weightKg, reps }]
    setSets(next)
    persist(next, notes)
  }

  const duplicateLastSet = () => {
    if (sets.length === 0) return
    const next = [...sets, { ...sets[sets.length - 1] }]
    setSets(next)
    persist(next, notes)
  }

  const removeSet = (index: number) => {
    const next = sets.filter((_, i) => i !== index)
    setSets(next)
    persist(next, notes)
  }

  const repeatLastSession = () => {
    const last = lastLiftSession(loadDB(), sessionId)
    if (!last) return
    const next = last.sets.map((s) => ({ ...s }))
    setSets(next)
    persist(next, notes)
  }

  const exerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? id

  return (
    <div className="log-form">
      <button type="button" className="log-form__button" onClick={repeatLastSession}>
        Repeat last lifting session
      </button>

      <ExercisePicker
        exercises={exercises}
        selectedId={exerciseId}
        onSelect={selectExercise}
        onDeselect={() => setExerciseId(null)}
        onCreateExercise={handleCreateExercise}
      />

      {exerciseId && (
        <div className="log-form__row">
          <div className="log-form__field">
            <label>Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={weightKg}
              onChange={(e) =>
                setWeightKg(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>
          <div className="log-form__field">
            <label>Reps</label>
            <input
              type="number"
              inputMode="decimal"
              value={reps}
              onChange={(e) =>
                setReps(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>
        </div>
      )}

      {exerciseId && (
        <div className="log-form__row">
          <button type="button" className="log-form__button" onClick={addSet}>
            Add set
          </button>
          <button
            type="button"
            className="log-form__button"
            onClick={duplicateLastSet}
            disabled={sets.length === 0}
          >
            Duplicate last set
          </button>
        </div>
      )}

      {sets.length > 0 && (
        <div className="log-form__set-list">
          {sets.map((s, i) => (
            <div className="log-form__set" key={i}>
              <span className="log-form__set-info">
                {exerciseName(s.exerciseId)} — {s.weightKg}kg × {s.reps}
              </span>
              <button
                type="button"
                className="log-form__button"
                onClick={() => removeSet(i)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="log-form__field">
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => persist(sets, notes)}
        />
      </div>

      {sets.length > 0 && <p className="log-form__status">Saved automatically</p>}
    </div>
  )
}
