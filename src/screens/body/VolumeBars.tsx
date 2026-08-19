import { useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { muscleVolumeInWindow } from '../../lib/metrics'
import { MUSCLE_IDS, MUSCLE_LABELS } from '../../lib/muscles'
import type { Exercise, Session } from '../../types'
import SegmentedControl from '../../components/SegmentedControl'
import './VolumeBars.css'

type Props = {
  sessions: Session[]
  exercises: Exercise[]
  bodyweightKg: number
  referenceDate: string
}

type WindowDays = '7' | '28'

const BAR_ROW_HEIGHT = 20

export default function VolumeBars({
  sessions,
  exercises,
  bodyweightKg,
  referenceDate,
}: Props) {
  const [windowDays, setWindowDays] = useState<WindowDays>('7')
  const volumes = muscleVolumeInWindow(
    sessions,
    exercises,
    bodyweightKg,
    Number(windowDays),
    referenceDate,
  )
  const data = MUSCLE_IDS.map((m) => ({
    muscle: MUSCLE_LABELS[m],
    volume: Math.round(volumes[m]),
  })).sort((a, b) => b.volume - a.volume)

  return (
    <div className="volume-bars">
      <div className="volume-bars__header">
        <h2>Volume by muscle</h2>
        <SegmentedControl
          options={[
            { value: '7', label: '7 day' },
            { value: '28', label: '28 day' },
          ]}
          value={windowDays}
          onChange={setWindowDays}
        />
      </div>
      <ResponsiveContainer width="100%" height={BAR_ROW_HEIGHT * data.length + 16}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="muscle"
            width={88}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="volume" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
