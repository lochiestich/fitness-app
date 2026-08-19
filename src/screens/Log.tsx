import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import SegmentedControl from '../components/SegmentedControl'
import LogLift from './log/LogLift'
import LogCardio from './log/LogCardio'
import LogPolo from './log/LogPolo'

export type LogType = 'lift' | 'cardio' | 'polo'

export default function Log() {
  const location = useLocation()
  const initial = (location.state as { type?: LogType } | null)?.type ?? 'lift'
  const [type, setType] = useState<LogType>(initial)

  return (
    <section>
      <h1>Log</h1>
      <SegmentedControl
        options={[
          { value: 'lift', label: 'Lift' },
          { value: 'cardio', label: 'Cardio' },
          { value: 'polo', label: 'Polo' },
        ]}
        value={type}
        onChange={setType}
      />
      {type === 'lift' && <LogLift />}
      {type === 'cardio' && <LogCardio />}
      {type === 'polo' && <LogPolo />}
    </section>
  )
}
