import { NavLink } from 'react-router-dom'
import './TabBar.css'

const tabs = [
  { to: '/', label: 'Today', end: true },
  { to: '/log', label: 'Log' },
  { to: '/body', label: 'Body' },
  { to: '/progress', label: 'Progress' },
]

export default function TabBar() {
  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            isActive ? 'tab-bar__item tab-bar__item--active' : 'tab-bar__item'
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
