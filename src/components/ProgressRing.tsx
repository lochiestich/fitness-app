import './ProgressRing.css'

type Props = {
  value: number
  target: number
  label: string
  color: string
}

const SIZE = 72
const STROKE = 8
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function ProgressRing({ value, target, label, color }: Props) {
  const pct = target > 0 ? Math.min(1, value / target) : 0
  const offset = CIRCUMFERENCE * (1 - pct)

  return (
    <div className="progress-ring">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${label}: ${value} of ${target}`}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-surface-raised)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="progress-ring__text">
          {value}/{target}
        </text>
      </svg>
      <span className="progress-ring__label">{label}</span>
    </div>
  )
}
