import ExercisePicker from '../../components/ExercisePicker'
import type { Exercise, MuscleId } from '../../types'
import './LogForm.css'

type Props = {
  exercises: Exercise[]
  circuitExerciseIds: string[]
  onAdd: (exerciseId: string) => void
  onRemove: (exerciseId: string) => void
  onStart: () => void
  onCancel: () => void
  onCreateExercise: (name: string, muscle: MuscleId, bodyweight: boolean) => void
}

export default function SupersetBuilder({
  exercises,
  circuitExerciseIds,
  onAdd,
  onRemove,
  onStart,
  onCancel,
  onCreateExercise,
}: Props) {
  const exerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? id

  return (
    <div className="log-form__superset">
      <p className="log-form__hint">Add 2 or more exercises to the circuit</p>

      {circuitExerciseIds.length > 0 && (
        <div className="log-form__circuit-chips">
          {circuitExerciseIds.map((id) => (
            <button
              key={id}
              type="button"
              className="chip"
              onClick={() => onRemove(id)}
            >
              {exerciseName(id)} ×
            </button>
          ))}
        </div>
      )}

      <ExercisePicker
        exercises={exercises}
        selectedId={null}
        onSelect={onAdd}
        onDeselect={() => {}}
        onCreateExercise={onCreateExercise}
      />

      <div className="log-form__row">
        <button
          type="button"
          className="log-form__button log-form__button--primary"
          disabled={circuitExerciseIds.length < 2}
          onClick={onStart}
        >
          Start logging rounds
        </button>
        <button type="button" className="log-form__button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
