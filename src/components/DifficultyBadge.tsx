import type { DifficultyLevel } from '../types'

const CONFIG: Record<DifficultyLevel, { bg: string; text: string; border: string; icon: string }> = {
  '严重难点': { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-300',    icon: '⚠' },
  '一般难点': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', icon: '△' },
  '掌握边缘': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', icon: '◎' },
  '已掌握':   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300',  icon: '✓' },
}

interface Props {
  level: DifficultyLevel
  showIcon?: boolean
}

export default function DifficultyBadge({ level, showIcon = true }: Props) {
  const { bg, text, border, icon } = CONFIG[level]
  const isSevere = level === '严重难点'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs border
        ${bg} ${text} ${border} ${isSevere ? 'font-semibold' : ''}`}
    >
      {showIcon && <span className="leading-none">{icon}</span>}
      {level}
    </span>
  )
}

// 严重难点提示横幅，用于解析页顶部
export function SevereBanner() {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
      <span className="text-base">⚠</span>
      <div>
        <span className="font-semibold">严重难点</span>
        <span className="text-red-500 ml-1">· 很多人在这里犯错，重点看</span>
      </div>
    </div>
  )
}
