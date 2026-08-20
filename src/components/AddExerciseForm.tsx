import { useState } from 'react'
import type { MuscleId } from '../types'
import { MUSCLE_IDS, MUSCLE_LABELS } from '../lib/muscles'

type Props = {
  groupLabel: string
  onSubmit: (name: string, muscles: Partial<Record<MuscleId, number>>, bodyweight: boolean) => void
  onCancel: () => void
}

const WEIGHTS: { value: number; label: string }[] = [
  { value: 1.0, label: 'Prime · 1.0' },
  { value: 0.5, label: 'Assist · 0.5' },
  { value: 0.3, label: 'Minor · 0.3' },
]

export default function AddExerciseForm({ groupLabel, onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [muscles, setMuscles] = useState<Partial<Record<MuscleId, number>>>({})
  const [bodyweight, setBodyweight] = useState(false)

  const toggleMuscle = (m: MuscleId) => {
    setMuscles((prev) => {
      if (m in prev) {
        const next = { ...prev }
        delete next[m]
        return next
      }
      return { ...prev, [m]: 1.0 }
    })
  }

  const setWeight = (m: MuscleId, value: number) => {
    setMuscles((prev) => ({ ...prev, [m]: value }))
  }

  const selected = MUSCLE_IDS.filter((m) => m in muscles)

  return (
    <div className="exercise-picker__add-form">
      <input
        type="text"
        placeholder={`New ${groupLabel} exercise name`}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <p className="log-form__hint">Which muscles does this train? Pick as many as apply.</p>
      <div className="exercise-picker__muscle-options">
        {MUSCLE_IDS.map((m) => (
          <button
            key={m}
            type="button"
            className={
              m in muscles
                ? 'exercise-picker__muscle-option exercise-picker__muscle-option--active'
                : 'exercise-picker__muscle-option'
            }
            onClick={() => toggleMuscle(m)}
          >
            {MUSCLE_LABELS[m]}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="exercise-picker__weights">
          {selected.map((m) => (
            <div className="exercise-picker__weight-row" key={m}>
              <span className="exercise-picker__weight-label">{MUSCLE_LABELS[m]}</span>
              <div className="exercise-picker__weight-options">
                {WEIGHTS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    className={
                      muscles[m] === w.value
                        ? 'exercise-picker__muscle-option exercise-picker__muscle-option--active'
                        : 'exercise-picker__muscle-option'
                    }
                    onClick={() => setWeight(m, w.value)}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
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
          disabled={!name.trim() || selected.length === 0}
          onClick={() => onSubmit(name.trim(), muscles, bodyweight)}
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
