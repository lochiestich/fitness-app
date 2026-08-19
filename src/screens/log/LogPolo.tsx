import { useState } from 'react'
import { addSession, knownHorses, loadDB, newId, todayLocalDate } from '../../lib/store'
import ChipInput from '../../components/ChipInput'
import './LogForm.css'

const MIN_PER_CHUKKA = 7.5

export default function LogPolo() {
  const [suggestions] = useState(() => knownHorses(loadDB()))
  const [chukkas, setChukkas] = useState<number | ''>('')
  const [horses, setHorses] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const save = () => {
    if (chukkas === '' || chukkas <= 0) return
    addSession({
      id: newId(),
      date: todayLocalDate(),
      type: 'polo',
      chukkas,
      durationMin: chukkas * MIN_PER_CHUKKA,
      horses,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    })
    setChukkas('')
    setHorses([])
    setNotes('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="log-form">
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
          suggestions={suggestions}
          placeholder="Tap a horse, or type a new one"
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
        disabled={chukkas === '' || chukkas <= 0}
      >
        Save session
      </button>

      {saved && <p className="log-form__status">Saved</p>}
    </div>
  )
}
