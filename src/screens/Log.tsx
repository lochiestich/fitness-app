import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import SegmentedControl from '../components/SegmentedControl'
import { todayLocalDate } from '../lib/store'
import LogLift from './log/LogLift'
import LogCardio from './log/LogCardio'
import './Log.css'

export type LogType = 'lift' | 'cardio'

export default function Log() {
  const location = useLocation()
  const state = location.state as { type?: LogType; date?: string } | null
  const [type, setType] = useState<LogType>(state?.type ?? 'lift')
  const date = state?.date

  return (
    <section>
      <h1>Log</h1>
      {date && date !== todayLocalDate() && (
        <p className="log-backdate-notice">Logging for {date}</p>
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
