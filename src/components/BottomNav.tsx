import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/',      icon: '🏠', label: '首页' },
  { to: '/grid',  icon: '🔲', label: '格子总览' },
  { to: '/errors',icon: '📕', label: '错题本' },
  { to: '/me',    icon: '👤', label: '我的' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto">
        {tabs.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors
               ${isActive ? 'text-blue-600' : 'text-gray-400'}`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
