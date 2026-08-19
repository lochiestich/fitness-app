import { useState } from 'react'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { loggedCardioActivities, paceHistory, weeklyDistance } from '../../lib/metrics'
import type { CardioActivity, Session } from '../../types'
import './Progress.css'

type Props = {
  sessions: Session[]
  referenceDate: string
}

const WEEKS = 12

function formatPace(activity: CardioActivity, pace: number): string {
  if (activity === 'cycle' || activity === 'row') return `${pace.toFixed(1)} km/h`
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  const unit = activity === 'swim' ? '/100m' : '/km'
  return `${minutes}:${String(seconds).padStart(2, '0')}${unit}`
}

export default function CardioProgress({ sessions, referenceDate }: Props) {
  const options = loggedCardioActivities(sessions).sort()
  const [activity, setActivity] = useState<CardioActivity | ''>(options[0] ?? '')

  if (options.length === 0) {
    return (
      <div className="progress-block">
        <h2>Cardio</h2>
        <p className="progress-empty">Log a cardio session to see progress here.</p>
      </div>
    )
  }

  const selected = (activity || options[0]) as CardioActivity
  const pace = paceHistory(sessions, selected).map((p) => ({
    date: p.date.slice(5),
    pace: Math.round(p.pace * 100) / 100,
  }))
  const distance = weeklyDistance(sessions, selected, referenceDate, WEEKS).map((w) => ({
    week: w.weekStart.slice(5),
    distanceKm: w.distanceKm,
  }))
  const latest = pace[pace.length - 1]

  return (
    <div className="progress-block">
      <h2>Cardio</h2>
      <select
        className="progress-select"
        value={selected}
        onChange={(e) => setActivity(e.target.value as CardioActivity)}
      >
        {options.map((a) => (
          <option key={a} value={a}>
            {a[0].toUpperCase() + a.slice(1)}
          </option>
        ))}
      </select>

      {pace.length > 0 ? (
        <>
          <p className="progress-subheading">Pace over time</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={pace} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
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
              <Line
                type="monotone"
                dataKey="pace"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {latest && (
            <p className="progress-best-set">
              Latest pace: {formatPace(selected, latest.pace)}
            </p>
          )}
        </>
      ) : (
        <p className="progress-empty">No distance logged for {selected} yet.</p>
      )}

      <p className="progress-subheading">Weekly distance</p>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={distance} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <XAxis
            dataKey="week"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <Bar dataKey="distanceKm" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
