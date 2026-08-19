import { useState } from 'react'
import { addSession, knownHorses, loadDB, newId, todayLocalDate } from '../../lib/store'
import ChipInput from '../../components/ChipInput'
import './LogForm.css'

export default function LogPolo() {
  const [suggestions] = useState(() => knownHorses(loadDB()))
  const [chukkas, setChukkas] = useState(0)
  const [durationMin, setDurationMin] = useState(0)
  const [durationTouched, setDurationTouched] = useState(false)
  const [horses, setHorses] = useState<string[]>([])
  const [rpe, setRpe] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const setChukkasValue = (value: number) => {
    setChukkas(value)
    if (!durationTouched) setDurationMin(value * 7.5)
  }

  const save = () => {
    if (chukkas <= 0 || durationMin <= 0) return
    addSession({
      id: newId(),
      date: todayLocalDate(),
      type: 'polo',
      chukkas,
      durationMin,
      horses,
      ...(rpe !== '' ? { rpe } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    })
    setChukkas(0)
    setDurationMin(0)
    setDurationTouched(false)
    setHorses([])
    setRpe('')
    setNotes('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="log-form">
      <div className="log-form__row">
        <div className="log-form__field">
          <label>Chukkas</label>
          <input
            type="number"
            inputMode="decimal"
            value={chukkas}
            onChange={(e) => setChukkasValue(Number(e.target.value))}
          />
        </div>
        <div className="log-form__field">
          <label>Duration (min)</label>
          <input
            type="number"
            inputMode="decimal"
            value={durationMin}
            onChange={(e) => {
              setDurationTouched(true)
              setDurationMin(Number(e.target.value))
            }}
          />
        </div>
      </div>

      <div className="log-form__field">
        <label>Horses</label>
        <ChipInput
          values={horses}
          onChange={setHorses}
          suggestions={suggestions}
          placeholder="Add a horse"
        />
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
        disabled={chukkas <= 0 || durationMin <= 0}
      >
        Save session
      </button>

      {saved && <p className="log-form__status">Saved</p>}
    </div>
  )
}
