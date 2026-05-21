import type { ImportanceLevel } from '../types'

const CONFIG: Record<ImportanceLevel, { bg: string; text: string; label: string }> = {
  '重中之重': { bg: 'bg-red-100',    text: 'text-red-700',    label: '重中之重' },
  '次重点':   { bg: 'bg-orange-100', text: 'text-orange-700', label: '次重点'   },
  '一般重点': { bg: 'bg-blue-100',   text: 'text-blue-700',   label: '一般重点' },
  '补充考点': { bg: 'bg-gray-100',   text: 'text-gray-500',   label: '补充考点' },
}

interface Props {
  level: ImportanceLevel
  size?: 'sm' | 'md'
}

export default function ImportanceBadge({ level, size = 'md' }: Props) {
  const { bg, text, label } = CONFIG[level]
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs font-medium'
  return (
    <span className={`inline-flex items-center rounded-full ${bg} ${text} ${padding}`}>
      {label}
    </span>
  )
}
