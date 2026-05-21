import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'
import { useProgressStore } from '../store/progressStore'
import { CHAPTERS, IMPORTANCE_ORDER, type ChapterInfo } from '../data/chapters'
import type { ImportanceLevel } from '../types'

// ─── 颜色工具 ─────────────────────────────────────────────────────────────────
function rateToColor(rate: number, done: boolean): string {
  if (!done) return 'bg-gray-300'
  if (rate <= 0.60) return 'bg-red-500'
  if (rate <= 0.70) return 'bg-orange-400'
  if (rate <= 0.90) return 'bg-yellow-400'
  return 'bg-green-500'
}

function rateToDot(rate: number | null): string {
  if (rate === null) return '⚪'
  if (rate <= 0.60) return '🔴'
  if (rate <= 0.70) return '🟠'
  if (rate <= 0.90) return '🟡'
  return '🟢'
}

function readinessLabel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: '冲高分',  color: 'text-green-700' }
  if (score >= 50) return { label: '比较稳',  color: 'text-green-600' }
  if (score >= 20) return { label: '接近过线', color: 'text-yellow-600' }
  return               { label: '刚开始',  color: 'text-gray-500' }
}

// ─── 层级进度行 ────────────────────────────────────────────────────────────────
function ImportanceRow({
  level, done, total, rate,
}: { level: ImportanceLevel; done: number; total: number; rate: number | null }) {
  const pct = total > 0 ? done / total : 0
  const labelColor: Record<ImportanceLevel, string> = {
    '重中之重': 'text-red-600',
    '次重点':   'text-orange-600',
    '一般重点': 'text-blue-600',
    '补充考点': 'text-gray-400',
  }
  return (
    <div className="flex items-center gap-2 py-1.5 px-3">
      <span className={`w-16 text-xs shrink-0 ${labelColor[level]}`}>{level}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${rateToColor(rate ?? 0, done > 0)}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-12 text-right shrink-0">
        {done} / {total}
      </span>
      <span className="text-sm w-4 shrink-0">{rateToDot(done > 0 ? (rate ?? 0) : null)}</span>
    </div>
  )
}

// ─── 章节卡片 ──────────────────────────────────────────────────────────────────
function ChapterCard({
  chapter, isExpanded, onToggle, doneMap, rateMap,
}: {
  chapter: ChapterInfo
  isExpanded: boolean
  onToggle: () => void
  doneMap: Record<ImportanceLevel, number>
  rateMap: Record<ImportanceLevel, number | null>
}) {
  const totalDone = IMPORTANCE_ORDER.reduce((s, l) => s + doneMap[l], 0)
  const totalAll  = IMPORTANCE_ORDER.reduce((s, l) => s + chapter.totalByImportance[l], 0)

  const chapterRate = totalDone > 0
    ? IMPORTANCE_ORDER.reduce((s, l) => s + (rateMap[l] ?? 0) * doneMap[l], 0) / totalDone
    : null

  const statusDot = rateToDot(chapterRate)
  const status = totalDone === 0 ? '未开始' : totalDone >= totalAll ? '已完成' : '进行中'
  const statusColor = status === '未开始' ? 'text-gray-400' :
                      status === '已完成' ? 'text-green-600' : 'text-yellow-600'

  // 分数估算
  const estScore = totalAll > 0
    ? Math.round(chapter.expectedScore * (totalDone / totalAll) * (chapterRate ?? 1) * 10) / 10
    : 0

  return (
    <div className="bg-white rounded-xl mb-2 overflow-hidden">
      {/* 章节主标题行 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-3 text-left active:bg-gray-50"
      >
        <span className="text-sm font-semibold text-gray-800 shrink-0">第{chapter.id}章</span>
        <span className="flex-1 text-sm text-gray-700">{chapter.name}</span>
        <span className={`text-xs ${statusColor} shrink-0`}>{status}</span>
        <span className="text-base w-5 shrink-0">{statusDot}</span>
        <span className="text-gray-300 text-xs shrink-0">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* 展开区：层级进度 */}
      {isExpanded && (
        <div className="border-t border-gray-50 pb-1">
          {IMPORTANCE_ORDER.map(level => (
            <ImportanceRow
              key={level}
              level={level}
              done={doneMap[level]}
              total={chapter.totalByImportance[level]}
              rate={rateMap[level]}
            />
          ))}
          {/* 分数估算行 */}
          <div className="px-3 pb-2 pt-1">
            <span className="text-xs text-gray-400">
              第{chapter.id}章估算贡献：约 {estScore} / {chapter.expectedScore} 分
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 今日建议区 ────────────────────────────────────────────────────────────────
function TodaySuggestion({
  readiness, errorQIds, onStart,
}: { readiness: number; errorQIds: string[]; onStart: () => void }) {
  const { questions } = useQuestionStore()
  const severeErrors = errorQIds.filter(id => {
    const q = questions.find(q => q.id === id)
    return q?.difficulty === '严重难点'
  })

  let main: string
  let sub: string
  let btn: string

  const ch1Questions = questions.filter(q => q.chapter === 1)
  const critical = ch1Questions.filter(q => q.importance === '重中之重')

  if (severeErrors.length > 0) {
    const sq = questions.find(q => q.id === severeErrors[0])
    main = `⚠ ${severeErrors.length} 道严重难点待消化`
    sub  = sq ? `「${sq.question.slice(0, 20)}…」建议今天优先攻这题` : '建议优先复习'
    btn  = '立即练习 →'
  } else if (readiness === 0) {
    main = `建议从第1章开始。重中之重 ${critical.length} 道是优先区域`
    sub  = '今天先练前 8 道，预计 15 分钟，贡献约 1 分'
    btn  = '开始练习 →'
  } else if (readiness < 30) {
    const remaining = critical.length
    main = `继续练习 · 第1章还有 ${remaining} 道重中之重`
    sub  = '完成后可贡献约 3 分'
    btn  = '继续 →'
  } else {
    main = '第1章重中之重进展顺利！继续推进次重点'
    sub  = '拿下次重点，第1章可贡献约 7 分'
    btn  = '继续练习 →'
  }

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px]
                    bg-white border-t border-gray-100 px-4 pt-3 pb-2 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <p className="text-xs text-gray-400 mb-1">今日建议</p>
      <p className="text-sm font-medium text-gray-900 leading-snug">{main}</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-2">{sub}</p>
      <button
        onClick={onStart}
        className="w-full bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold
                   rounded-xl py-2.5 transition-colors"
      >
        {btn}
      </button>
    </div>
  )
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────
export default function MapPage() {
  const navigate = useNavigate()
  const { questions } = useQuestionStore()
  const { readinessScore, getErrorQuestions } = useProgressStore()
  const [expandedChapter, setExpandedChapter] = useState<number>(1)

  const errorQIds = getErrorQuestions()
  const { label, color } = readinessLabel(readinessScore)

  // 第1章进度数据（来自 store）
  const ch1DoneMap  = Object.fromEntries(
    IMPORTANCE_ORDER.map(level => {
      const qs = questions.filter(q => q.chapter === 1 && q.importance === level)
      // 简单算：正确率 >= 掌握边缘（>80%）就算做过
      const done = qs.filter(q => q.correctRate < 1.0 && q.correctRate !== 0.52 &&
        q.correctRate !== 0.63 && q.correctRate !== 0.81 &&
        q.correctRate !== 0.91 && q.correctRate !== 0.48 &&
        q.correctRate !== 0.67 && q.correctRate !== 0.84 &&
        q.correctRate !== 0.65 && q.correctRate !== 0.93
        ? 0 : 0).length  // 先全部显示0，等真实做题后更新
      return [level, done]
    })
  ) as Record<ImportanceLevel, number>

  const ch1RateMap = Object.fromEntries(
    IMPORTANCE_ORDER.map(level => {
      const qs = questions.filter(q => q.chapter === 1 && q.importance === level)
      if (qs.length === 0) return [level, null]
      const avg = qs.reduce((s, q) => s + q.correctRate, 0) / qs.length
      return [level, avg]
    })
  ) as Record<ImportanceLevel, number | null>

  // 其他章节全为0
  const emptyDoneMap = Object.fromEntries(IMPORTANCE_ORDER.map(l => [l, 0])) as Record<ImportanceLevel, number>
  const emptyRateMap = Object.fromEntries(IMPORTANCE_ORDER.map(l => [l, null])) as Record<ImportanceLevel, number | null>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 区域0：页眉 */}
      <div className="bg-white px-4 pt-12 pb-3 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-bold text-gray-900">IIQE 卷一备考</h1>
          <span className="text-xs text-gray-400">全卷 7 章 · 75 分</span>
        </div>

        {/* 区域1：准备度轻量条 */}
        <button
          onClick={() => navigate('/progress')}
          className="mt-2 w-full text-left active:opacity-70"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 shrink-0">约 {readinessScore}%</span>
            <span className={`text-xs font-medium shrink-0 ${color}`}>{label}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">完成前 70% 重要考点 → 预估可过线</p>
        </button>
      </div>

      {/* 区域2：备考地图 */}
      <div className="px-3 pt-3 pb-40">
        {CHAPTERS.map(ch => (
          <ChapterCard
            key={ch.id}
            chapter={ch}
            isExpanded={expandedChapter === ch.id}
            onToggle={() => setExpandedChapter(p => p === ch.id ? 0 : ch.id)}
            doneMap={ch.id === 1 ? ch1DoneMap : emptyDoneMap}
            rateMap={ch.id === 1 ? ch1RateMap : emptyRateMap}
          />
        ))}
      </div>

      {/* 区域3：今日建议 吸底 */}
      <TodaySuggestion
        readiness={readinessScore}
        errorQIds={errorQIds}
        onStart={() => navigate('/quiz')}
      />
    </div>
  )
}
