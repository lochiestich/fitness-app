import { useState } from 'react'
import type { Exercise } from '../types'
import './ExercisePicker.css'

type Props = {
  exercises: Exercise[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function ExercisePicker({
  exercises,
  selectedId,
  onSelect,
}: Props) {
  const [query, setQuery] = useState('')
  const selected = exercises.find((e) => e.id === selectedId)

  const matches =
    query.trim().length === 0
      ? []
      : exercises.filter((e) =>
          e.name.toLowerCase().includes(query.trim().toLowerCase()),
        )

  return (
    <div className="exercise-picker">
      <input
        type="text"
        placeholder="Search exercise"
        value={selected ? selected.name : query}
        onChange={(e) => {
          setQuery(e.target.value)
        }}
        onFocus={() => setQuery('')}
      />
      {query.length > 0 && (
        <div className="exercise-picker__list">
          {matches.map((e) => (
            <button
              key={e.id}
              type="button"
              className="exercise-picker__item"
              onClick={() => {
                onSelect(e.id)
                setQuery('')
              }}
            >
              {e.name}
            </button>
          ))}
          {matches.length === 0 && (
            <p className="exercise-picker__empty">No matches</p>
          )}
        </div>
      )}
    </div>
  )
}
