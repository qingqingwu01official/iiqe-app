import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'
import type { BatchLevel } from '../types'

const BATCH_CONFIG: Record<BatchLevel, {
  label: string
  colorCls: string
  borderCls: string
  dotColor: string
}> = {
  1: { label: '★★ 重中之重', colorCls: 'bg-red-100 text-red-700',   borderCls: 'border-red-200',   dotColor: 'bg-red-500' },
  2: { label: '★ 次重点',    colorCls: 'bg-orange-100 text-orange-700', borderCls: 'border-orange-200', dotColor: 'bg-orange-500' },
  3: { label: '一般考点',    colorCls: 'bg-blue-100 text-blue-700',   borderCls: 'border-blue-200',   dotColor: 'bg-blue-500' },
  4: { label: '补充考点',    colorCls: 'bg-gray-100 text-gray-600',   borderCls: 'border-gray-200',   dotColor: 'bg-gray-400' },
}

type FilterBatch = 'all' | BatchLevel

export default function ErrorBookPage() {
  const navigate = useNavigate()
  const { questions, getCellState } = useQuestionStore()

  const [filter, setFilter] = useState<FilterBatch>('all')
  const [sortBy, setSortBy] = useState<'importance' | 'errorCount'>('importance')

  // 红格子 = 错题
  const errorQuestions = questions.filter(q => getCellState(q.id).status === 'red')

  const filtered = errorQuestions.filter(q =>
    filter === 'all' ? true : q.batchLevel === filter
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'importance') {
      if (a.batchLevel !== b.batchLevel) return a.batchLevel - b.batchLevel
    } else {
      const ca = getCellState(a.id).errorCount
      const cb = getCellState(b.id).errorCount
      return cb - ca
    }
    return 0
  })

  // 按批次分组（仅 all 模式下分组显示）
  const groupedByBatch: Record<BatchLevel, typeof sorted> = { 1: [], 2: [], 3: [], 4: [] }
  sorted.forEach(q => groupedByBatch[q.batchLevel].push(q))

  const filterTabs: { key: FilterBatch; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 1, label: '重中之重' },
    { key: 2, label: '次重点' },
    { key: 3, label: '一般' },
    { key: 4, label: '补充' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">📕 错题本</div>
            <div className="text-xs text-gray-400 mt-0.5">
              共 {errorQuestions.length} 道错题待消灭
            </div>
          </div>
          {/* 排序 */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('importance')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                ${sortBy === 'importance' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              按重要性
            </button>
            <button
              onClick={() => setSortBy('errorCount')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                ${sortBy === 'errorCount' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              按错误次数
            </button>
          </div>
        </div>

        {/* 筛选 Tab */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterTabs.map(({ key, label }) => {
            const count = key === 'all'
              ? errorQuestions.length
              : errorQuestions.filter(q => q.batchLevel === key).length
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${filter === key ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {label} {count > 0 && `(${count})`}
              </button>
            )
          })}
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {errorQuestions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎉</div>
            <div className="text-lg font-bold text-gray-800">没有错题！</div>
            <p className="text-sm text-gray-400 mt-2">继续刷题，保持零错题状态！</p>
          </div>
        ) : filter === 'all' ? (
          // 分组显示
          ([1, 2, 3, 4] as BatchLevel[]).map(batch => {
            const qs = groupedByBatch[batch]
            if (qs.length === 0) return null
            const cfg = BATCH_CONFIG[batch]
            return (
              <div key={batch}>
                <div className={`text-xs font-bold px-3 py-2 rounded-xl mb-2 ${cfg.colorCls}`}>
                  {cfg.label}的错题（{qs.length} 道）
                </div>
                <div className="space-y-2">
                  {qs.map(q => <ErrorItem key={q.id} q={q} cfg={cfg} navigate={navigate} getCellState={getCellState} />)}
                </div>
              </div>
            )
          })
        ) : (
          // 单批次显示
          <div className="space-y-2">
            {sorted.map(q => {
              const cfg = BATCH_CONFIG[q.batchLevel]
              return <ErrorItem key={q.id} q={q} cfg={cfg} navigate={navigate} getCellState={getCellState} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorItem({ q, cfg, navigate, getCellState }: {
  q: ReturnType<typeof useQuestionStore.getState>['questions'][0]
  cfg: typeof BATCH_CONFIG[BatchLevel]
  navigate: ReturnType<typeof useNavigate>
  getCellState: ReturnType<typeof useQuestionStore.getState>['getCellState']
}) {
  const cell = getCellState(q.id)
  return (
    <div className={`bg-white rounded-2xl p-4 border shadow-sm ${cfg.borderCls}`}>
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dotColor}`} />
        <div className="flex-1 min-w-0">
          {/* 题目摘要 */}
          <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
            {q.question}
          </p>

          {/* 元信息 */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {q.topic && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {q.topic}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.colorCls}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-red-500">
              答错 {cell.errorCount} 次
            </span>
          </div>

          {/* 消灭进度 */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">消灭进度</span>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border ${
                    i < cell.correctStreak
                      ? 'bg-green-400 border-green-400'
                      : 'bg-white border-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">{cell.correctStreak}/3</span>
            </div>
          </div>
        </div>

        {/* 练习按钮 */}
        <button
          onClick={() => navigate(`/quiz?mode=sprint&questionId=${q.id}`)}
          className="flex-shrink-0 bg-red-500 text-white text-xs px-3 py-1.5 rounded-xl font-medium active:scale-95 transition-transform"
        >
          练习
        </button>
      </div>
    </div>
  )
}
