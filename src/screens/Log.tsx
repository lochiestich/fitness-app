import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SegmentedControl from '../components/SegmentedControl'
import { todayLocalDate } from '../lib/store'
import LogLift from './log/LogLift'
import LogCardio from './log/LogCardio'
import './Log.css'

export type LogType = 'lift' | 'cardio'

export default function Log() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { type?: LogType; date?: string } | null
  const [type, setType] = useState<LogType>(state?.type ?? 'lift')
  const date = state?.date

  return (
    <section>
      <h1>Log</h1>
      {date && date !== todayLocalDate() && (
        <p className="log-backdate-notice">Logging for {date}</p>
      )}
      {!date && (
        <button type="button" className="log-previous-day" onClick={() => navigate('/calendar')}>
          Log a previous day
        </button>
      )}
      <SegmentedControl
        options={[
          { value: 'lift', label: 'Lift' },
          { value: 'cardio', label: 'Cardio' },
        ]}
        value={type}
        onChange={setType}
      />
      {type === 'lift' && <LogLift date={date} />}
      {type === 'cardio' && <LogCardio date={date} />}
    </section>
  )
}
