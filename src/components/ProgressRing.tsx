interface Props {
  score: number        // 0-100
  size?: number        // px，默认 80
  strokeWidth?: number // 默认 8
  label?: string       // 环中文字，默认显示百分比
}

// 准备度 → 颜色
function scoreColor(score: number) {
  if (score >= 70) return '#16A34A'  // 绿
  if (score >= 40) return '#D97706'  // 橙
  return '#DC2626'                   // 红
}

// 准备度 → 状态文字
export function readinessLabel(score: number): string {
  if (score >= 80) return '有望通过'
  if (score >= 60) return '接近过线'
  if (score >= 30) return '打好基础'
  return '刚刚起步'
}

export default function ProgressRing({ score, size = 80, strokeWidth = 8, label }: Props) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = scoreColor(score)
  const cx = size / 2

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景轨道 */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        {/* 进度弧 */}
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* 中间文字 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none" style={{ color }}>
          {label ?? `${score}%`}
        </span>
      </div>
    </div>
  )
}
