import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'
import GridCell from '../components/GridCell'
import type { BatchLevel } from '../types'

const BATCH_LABEL: Record<BatchLevel, { label: string; color: string; textColor: string }> = {
  1: { label: '★★ 重中之重', color: '#FFEBEE', textColor: '#C62828' },
  2: { label: '★ 次重点',    color: '#FFF3E0', textColor: '#E65100' },
  3: { label: '一般考点',    color: '#E3F2FD', textColor: '#1565C0' },
  4: { label: '补充考点',    color: '#F5F5F5', textColor: '#616161' },
}

export default function GridPage() {
  const navigate = useNavigate()
  const { questions, getCellState, getRedCells } = useQuestionStore()
  const [chapterFilter, setChapterFilter] = useState<number | null>(null)
  const [redOnly, setRedOnly] = useState(false)

  const redCellIds = new Set(getRedCells())

  const chapters = [...new Set(questions.map(q => q.chapter))].sort()

  const filteredQs = questions.filter(q => {
    if (chapterFilter !== null && q.chapter !== chapterFilter) return false
    if (redOnly && !redCellIds.has(q.id)) return false
    return true
  })

  // 按 batchLevel 分组
  const grouped: Record<BatchLevel, typeof filteredQs> = { 1: [], 2: [], 3: [], 4: [] }
  filteredQs.forEach(q => grouped[q.batchLevel].push(q))

  // 分组内：红格子排前，灰格子居中，绿格子最后
  const sortGroup = (qs: typeof filteredQs) => {
    return [...qs].sort((a, b) => {
      const order = { red: 0, gray: 1, green: 2 }
      return order[getCellState(a.id).status] - order[getCellState(b.id).status]
    })
  }

  const totalRed = redCellIds.size
  const chapterRedCount = (ch: number) =>
    questions.filter(q => q.chapter === ch && redCellIds.has(q.id)).length

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">🔲 全部格子总览</div>
          <button
            onClick={() => setRedOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
              ${redOnly ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500 border border-red-200'}`}
          >
            🔴 {totalRed} 个红格子
          </button>
        </div>

        {/* 章节 Tab */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setChapterFilter(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${chapterFilter === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            全部
          </button>
          {chapters.map(ch => {
            const redCount = chapterRedCount(ch)
            return (
              <button
                key={ch}
                onClick={() => setChapterFilter(chapterFilter === ch ? null : ch)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1
                  ${chapterFilter === ch ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                第{ch}章
                {redCount > 0 && (
                  <span className={`font-bold ${chapterFilter === ch ? 'text-red-200' : 'text-red-500'}`}>
                    🔴{redCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {([1, 2, 3, 4] as BatchLevel[]).map(batch => {
          const qs = sortGroup(grouped[batch])
          if (qs.length === 0) return null
          const cfg = BATCH_LABEL[batch]
          const batchRed = qs.filter(q => getCellState(q.id).status === 'red').length

          return (
            <div key={batch}>
              {/* 分组标题 */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-xl mb-2"
                style={{ backgroundColor: cfg.color }}
              >
                <span className="text-sm font-bold" style={{ color: cfg.textColor }}>
                  {cfg.label}
                </span>
                <span className="text-xs" style={{ color: cfg.textColor }}>
                  {batchRed > 0
                    ? `🔴 ${batchRed} 个红格子`
                    : qs.every(q => getCellState(q.id).status === 'green')
                    ? '✅ 全部掌握'
                    : `共 ${qs.length} 道`
                  }
                </span>
              </div>

              {/* 格子网格 */}
              <div className="flex flex-wrap gap-1.5">
                {qs.map((q, idx) => (
                  <GridCell
                    key={q.id}
                    questionNo={idx + 1}
                    cell={getCellState(q.id)}
                    size={38}
                    onClick={() => navigate(`/quiz?mode=sprint&questionId=${q.id}`)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {filteredQs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm">没有符合条件的格子</div>
          </div>
        )}
      </div>

      {/* 底部 CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 max-w-md mx-auto">
        <button
          onClick={() => navigate('/sprint')}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
        >
          <span>⚡ 开始消灭红格子</span>
          {totalRed > 0 && (
            <span className="bg-red-400 rounded-full px-2 py-0.5 text-xs">{totalRed}</span>
          )}
        </button>
      </div>
    </div>
  )
}
