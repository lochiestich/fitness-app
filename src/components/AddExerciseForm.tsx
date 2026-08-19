import { useState } from 'react'
import type { MuscleId } from '../types'
import { MUSCLE_LABELS } from '../lib/muscles'

type Props = {
  groupLabel: string
  muscleOptions: MuscleId[]
  onSubmit: (name: string, muscle: MuscleId, bodyweight: boolean) => void
  onCancel: () => void
}

export default function AddExerciseForm({
  groupLabel,
  muscleOptions,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState('')
  const [muscle, setMuscle] = useState<MuscleId>(muscleOptions[0])
  const [bodyweight, setBodyweight] = useState(false)

  return (
    <div className="exercise-picker__add-form">
      <input
        type="text"
        placeholder={`New ${groupLabel} exercise name`}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {muscleOptions.length > 1 && (
        <div className="exercise-picker__muscle-options">
          {muscleOptions.map((m) => (
            <button
              key={m}
              type="button"
              className={
                m === muscle
                  ? 'exercise-picker__muscle-option exercise-picker__muscle-option--active'
                  : 'exercise-picker__muscle-option'
              }
              onClick={() => setMuscle(m)}
            >
              {MUSCLE_LABELS[m]}
            </button>
          ))}
        </div>
      )}
      <label className="exercise-picker__checkbox">
        <input
          type="checkbox"
          checked={bodyweight}
          onChange={(e) => setBodyweight(e.target.checked)}
        />
        Bodyweight exercise
      </label>
      <div className="exercise-picker__add-actions">
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => onSubmit(name.trim(), muscle, bodyweight)}
        >
          Add
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
