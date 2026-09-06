import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts'
import { horseTally, weeklyChukkas } from '../../lib/metrics'
import type { Session } from '../../types'
import './Progress.css'
import './PoloProgress.css'

type Props = {
  sessions: Session[]
  referenceDate: string
}

const WEEKS = 12

export default function PoloProgress({ sessions, referenceDate }: Props) {
  const poloSessions = sessions.filter((s) => s.type === 'polo')

  if (poloSessions.length === 0) {
    return (
      <div className="progress-block">
        <h2>Polo</h2>
        <p className="progress-empty">Log a polo session to see your stats here.</p>
      </div>
    )
  }

  const totalChukkas = poloSessions.reduce((sum, s) => sum + s.chukkas, 0)
  const weekly = weeklyChukkas(sessions, referenceDate, WEEKS).map((w) => ({
    week: w.weekStart.slice(5),
    chukkas: w.chukkas,
  }))
  const horses = horseTally(sessions)

  return (
    <div className="progress-block">
      <h2>Polo</h2>

      <div className="polo-progress__stats">
        <div className="polo-progress__stat">
          <span className="polo-progress__stat-value">{poloSessions.length}</span>
          <span className="polo-progress__stat-label">Games</span>
        </div>
        <div className="polo-progress__stat">
          <span className="polo-progress__stat-value">{totalChukkas}</span>
          <span className="polo-progress__stat-label">Chukkas</span>
        </div>
        <div className="polo-progress__stat">
          <span className="polo-progress__stat-value">{horses.length}</span>
          <span className="polo-progress__stat-label">Horses</span>
        </div>
      </div>

      <p className="progress-subheading">Weekly chukkas</p>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={weekly} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <XAxis
            dataKey="week"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <Bar dataKey="chukkas" fill="var(--color-type-polo)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <p className="progress-subheading">Games by horse</p>
      <div className="polo-progress__horses">
        {horses.map((h) => (
          <div className="polo-progress__horse-row" key={h.horse}>
            <span className="polo-progress__horse-name">{h.horse}</span>
            <span className="polo-progress__horse-count">
              {h.count} {h.count === 1 ? 'game' : 'games'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
