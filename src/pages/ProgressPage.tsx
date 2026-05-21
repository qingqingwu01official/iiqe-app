import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'
import { useProgressStore } from '../store/progressStore'
import ProgressRing, { readinessLabel } from '../components/ProgressRing'
import { CHAPTERS } from '../data/chapters'

function scoreColor(score: number) {
  if (score >= 70) return { text: 'text-green-600', bg: 'bg-green-500', badge: 'bg-green-50 border-green-200 text-green-700' }
  if (score >= 40) return { text: 'text-orange-500', bg: 'bg-orange-400', badge: 'bg-orange-50 border-orange-200 text-orange-700' }
  return { text: 'text-red-600', bg: 'bg-red-500', badge: 'bg-red-50 border-red-200 text-red-700' }
}

function todaySuggestion(score: number, errorCount: number, notStarted: number): string {
  if (notStarted > 5) return `还有 ${notStarted} 题未刷过，今天先过一遍重中之重`
  if (errorCount > 3) return `错题本有 ${errorCount} 题，今天专攻错题本`
  if (score >= 80) return '保持节奏，刷一遍错题本巩固'
  if (score >= 50) return '重点攻克「重中之重」，正确率冲 80%'
  return '从第一章开始，先把重中之重刷一遍'
}

export default function ProgressPage() {
  const navigate = useNavigate()
  const { questions } = useQuestionStore()
  const { readinessScore, records, getErrorQuestions } = useProgressStore()

  const { chapterStats, totalDone, totalQ, errorCount, notStartedCount } = useMemo(() => {
    const attemptedIds = new Set(records.map(r => r.questionId))
    const errorIds = new Set(getErrorQuestions())

    // 仅第1章有真实数据，其余章节显示占位
    const chapterStats = CHAPTERS.map(ch => {
      const chQ = questions.filter(q => q.chapter === ch.id)
      const done = chQ.filter(q => attemptedIds.has(q.id)).length
      const total = chQ.length
      // 只有有题目的章节才有真实进度；其他章节 total=0 → 待解锁
      return { ...ch, done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
    })

    const ch1 = chapterStats[0]
    return {
      chapterStats,
      totalDone: ch1.done,
      totalQ: ch1.total,
      errorCount: errorIds.size,
      notStartedCount: questions.filter(q => !attemptedIds.has(q.id)).length,
    }
  }, [questions, records, getErrorQuestions])

  const color = scoreColor(readinessScore)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">

      {/* 大圆环 + 状态 */}
      <div className="bg-white border-b border-gray-100 px-4 pt-6 pb-5 flex flex-col items-center text-center">
        <ProgressRing score={readinessScore} size={120} strokeWidth={10} />
        <div className="mt-3">
          <p className={`text-lg font-bold ${color.text}`}>{readinessLabel(readinessScore)}</p>
          <p className="text-xs text-gray-400 mt-1">通过准备度 · 基于覆盖率 × 近期正确率</p>
        </div>
        {/* 状态标签 */}
        <div className={`mt-3 px-4 py-1.5 rounded-full border text-xs font-medium ${color.badge}`}>
          {readinessScore >= 80
            ? '冲刺阶段 · 保持错题复习节奏'
            : readinessScore >= 60
            ? '接近及格线 · 重点攻克薄弱章节'
            : readinessScore >= 30
            ? '打好基础阶段 · 先把重中之重刷完'
            : '起步阶段 · 今天开始刷第一遍'}
        </div>
      </div>

      {/* 今日建议 */}
      <div className="mx-4 mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5 flex gap-3">
        <span className="text-xl flex-none">💡</span>
        <div>
          <p className="text-xs font-semibold text-blue-700 mb-0.5">今日建议</p>
          <p className="text-sm text-blue-800 leading-relaxed">
            {todaySuggestion(readinessScore, errorCount, notStartedCount)}
          </p>
        </div>
      </div>

      {/* 关键数据 */}
      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        {[
          { label: '已刷题', value: totalDone, unit: `/ ${totalQ}`, color: 'text-gray-800' },
          { label: '错题本', value: errorCount, unit: '题', color: errorCount > 0 ? 'text-red-500' : 'text-green-600' },
          { label: '近期正确率', value: readinessScore > 0 ? `${readinessScore}%` : '—', unit: '', color: color.text },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-center">
            <p className={`text-xl font-bold ${item.color}`}>{item.value}<span className="text-xs font-normal text-gray-400 ml-0.5">{item.unit}</span></p>
            <p className="text-[11px] text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* 7章进度条 */}
      <div className="mx-4 mt-4 bg-white rounded-xl border border-gray-100 px-4 py-4">
        <p className="text-xs font-semibold text-gray-400 mb-3">7章覆盖进度</p>
        <div className="flex flex-col gap-3">
          {chapterStats.map(ch => (
            <div key={ch.id} className="flex items-center gap-3">
              {/* 章号 */}
              <span className="text-[11px] text-gray-400 w-4 flex-none text-right">{ch.id}</span>
              {/* 章名 */}
              <span className="text-xs text-gray-700 w-14 flex-none truncate">{ch.name}</span>
              {/* 进度条 */}
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                {ch.total > 0 ? (
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${color.bg}`}
                    style={{ width: `${ch.pct}%` }}
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 rounded-full" />
                )}
              </div>
              {/* 数字或状态 */}
              {ch.total > 0 ? (
                <span className="text-[11px] text-gray-500 w-10 text-right flex-none">
                  {ch.done}/{ch.total}
                </span>
              ) : (
                <span className="text-[10px] text-gray-300 w-10 text-right flex-none">待解锁</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-300 text-center mt-3">第2-7章题库陆续更新中</p>
      </div>

      {/* 快捷操作 */}
      <div className="mx-4 mt-4 flex gap-2">
        <button
          onClick={() => navigate('/quiz')}
          className="flex-1 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl"
        >
          继续刷题
        </button>
        <button
          onClick={() => navigate('/review')}
          className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl"
        >
          查看错题本
        </button>
      </div>

    </div>
  )
}
