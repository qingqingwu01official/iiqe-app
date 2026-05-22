import type { CellState } from '../types'

interface Props {
  questionNo: number   // 显示在格子里的序号
  cell: CellState
  onClick?: () => void
  size?: number        // px，默认 36
}

export default function GridCell({ questionNo, cell, onClick, size = 36 }: Props) {
  const { status, errorCount, correctStreak } = cell

  const bg = status === 'green' ? '#4CAF50'
           : status === 'red'   ? '#EF5350'
           : '#BDBDBD'

  const innerLabel = status === 'red'
    ? (correctStreak > 0 ? `${correctStreak}/3` : String(errorCount || ''))
    : status === 'green' ? '✓'
    : null

  return (
    <button
      onClick={onClick}
      title={`第${questionNo}题 · ${
        status === 'gray' ? '未做' : status === 'red' ? `答错${errorCount}次` : '已掌握'
      }`}
      style={{ width: size, height: size }}
      className="relative rounded flex flex-col items-center justify-center transition-transform active:scale-90 select-none"
    >
      {/* 背景色块 */}
      <div
        className="absolute inset-0 rounded"
        style={{ backgroundColor: bg, opacity: status === 'gray' ? 0.5 : 1 }}
      />
      {/* 题号 */}
      <span
        className="relative z-10 leading-none font-medium"
        style={{
          fontSize: size <= 32 ? 8 : 9,
          color: status === 'gray' ? '#888' : 'white',
          marginBottom: innerLabel ? 1 : 0,
        }}
      >
        {questionNo}
      </span>
      {/* 状态子标签 */}
      {innerLabel && (
        <span
          className="relative z-10 leading-none font-bold"
          style={{ fontSize: 7, color: 'rgba(255,255,255,0.9)' }}
        >
          {innerLabel}
        </span>
      )}
    </button>
  )
}
