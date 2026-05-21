import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/',          label: '备考地图', icon: '🗺' },
  { to: '/quiz',      label: '刷题',     icon: '✏️' },
  { to: '/review',    label: '难点复习', icon: '🔴' },
  { to: '/progress',  label: '准备度',   icon: '📊' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200">
      <div className="flex">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
