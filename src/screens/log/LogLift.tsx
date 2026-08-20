import { useState } from 'react'
import {
  addCustomExercise,
  allExercises,
  deleteSession,
  lastLiftSession,
  lastSetForExercise,
  liftSessionOnDate,
  loadDB,
  newId,
  todayLocalDate,
  upsertSession,
} from '../../lib/store'
import { categoryForMuscle } from '../../lib/muscles'
import type { Exercise, LiftSet, MuscleId } from '../../types'
import ExercisePicker from '../../components/ExercisePicker'
import SupersetBuilder from './SupersetBuilder'
import SupersetRounds, { type RoundInput } from './SupersetRounds'
import './LogForm.css'

type Mode = 'single' | 'superset-building' | 'superset-rounds'

type SetListItem =
  | { kind: 'single'; index: number; set: LiftSet }
  | { kind: 'group'; supersetId: string; round: number; entries: { index: number; set: LiftSet }[] }

function groupSets(sets: LiftSet[]): SetListItem[] {
  const items: SetListItem[] = []
  let i = 0
  while (i < sets.length) {
    const set = sets[i]
    if (set.supersetId && set.round !== undefined) {
      const entries = [{ index: i, set }]
      let j = i + 1
      while (
        j < sets.length &&
        sets[j].supersetId === set.supersetId &&
        sets[j].round === set.round
      ) {
        entries.push({ index: j, set: sets[j] })
        j++
      }
      items.push({ kind: 'group', supersetId: set.supersetId, round: set.round, entries })
      i = j
    } else {
      items.push({ kind: 'single', index: i, set })
      i++
    }
  }
  return items
}

type Props = {
  date?: string
}

export default function LogLift({ date }: Props) {
  const [exercises, setExercises] = useState(() => allExercises(loadDB()))
  const today = date ?? todayLocalDate()
  const [sessionId] = useState(() => liftSessionOnDate(loadDB(), today)?.id ?? newId())
  const [sets, setSets] = useState<LiftSet[]>(
    () => liftSessionOnDate(loadDB(), today)?.sets ?? [],
  )
  const [notes, setNotes] = useState(() => liftSessionOnDate(loadDB(), today)?.notes ?? '')
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [weightKg, setWeightKg] = useState<number | ''>('')
  const [reps, setReps] = useState<number | ''>('')
  const [unilateral, setUnilateral] = useState(false)
  const [previousSet, setPreviousSet] = useState<LiftSet | undefined>(undefined)

  const [mode, setMode] = useState<Mode>('single')
  const [circuitIds, setCircuitIds] = useState<string[]>([])
  const [supersetId, setSupersetId] = useState('')
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundInputs, setRoundInputs] = useState<Record<string, RoundInput>>({})

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
    setPreviousSet(last)
    setWeightKg(last?.weightKg ?? '')
    setReps(last?.reps ?? '')
    setUnilateral(last?.unilateral ?? false)
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
    if (mode === 'single') selectExercise(exercise.id)
    else setCircuitIds((prev) => (prev.includes(exercise.id) ? prev : [...prev, exercise.id]))
  }

  const addSet = () => {
    if (!exerciseId || reps === '' || reps <= 0) return
    const next = [
      ...sets,
      {
        exerciseId,
        weightKg: weightKg === '' ? 0 : weightKg,
        reps,
        ...(unilateral ? { unilateral: true } : {}),
      },
    ]
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

  const setLabel = (set: LiftSet) =>
    `${set.weightKg}kg × ${set.reps}${set.unilateral ? ' (each side)' : ''}`

  const startSuperset = () => {
    setExerciseId(null)
    setMode('superset-building')
    setCircuitIds([])
  }

  const addToCircuit = (id: string) => {
    setCircuitIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const removeFromCircuit = (id: string) => {
    setCircuitIds((prev) => prev.filter((c) => c !== id))
  }

  const beginRounds = () => {
    const db = loadDB()
    const inputs: Record<string, RoundInput> = {}
    for (const id of circuitIds) {
      const last = lastSetForExercise(db, id)
      inputs[id] = { weightKg: last?.weightKg ?? '', reps: last?.reps ?? '' }
    }
    setRoundInputs(inputs)
    setSupersetId(newId())
    setRoundNumber(1)
    setMode('superset-rounds')
  }

  const updateRoundInput = (id: string, field: 'weightKg' | 'reps', value: string) => {
    setRoundInputs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value === '' ? '' : Number(value) },
    }))
  }

  const addRound = () => {
    const roundSets: LiftSet[] = circuitIds.map((id) => {
      const input = roundInputs[id]
      return {
        exerciseId: id,
        weightKg: input?.weightKg === '' || input?.weightKg === undefined ? 0 : input.weightKg,
        reps: input?.reps === '' || input?.reps === undefined ? 0 : input.reps,
        supersetId,
        round: roundNumber,
      }
    })
    if (roundSets.some((s) => s.reps <= 0)) return
    const next = [...sets, ...roundSets]
    setSets(next)
    persist(next, notes)
    setRoundNumber((n) => n + 1)
  }

  const endSuperset = () => {
    setMode('single')
    setCircuitIds([])
    setSupersetId('')
    setRoundNumber(1)
    setRoundInputs({})
  }

  return (
    <div className="log-form">
      {mode === 'single' && (
        <div className="log-form__row">
          <button type="button" className="log-form__button" onClick={repeatLastSession}>
            Repeat last session
          </button>
          <button type="button" className="log-form__button" onClick={startSuperset}>
            Start superset
          </button>
        </div>
      )}

      {mode === 'single' && (
        <>
          <ExercisePicker
            exercises={exercises}
            selectedId={exerciseId}
            onSelect={selectExercise}
            onDeselect={() => setExerciseId(null)}
            onCreateExercise={handleCreateExercise}
          />

          {exerciseId && previousSet && (
            <p className="log-form__hint">
              Previous: {previousSet.weightKg}kg × {previousSet.reps}
            </p>
          )}

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
            <label className="log-form__checkbox">
              <input
                type="checkbox"
                checked={unilateral}
                onChange={(e) => setUnilateral(e.target.checked)}
              />
              One side at a time (doubled for volume, not for e1RM/PRs)
            </label>
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
        </>
      )}

      {mode === 'superset-building' && (
        <SupersetBuilder
          exercises={exercises}
          circuitExerciseIds={circuitIds}
          onAdd={addToCircuit}
          onRemove={removeFromCircuit}
          onStart={beginRounds}
          onCancel={endSuperset}
          onCreateExercise={handleCreateExercise}
        />
      )}

      {mode === 'superset-rounds' && (
        <SupersetRounds
          exercises={exercises}
          circuitExerciseIds={circuitIds}
          roundNumber={roundNumber}
          roundInputs={roundInputs}
          onChangeInput={updateRoundInput}
          onAddRound={addRound}
          onEnd={endSuperset}
        />
      )}

      {sets.length > 0 && (
        <div className="log-form__set-list">
          {groupSets(sets).map((item) =>
            item.kind === 'single' ? (
              <div className="log-form__set" key={item.index}>
                <span className="log-form__set-info">
                  {exerciseName(item.set.exerciseId)} — {setLabel(item.set)}
                </span>
                <button
                  type="button"
                  className="log-form__set-remove"
                  aria-label="Remove set"
                  onClick={() => removeSet(item.index)}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="log-form__superset-group" key={`${item.supersetId}-${item.round}`}>
                <span className="log-form__superset-label">Superset round {item.round}</span>
                {item.entries.map(({ index, set }) => (
                  <div className="log-form__set log-form__set--grouped" key={index}>
                    <span className="log-form__set-info">
                      {exerciseName(set.exerciseId)} — {setLabel(set)}
                    </span>
                    <button
                      type="button"
                      className="log-form__set-remove"
                      aria-label="Remove set"
                      onClick={() => removeSet(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ),
          )}
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
