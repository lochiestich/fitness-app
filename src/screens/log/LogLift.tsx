import { useState } from 'react'
import {
  addSession,
  allExercises,
  lastLiftSession,
  lastSetForExercise,
  loadDB,
  newId,
  todayLocalDate,
} from '../../lib/store'
import type { LiftSet } from '../../types'
import ExercisePicker from '../../components/ExercisePicker'
import './LogForm.css'

export default function LogLift() {
  const [exercises] = useState(() => allExercises(loadDB()))
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [weightKg, setWeightKg] = useState(0)
  const [reps, setReps] = useState(0)
  const [sets, setSets] = useState<LiftSet[]>([])
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const selectExercise = (id: string) => {
    setExerciseId(id)
    const last = lastSetForExercise(loadDB(), id)
    setWeightKg(last?.weightKg ?? 0)
    setReps(last?.reps ?? 0)
  }

  const addSet = () => {
    if (!exerciseId || reps <= 0) return
    setSets([...sets, { exerciseId, weightKg, reps }])
  }

  const duplicateLastSet = () => {
    if (sets.length === 0) return
    setSets([...sets, { ...sets[sets.length - 1] }])
  }

  const removeSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index))
  }

  const repeatLastSession = () => {
    const last = lastLiftSession(loadDB())
    if (last) setSets(last.sets.map((s) => ({ ...s })))
  }

  const exerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? id

  const save = () => {
    if (sets.length === 0) return
    addSession({
      id: newId(),
      date: todayLocalDate(),
      type: 'lift',
      sets,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    })
    setSets([])
    setExerciseId(null)
    setNotes('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="log-form">
      <button type="button" className="log-form__button" onClick={repeatLastSession}>
        Repeat last lifting session
      </button>

      <ExercisePicker
        exercises={exercises}
        selectedId={exerciseId}
        onSelect={selectExercise}
      />

      {exerciseId && (
        <div className="log-form__row">
          <div className="log-form__field">
            <label>Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
            />
          </div>
          <div className="log-form__field">
            <label>Reps</label>
            <input
              type="number"
              inputMode="decimal"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
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
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button
        type="button"
        className="log-form__button log-form__button--primary"
        onClick={save}
        disabled={sets.length === 0}
      >
        Save session
      </button>

      {saved && <p className="log-form__status">Saved</p>}
    </div>
  )
}
