import { useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { bestSetForExercise, e1rmHistory, loggedExerciseIds } from '../../lib/metrics'
import type { Exercise, Session } from '../../types'
import './Progress.css'

type Props = {
  sessions: Session[]
  exercises: Exercise[]
  bodyweightKg: number
}

export default function LiftingProgress({ sessions, exercises, bodyweightKg }: Props) {
  const loggedIds = loggedExerciseIds(sessions)
  const options = exercises
    .filter((e) => loggedIds.includes(e.id))
    .sort((a, b) => a.name.localeCompare(b.name))
  const [exerciseId, setExerciseId] = useState(options[0]?.id ?? '')

  if (options.length === 0) {
    return (
      <div className="progress-block">
        <h2>Lifting</h2>
        <p className="progress-empty">Log a lift to see progress here.</p>
      </div>
    )
  }

  const history = e1rmHistory(sessions, exercises, bodyweightKg, exerciseId).map((p) => ({
    date: p.date.slice(5),
    e1rm: Math.round(p.e1rm),
  }))
  const best = bestSetForExercise(sessions, exercises, bodyweightKg, exerciseId)

  return (
    <div className="progress-block">
      <h2>Lifting</h2>
      <select
        className="progress-select"
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
      >
        {options.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={history} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
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
            dataKey="e1rm"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {best && (
        <p className="progress-best-set">
          Best set: {best.weightKg}kg × {best.reps} ({best.date}) — e1RM {Math.round(best.e1rm)}
        </p>
      )}
    </div>
  )
}
