import { useMemo } from 'react'
import { useQuestionStore } from '../store/questionStore'
import { useProgressStore } from '../store/progressStore'
import ImportanceBadge from '../components/ImportanceBadge'
import type { ErrorReason, ImportanceLevel } from '../types'

const ERROR_REASONS: ErrorReason[] = ['概念混淆', '审题失误', '记忆错误', '计算错误', '其他']
const IMPORTANCE_ORDER: ImportanceLevel[] = ['重中之重', '次重点', '一般重点', '补充考点']

const REASON_CONFIG: Record<ErrorReason, { icon: string; color: string; bar: string }> = {
  '概念混淆': { icon: '🔀', color: 'text-purple-600', bar: 'bg-purple-400' },
  '审题失误': { icon: '👁',  color: 'text-orange-600', bar: 'bg-orange-400' },
  '记忆错误': { icon: '💭', color: 'text-blue-600',   bar: 'bg-blue-400' },
  '计算错误': { icon: '🔢', color: 'text-pink-600',   bar: 'bg-pink-400' },
  '其他':     { icon: '❓', color: 'text-gray-500',   bar: 'bg-gray-400' },
}

const IMPORTANCE_COLOR: Record<ImportanceLevel, string> = {
  '重中之重': 'bg-orange-400',
  '次重点':   'bg-purple-400',
  '一般重点': 'bg-green-400',
  '补充考点': 'bg-gray-300',
}

export default function AnalysisPage() {
  const { questions } = useQuestionStore()
  const { records } = useProgressStore()

  const stats = useMemo(() => {
    const questionMap = Object.fromEntries(questions.map(q => [q.id, q]))

    const errorRecords = records.filter(r => !r.isCorrect)
    const totalAnswered = records.length
    const totalErrors = errorRecords.length
    const accuracy = totalAnswered > 0
      ? Math.round(((totalAnswered - totalErrors) / totalAnswered) * 100)
      : null

    // 错因分布
    const reasonCounts = Object.fromEntries(
      ERROR_REASONS.map(r => [r, 0])
    ) as Record<ErrorReason, number>
    let taggedCount = 0
    errorRecords.forEach(r => {
      if (r.errorReason) {
        reasonCounts[r.errorReason]++
        taggedCount++
      }
    })
    const maxReason = Math.max(...Object.values(reasonCounts), 1)

    // 按重要度的错误分布
    const importanceCounts = Object.fromEntries(
      IMPORTANCE_ORDER.map(imp => [imp, 0])
    ) as Record<ImportanceLevel, number>
    errorRecords.forEach(r => {
      const q = questionMap[r.questionId]
      if (q) importanceCounts[q.importance]++
    })
    const maxImportance = Math.max(...Object.values(importanceCounts), 1)

    // 近期趋势（最近10次 vs 再之前10次的正确率对比）
    const recent10 = records.slice(-10)
    const prev10 = records.slice(-20, -10)
    const recentAcc = recent10.length
      ? Math.round(recent10.filter(r => r.isCorrect).length / recent10.length * 100)
      : null
    const prevAcc = prev10.length
      ? Math.round(prev10.filter(r => r.isCorrect).length / prev10.length * 100)
      : null
    const trend = recentAcc !== null && prevAcc !== null ? recentAcc - prevAcc : null

    return {
      totalAnswered,
      totalErrors,
      accuracy,
      reasonCounts,
      taggedCount,
      maxReason,
      importanceCounts,
      maxImportance,
      recentAcc,
      trend,
    }
  }, [questions, records])

  const isEmpty = stats.totalAnswered === 0

  return (
    <div className="min-h-screen bg-gray-50 pb-8">

      {/* 顶部总览 */}
      <div className="bg-white border-b border-gray-100 px-4 pt-5 pb-5">
        <h1 className="text-base font-bold text-gray-900 mb-1">错因分析</h1>
        <p className="text-xs text-gray-400 mb-4">知道错在哪，才能精准补</p>

        {isEmpty ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">还没有答题记录</p>
            <p className="text-xs text-gray-300 mt-1">去刷题后，错因数据会自动出现</p>
          </div>
        ) : (
          <div className="flex gap-3">
            {/* 总答题 */}
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.totalAnswered}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">已答题次</p>
            </div>
            {/* 答错 */}
            <div className="flex-1 bg-red-50 rounded-xl px-3 py-3 text-center border border-red-100">
              <p className="text-2xl font-bold text-red-600">{stats.totalErrors}</p>
              <p className="text-[11px] text-red-400 mt-0.5">答错次</p>
            </div>
            {/* 正确率 */}
            <div className={`flex-1 rounded-xl px-3 py-3 text-center border
              ${(stats.accuracy ?? 0) >= 70 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}
            >
              <p className={`text-2xl font-bold ${(stats.accuracy ?? 0) >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                {stats.accuracy !== null ? `${stats.accuracy}%` : '—'}
              </p>
              <p className={`text-[11px] mt-0.5 ${(stats.accuracy ?? 0) >= 70 ? 'text-green-400' : 'text-orange-400'}`}>
                总正确率
              </p>
            </div>
          </div>
        )}
      </div>

      {!isEmpty && (
        <>
          {/* 近期趋势 */}
          {stats.recentAcc !== null && (
            <div className="mx-4 mt-4 bg-white rounded-xl border border-gray-100 px-4 py-3.5">
              <p className="text-xs font-semibold text-gray-400 mb-2">近期趋势（最近10题）</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stats.recentAcc >= 70 ? 'bg-green-500' : stats.recentAcc >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                    style={{ width: `${stats.recentAcc}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-10 text-right">{stats.recentAcc}%</span>
                {stats.trend !== null && (
                  <span className={`text-xs font-medium ${stats.trend > 0 ? 'text-green-600' : stats.trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {stats.trend > 0 ? `↑ +${stats.trend}%` : stats.trend < 0 ? `↓ ${stats.trend}%` : '持平'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 错因分布 */}
          <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400">错因分布</p>
              {stats.taggedCount < stats.totalErrors && (
                <p className="text-[10px] text-gray-300">
                  {stats.totalErrors - stats.taggedCount} 次未标记错因
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {ERROR_REASONS.map(reason => {
                const count = stats.reasonCounts[reason]
                const pct = Math.round((count / stats.maxReason) * 100)
                const { icon, color, bar } = REASON_CONFIG[reason]
                return (
                  <div key={reason} className="flex items-center gap-3">
                    <span className="text-base w-5 text-center flex-none">{icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${color}`}>{reason}</span>
                        <span className="text-xs text-gray-500">{count} 次</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${bar}`}
                          style={{ width: count > 0 ? `${pct}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {stats.taggedCount === 0 && (
              <p className="text-xs text-gray-300 text-center mt-3">
                答错时选择错因，数据会出现在这里
              </p>
            )}
          </div>

          {/* 薄弱重要度分布 */}
          <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 px-4 py-4">
            <p className="text-xs font-semibold text-gray-400 mb-3">薄弱点分布（按重要度）</p>
            <div className="flex flex-col gap-3">
              {IMPORTANCE_ORDER.map(imp => {
                const count = stats.importanceCounts[imp]
                const pct = Math.round((count / stats.maxImportance) * 100)
                return (
                  <div key={imp} className="flex items-center gap-3">
                    <ImportanceBadge level={imp} size="sm" />
                    <div className="flex-1">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${IMPORTANCE_COLOR[imp]}`}
                          style={{ width: count > 0 ? `${pct}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right flex-none">{count} 次</span>
                  </div>
                )
              })}
            </div>
            {/* 最弱点提示 */}
            {(() => {
              const maxImp = IMPORTANCE_ORDER.find(
                imp => stats.importanceCounts[imp] === Math.max(...Object.values(stats.importanceCounts))
              )
              const maxCount = maxImp ? stats.importanceCounts[maxImp] : 0
              if (!maxImp || maxCount === 0) return null
              return (
                <div className="mt-3 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-orange-700">
                    <span className="font-semibold">薄弱点提示：</span>
                    「{maxImp}」题目错误最多（{maxCount} 次），建议重点攻克
                  </p>
                </div>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}
