import { useState } from 'react'
import { addSession, newId, todayLocalDate } from '../../lib/store'
import type { CardioActivity } from '../../types'
import './LogForm.css'

const ACTIVITIES: { value: CardioActivity; label: string }[] = [
  { value: 'run', label: 'Run' },
  { value: 'swim', label: 'Swim' },
  { value: 'cycle', label: 'Cycle' },
  { value: 'row', label: 'Row' },
  { value: 'walk', label: 'Walk' },
  { value: 'other', label: 'Other' },
]

type DistanceUnit = 'km' | 'm' | 'mi'

function toKm(value: number, unit: DistanceUnit): number {
  if (unit === 'km') return value
  if (unit === 'm') return value / 1000
  return value * 1.60934
}

export default function LogCardio() {
  const [activity, setActivity] = useState<CardioActivity>('run')
  const [durationMin, setDurationMin] = useState<number | ''>('')
  const [distanceValue, setDistanceValue] = useState<number | ''>('')
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km')
  const [rpe, setRpe] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const save = () => {
    if (durationMin === '' || durationMin <= 0) return
    addSession({
      id: newId(),
      date: todayLocalDate(),
      type: 'cardio',
      activity,
      durationMin,
      ...(distanceValue !== '' && distanceValue > 0
        ? { distanceKm: toKm(distanceValue, distanceUnit) }
        : {}),
      ...(rpe !== '' ? { rpe } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    })
    setDurationMin('')
    setDistanceValue('')
    setRpe('')
    setNotes('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="log-form">
      <div className="log-form__field">
        <label>Activity</label>
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value as CardioActivity)}
        >
          {ACTIVITIES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

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

      <div className="log-form__field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button
        type="button"
        className="log-form__button log-form__button--primary"
        onClick={save}
        disabled={durationMin === '' || durationMin <= 0}
      >
        Save session
      </button>

      {saved && <p className="log-form__status">Saved</p>}
    </div>
  )
}
