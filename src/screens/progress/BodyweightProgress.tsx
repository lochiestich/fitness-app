import { useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { addBodyweightLog, bodyweightLogsSorted, currentBodyweightKg, todayLocalDate } from '../../lib/store'
import type { DB } from '../../types'
import './Progress.css'
import '../log/LogForm.css'

type Props = {
  db: DB
  onChange: () => void
}

export default function BodyweightProgress({ db, onChange }: Props) {
  const [weight, setWeight] = useState<number | ''>('')
  const [saved, setSaved] = useState(false)

  const logs = bodyweightLogsSorted(db)
  const data = logs.map((l) => ({ date: l.date.slice(5), weightKg: l.weightKg }))
  const current = currentBodyweightKg(db)

  const save = () => {
    if (weight === '' || weight <= 0) return
    addBodyweightLog(todayLocalDate(), weight)
    setWeight('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onChange()
  }

  return (
    <div className="progress-block">
      <h2>Bodyweight</h2>
      <p className="progress-best-set">Current: {current}kg</p>

      {data.length > 1 && (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
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
              dataKey="weightKg"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="log-form">
        <div className="log-form__row">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Weigh in (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <button
            type="button"
            className="log-form__button log-form__button--primary"
            disabled={weight === '' || weight <= 0}
            onClick={save}
          >
            Log weight
          </button>
        </div>
        {saved && <p className="log-form__status">Saved</p>}
      </div>
    </div>
  )
}
