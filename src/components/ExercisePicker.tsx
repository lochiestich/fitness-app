import { useState } from 'react'
import type { Exercise, MuscleId } from '../types'
import { BROAD_GROUPS, broadGroupForMuscle, primaryMuscle } from '../lib/muscles'
import type { BroadGroupId } from '../lib/muscles'
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
  const [browseGroup, setBrowseGroup] = useState<BroadGroupId | null>(null)
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
            setBrowseGroup(null)
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

  const handleSelect = (id: string) => {
    setQuery('')
    setBrowseGroup(null)
    onSelect(id)
  }

  const group = BROAD_GROUPS.find((g) => g.id === browseGroup)

  const groupMatches = group
    ? exercises
        .filter((e) => {
          const pm = primaryMuscle(e)
          return pm && broadGroupForMuscle(pm).id === group.id
        })
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
          setBrowseGroup(null)
        }}
      />

      {query.trim().length > 0 && (
        <div className="exercise-picker__list">
          {searchMatches.map((e) => (
            <button
              key={e.id}
              type="button"
              className="exercise-picker__item"
              onClick={() => handleSelect(e.id)}
            >
              {e.name}
            </button>
          ))}
          {searchMatches.length === 0 && (
            <p className="exercise-picker__empty">No matches</p>
          )}
        </div>
      )}

      {query.trim().length === 0 && !group && (
        <div className="exercise-picker__muscles">
          {BROAD_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className="exercise-picker__muscle"
              onClick={() => setBrowseGroup(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {query.trim().length === 0 && group && !adding && (
        <div className="exercise-picker__group">
          <button
            type="button"
            className="exercise-picker__back"
            onClick={() => setBrowseGroup(null)}
          >
            ← All groups
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
              <p className="exercise-picker__empty">No {group.label} exercises yet</p>
            )}
          </div>
          <button
            type="button"
            className="exercise-picker__add"
            onClick={() => setAdding(true)}
          >
            + Add {group.label} exercise
          </button>
        </div>
      )}

      {adding && group && (
        <AddExerciseForm
          groupLabel={group.label}
          muscleOptions={group.muscles}
          onSubmit={(name, muscle, bodyweight) => {
            onCreateExercise(name, muscle, bodyweight)
            setAdding(false)
            setBrowseGroup(null)
          }}
          onCancel={() => setAdding(false)}
        />
      )}
    </div>
  )
}
