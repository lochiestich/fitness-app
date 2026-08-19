import { useState } from 'react'
import { addSession, knownHorses, loadDB, newId, todayLocalDate } from '../../lib/store'
import type { CardioActivity } from '../../types'
import ChipInput from '../../components/ChipInput'
import './LogForm.css'

const ACTIVITIES: { value: CardioActivity | 'polo'; label: string }[] = [
  { value: 'run', label: 'Run' },
  { value: 'swim', label: 'Swim' },
  { value: 'polo', label: 'Polo' },
  { value: 'cycle', label: 'Cycle' },
  { value: 'row', label: 'Row' },
  { value: 'walk', label: 'Walk' },
  { value: 'other', label: 'Other' },
]

const MIN_PER_CHUKKA = 7.5

type DistanceUnit = 'km' | 'm' | 'mi'

function toKm(value: number, unit: DistanceUnit): number {
  if (unit === 'km') return value
  if (unit === 'm') return value / 1000
  return value * 1.60934
}

export default function LogCardio() {
  const [activity, setActivity] = useState<CardioActivity | 'polo'>('run')
  const [durationMin, setDurationMin] = useState<number | ''>('')
  const [distanceValue, setDistanceValue] = useState<number | ''>('')
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km')
  const [chukkas, setChukkas] = useState<number | ''>('')
  const [horses, setHorses] = useState<string[]>([])
  const [horseSuggestions] = useState(() => knownHorses(loadDB()))
  const [rpe, setRpe] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const isPolo = activity === 'polo'
  const canSave = isPolo
    ? chukkas !== '' && chukkas > 0
    : durationMin !== '' && durationMin > 0

  const reset = () => {
    setDurationMin('')
    setDistanceValue('')
    setChukkas('')
    setHorses([])
    setRpe('')
    setNotes('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const save = () => {
    if (!canSave) return
    if (isPolo) {
      addSession({
        id: newId(),
        date: todayLocalDate(),
        type: 'polo',
        chukkas: chukkas as number,
        durationMin: (chukkas as number) * MIN_PER_CHUKKA,
        horses,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
    } else {
      addSession({
        id: newId(),
        date: todayLocalDate(),
        type: 'cardio',
        activity,
        durationMin: durationMin as number,
        ...(distanceValue !== '' && distanceValue > 0
          ? { distanceKm: toKm(distanceValue, distanceUnit) }
          : {}),
        ...(rpe !== '' ? { rpe } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
    }
    reset()
  }

  return (
    <div className="log-form">
      <div className="log-form__field">
        <label>Activity</label>
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value as CardioActivity | 'polo')}
        >
          {ACTIVITIES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {isPolo ? (
        <>
          <div className="log-form__field">
            <label>Chukkas</label>
            <input
              type="number"
              inputMode="decimal"
              value={chukkas}
              onChange={(e) =>
                setChukkas(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>
          <div className="log-form__field">
            <label>Horses</label>
            <ChipInput
              values={horses}
              onChange={setHorses}
              suggestions={horseSuggestions}
              placeholder="Tap a horse, or type a new one"
            />
          </div>
        </>
      ) : (
        <>
          <div className="log-form__field">
            <label>Duration (min)</label>
            <input
              type="number"
              inputMode="decimal"
              value={durationMin}
              onChange={(e) =>
                setDurationMin(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>

          <div className="log-form__row">
            <div className="log-form__field">
              <label>Distance (optional)</label>
              <input
                type="number"
                inputMode="decimal"
                value={distanceValue}
                onChange={(e) =>
                  setDistanceValue(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
              />
            </div>
            <div className="log-form__field">
              <label>Unit</label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
              >
                <option value="km">km</option>
                <option value="m">m</option>
                <option value="mi">mi</option>
              </select>
            </div>
          </div>

          <div className="log-form__field">
            <label>RPE (optional)</label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={10}
              value={rpe}
              onChange={(e) =>
                setRpe(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>
        </>
      )}

      <div className="log-form__field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button
        type="button"
        className="log-form__button log-form__button--primary"
        onClick={save}
        disabled={!canSave}
      >
        Save session
      </button>

      {saved && <p className="log-form__status">Saved</p>}
    </div>
  )
}
