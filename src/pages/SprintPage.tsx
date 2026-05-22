import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'
import type { BatchLevel } from '../types'

const BATCH_CONFIG: Record<BatchLevel, {
  label: string
  star: string
  color: string
  bg: string
  border: string
  desc: string
  sub: string
}> = {
  1: {
    label: '重中之重',
    star: '★★',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    desc: '前 30% 考点 · 覆盖约 30% 考试分值',
    sub: '必须拿下',
  },
  2: {
    label: '次重点',
    star: '★',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    desc: '30-70% 考点 · 掌握后预计可过关',
    sub: '集中练习',
  },
  3: {
    label: '一般考点',
    star: '',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: '70-85% 考点 · 掌握后预计 85 分以上',
    sub: '时间允许练',
  },
  4: {
    label: '补充考点',
    star: '',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    desc: '85-100% 考点 · 时间充裕再做',
    sub: '余力再补',
  },
}

export default function SprintPage() {
  const navigate = useNavigate()
  const { getBatchStats } = useQuestionStore()
  const batchStats = getBatchStats()

  const batches: BatchLevel[] = [1, 2, 3, 4]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-xl">←</button>
        <div>
          <div className="text-lg font-bold text-gray-900">⚡ 考前冲刺</div>
          <div className="text-xs text-gray-400 mt-0.5">按重难点算法，四个题库</div>
        </div>
        <button
          onClick={() => navigate('/grid')}
          className="ml-auto w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg"
        >
          🔲
        </button>
      </header>

      <div className="px-4 py-4 space-y-3 max-w-md mx-auto">
        {/* 说明卡 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            💡 先拿下<strong>重中之重</strong>，已经可以通过考试。<br />按顺序练习，效率最高。
          </p>
        </div>

        {/* 题库列表 */}
        {batches.map((batch, idx) => {
          const cfg = BATCH_CONFIG[batch]
          const stats = batchStats[batch]
          const donePct = stats.total > 0
            ? Math.round((stats.green / stats.total) * 100)
            : 0

          // 视觉权重递减：第一个最大，逐渐缩小
          const scale = idx === 0 ? 'scale-100' : idx === 1 ? 'scale-98' : 'scale-96'

          return (
            <button
              key={batch}
              onClick={() => navigate(`/quiz?mode=sprint&batch=${batch}`)}
              className={`w-full rounded-2xl p-4 border text-left transition-transform active:scale-95
                ${cfg.bg} ${cfg.border} ${scale} shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {cfg.star && (
                    <span className={`font-bold ${cfg.color} text-base`}>{cfg.star}</span>
                  )}
                  <span className={`font-bold ${cfg.color} ${idx === 0 ? 'text-base' : 'text-sm'}`}>
                    {cfg.label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${idx === 0 ? 'bg-red-100 text-red-600' :
                      idx === 1 ? 'bg-orange-100 text-orange-600' :
                      idx === 2 ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-500'}`}
                  >
                    {cfg.sub}
                  </span>
                </div>
                <span className="text-gray-300 text-lg">→</span>
              </div>

              <div className={`text-xs mt-1 ${cfg.color} opacity-70`}>{cfg.desc}</div>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 bg-white/60 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all
                      ${idx === 0 ? 'bg-red-500' :
                        idx === 1 ? 'bg-orange-500' :
                        idx === 2 ? 'bg-blue-500' : 'bg-gray-400'}`}
                    style={{ width: `${donePct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {stats.total > 0 ? (
                    <>
                      {stats.red > 0
                        ? <span className="text-red-500 font-medium">🔴 {stats.red} 红</span>
                        : <span className="text-green-600">✓ 全绿</span>
                      }
                      &nbsp;/ 共 {stats.total} 道
                    </>
                  ) : (
                    <span className="text-gray-400">暂无题目</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}

        {/* 格子总览入口 */}
        <button
          onClick={() => navigate('/grid')}
          className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔲</span>
            <span className="font-medium text-gray-700">查看全部格子总览</span>
          </div>
          <span className="text-gray-300 text-lg">→</span>
        </button>
      </div>
    </div>
  )
}
