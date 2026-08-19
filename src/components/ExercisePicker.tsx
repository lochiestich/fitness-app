import { useState } from 'react'
import type { Exercise, MuscleId } from '../types'
import { MUSCLE_IDS, MUSCLE_LABELS, primaryMuscle } from '../lib/muscles'
import AddExerciseForm from './AddExerciseForm'
import './ExercisePicker.css'

type Props = {
  exercises: Exercise[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDeselect: () => void
  onCreateExercise: (name: string, muscle: MuscleId, bodyweight: boolean) => void
}

export default function ExercisePicker({
  exercises,
  selectedId,
  onSelect,
  onDeselect,
  onCreateExercise,
}: Props) {
  const [query, setQuery] = useState('')
  const [browseMuscle, setBrowseMuscle] = useState<MuscleId | null>(null)
  const [adding, setAdding] = useState(false)

  const selected = exercises.find((e) => e.id === selectedId)

  if (selected) {
    return (
      <div className="exercise-picker__selected">
        <span>{selected.name}</span>
        <button
          type="button"
          className="exercise-picker__change"
          onClick={() => {
            setQuery('')
            setBrowseMuscle(null)
            setAdding(false)
            onDeselect()
          }}
        >
          Change
        </button>
      </div>
    )
  }

  const searchMatches =
    query.trim().length > 0
      ? exercises.filter((e) =>
          e.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : []

  const groupMatches = browseMuscle
    ? exercises
        .filter((e) => primaryMuscle(e) === browseMuscle)
        .sort((a, b) => a.name.localeCompare(b.name))
    : []

  return (
    <div className="exercise-picker">
      <input
        type="text"
        placeholder="Search exercise"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setBrowseMuscle(null)
        }}
      />

      {query.trim().length > 0 && (
        <div className="exercise-picker__list">
          {searchMatches.map((e) => (
            <button
              key={e.id}
              type="button"
              className="exercise-picker__item"
              onClick={() => onSelect(e.id)}
            >
              {e.name}
            </button>
          ))}
          {searchMatches.length === 0 && (
            <p className="exercise-picker__empty">No matches</p>
          )}
        </div>
      )}

      {query.trim().length === 0 && browseMuscle === null && (
        <div className="exercise-picker__muscles">
          {MUSCLE_IDS.map((m) => (
            <button
              key={m}
              type="button"
              className="exercise-picker__muscle"
              onClick={() => setBrowseMuscle(m)}
            >
              {MUSCLE_LABELS[m]}
            </button>
          ))}
        </div>
      )}

      {query.trim().length === 0 && browseMuscle !== null && !adding && (
        <div className="exercise-picker__group">
          <button
            type="button"
            className="exercise-picker__back"
            onClick={() => setBrowseMuscle(null)}
          >
            ← All muscles
          </button>
          <div className="exercise-picker__list exercise-picker__list--static">
            {groupMatches.map((e) => (
              <button
                key={e.id}
                type="button"
                className="exercise-picker__item"
                onClick={() => onSelect(e.id)}
              >
                {e.name}
              </button>
            ))}
            {groupMatches.length === 0 && (
              <p className="exercise-picker__empty">
                No {MUSCLE_LABELS[browseMuscle]} exercises yet
              </p>
            )}
          </div>
          <button
            type="button"
            className="exercise-picker__add"
            onClick={() => setAdding(true)}
          >
            + Add {MUSCLE_LABELS[browseMuscle]} exercise
          </button>
        </div>
      )}

      {adding && browseMuscle !== null && (
        <AddExerciseForm
          muscleLabel={MUSCLE_LABELS[browseMuscle]}
          onSubmit={(name, bodyweight) => {
            onCreateExercise(name, browseMuscle, bodyweight)
            setAdding(false)
            setBrowseMuscle(null)
          }}
          onCancel={() => setAdding(false)}
        />
      )}
    </div>
  )
}
