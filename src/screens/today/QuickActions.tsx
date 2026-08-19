import { useNavigate } from 'react-router-dom'
import type { LogType } from '../Log'

export default function QuickActions() {
  const navigate = useNavigate()
  const go = (type: LogType) => navigate('/log', { state: { type } })

  return (
    <div className="quick-actions">
      <button type="button" className="quick-actions__button" onClick={() => go('lift')}>
        Log lift
      </button>
      <button type="button" className="quick-actions__button" onClick={() => go('cardio')}>
        Log cardio
      </button>
      <button type="button" className="quick-actions__button" onClick={() => go('polo')}>
        Log polo
      </button>
    </div>
  )
}
