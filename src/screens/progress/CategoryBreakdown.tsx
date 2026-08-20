import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { liftSummary, setsByBroadGroup } from '../../lib/metrics'
import type { BroadGroupSetCount } from '../../lib/metrics'
import type { BroadGroupId } from '../../lib/muscles'
import type { Exercise, Session } from '../../types'
import SegmentedControl from '../../components/SegmentedControl'
import './CategoryBreakdown.css'

type Props = {
  sessions: Session[]
  exercises: Exercise[]
  bodyweightKg: number
  referenceDate: string
}

type WindowDays = '7' | '28'

// Fixed order, never cycled -- matches the --color-group-* custom properties in
// tokens.css, validated for CVD-safe adjacent pairs against this app's dark surface.
const GROUP_COLOR: Record<BroadGroupId, string> = {
  chest: 'var(--color-group-chest)',
  shoulders: 'var(--color-group-shoulders)',
  back: 'var(--color-group-back)',
  biceps: 'var(--color-group-biceps)',
  triceps: 'var(--color-group-triceps)',
  forearms: 'var(--color-group-forearms)',
  legs: 'var(--color-group-legs)',
  core: 'var(--color-group-core)',
}

export default function CategoryBreakdown({
  sessions,
  exercises,
  bodyweightKg,
  referenceDate,
}: Props) {
  const [windowDays, setWindowDays] = useState<WindowDays>('7')
  const days = Number(windowDays)
  const groups = setsByBroadGroup(sessions, exercises, days, referenceDate)
  const summary = liftSummary(sessions, exercises, bodyweightKg, days, referenceDate)

  return (
    <div className="progress-block">
      <div className="category-breakdown__header">
        <h2>Sets by category</h2>
        <SegmentedControl
          options={[
            { value: '7', label: '7 day' },
            { value: '28', label: '28 day' },
          ]}
          value={windowDays}
          onChange={setWindowDays}
        />
      </div>

      {groups.length === 0 ? (
        <p className="progress-empty">No lifting logged in the last {days} days.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={groups}
                dataKey="sets"
                nameKey="label"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                stroke="var(--color-surface)"
                strokeWidth={2}
              >
                {groups.map((g) => (
                  <Cell key={g.id} fill={GROUP_COLOR[g.id]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, item) => {
                  const group = item.payload as BroadGroupSetCount
                  return [`${value} sets (${group.percent.toFixed(0)}%)`, group.label]
                }}
                contentStyle={{
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: 'var(--color-text-muted)' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="category-breakdown__legend">
            {groups.map((g) => (
              <div className="category-breakdown__row" key={g.id}>
                <span
                  className="category-breakdown__dot"
                  style={{ background: GROUP_COLOR[g.id] }}
                />
                <span className="category-breakdown__label">{g.label}</span>
                <span className="category-breakdown__sets">{g.sets} sets</span>
                <span className="category-breakdown__percent">{g.percent.toFixed(0)}%</span>
              </div>
            ))}
          </div>

          <div className="category-breakdown__stats">
            <div className="category-breakdown__stat">
              <span className="category-breakdown__stat-value">{summary.workouts}</span>
              <span className="category-breakdown__stat-label">Workouts</span>
            </div>
            <div className="category-breakdown__stat">
              <span className="category-breakdown__stat-value">{summary.sets}</span>
              <span className="category-breakdown__stat-label">Sets</span>
            </div>
            <div className="category-breakdown__stat">
              <span className="category-breakdown__stat-value">{summary.reps}</span>
              <span className="category-breakdown__stat-label">Reps</span>
            </div>
            <div className="category-breakdown__stat">
              <span className="category-breakdown__stat-value">
                {Math.round(summary.volumeKg).toLocaleString()}
              </span>
              <span className="category-breakdown__stat-label">Volume (kg)</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
