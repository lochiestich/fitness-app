import { useState } from 'react'
import SegmentedControl from '../components/SegmentedControl'
import LogLift from './log/LogLift'
import LogCardio from './log/LogCardio'
import LogPolo from './log/LogPolo'

type LogType = 'lift' | 'cardio' | 'polo'

export default function Log() {
  const [type, setType] = useState<LogType>('lift')

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
