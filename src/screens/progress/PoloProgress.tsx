import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts'
import { horseTally, weeklyChukkas } from '../../lib/metrics'
import type { Session } from '../../types'
import './Progress.css'

type Props = {
  sessions: Session[]
  referenceDate: string
}

const WEEKS = 12

export default function PoloProgress({ sessions, referenceDate }: Props) {
  const hasPolo = sessions.some((s) => s.type === 'polo')
  if (!hasPolo) {
    return (
      <div className="progress-block">
        <h2>Polo</h2>
        <p className="progress-empty">Log a chukka to see progress here.</p>
      </div>
    )
  }

  const chukkas = weeklyChukkas(sessions, referenceDate, WEEKS).map((w) => ({
    week: w.weekStart.slice(5),
    chukkas: w.chukkas,
  }))
  const horses = horseTally(sessions)

  return (
    <div className="progress-block">
      <h2>Polo</h2>
      <p className="progress-subheading">Chukkas per week</p>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={chukkas} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <XAxis
            dataKey="week"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <Bar dataKey="chukkas" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <p className="progress-subheading">Horses played</p>
      <div className="polo-horse-tally">
        {horses.map((h) => (
          <div key={h.horse} className="polo-horse-tally__row">
            <span>{h.horse}</span>
            <span>{h.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
