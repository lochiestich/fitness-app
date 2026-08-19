import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { weeklyLoad } from '../../lib/metrics'
import type { Session } from '../../types'
import './Progress.css'

type Props = {
  sessions: Session[]
  referenceDate: string
}

const WEEKS = 12

export default function WeeklyLoadChart({ sessions, referenceDate }: Props) {
  const data = weeklyLoad(sessions, referenceDate, WEEKS).map((w) => ({
    week: w.weekStart.slice(5), // MM-DD
    load: w.load,
  }))

  return (
    <div className="progress-block">
      <h2>Weekly training load</h2>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <XAxis
            dataKey="week"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--color-text-muted)' }}
          />
          <Bar dataKey="load" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
