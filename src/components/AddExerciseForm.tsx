import { useState } from 'react'

type Props = {
  muscleLabel: string
  onSubmit: (name: string, bodyweight: boolean) => void
  onCancel: () => void
}

export default function AddExerciseForm({
  muscleLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState('')
  const [bodyweight, setBodyweight] = useState(false)

  return (
    <div className="exercise-picker__add-form">
      <input
        type="text"
        placeholder={`New ${muscleLabel} exercise name`}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
          onClick={() => onSubmit(name.trim(), bodyweight)}
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
