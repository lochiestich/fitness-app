import type { Exercise } from '../../types'
import './LogForm.css'

export type RoundInput = { weightKg: number | ''; reps: number | '' }

type Props = {
  exercises: Exercise[]
  circuitExerciseIds: string[]
  roundNumber: number
  roundInputs: Record<string, RoundInput>
  onChangeInput: (exerciseId: string, field: 'weightKg' | 'reps', value: string) => void
  onAddRound: () => void
  onEnd: () => void
}

export default function SupersetRounds({
  exercises,
  circuitExerciseIds,
  roundNumber,
  roundInputs,
  onChangeInput,
  onAddRound,
  onEnd,
}: Props) {
  const exerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? id

  return (
    <div className="log-form__superset">
      <p className="log-form__hint">Round {roundNumber}</p>

      {circuitExerciseIds.map((id) => (
        <div className="log-form__row" key={id}>
          <div className="log-form__field">
            <label>{exerciseName(id)} — kg</label>
            <input
              type="number"
              inputMode="decimal"
              value={roundInputs[id]?.weightKg ?? ''}
              onChange={(e) => onChangeInput(id, 'weightKg', e.target.value)}
            />
          </div>
          <div className="log-form__field">
            <label>Reps</label>
            <input
              type="number"
              inputMode="decimal"
              value={roundInputs[id]?.reps ?? ''}
              onChange={(e) => onChangeInput(id, 'reps', e.target.value)}
            />
          </div>
        </div>
      ))}

      <div className="log-form__row">
        <button
          type="button"
          className="log-form__button log-form__button--primary"
          onClick={onAddRound}
        >
          Add round {roundNumber}
        </button>
        <button type="button" className="log-form__button" onClick={onEnd}>
          End superset
        </button>
      </div>
    </div>
  )
}
