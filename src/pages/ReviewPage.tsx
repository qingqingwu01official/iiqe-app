import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'
import { useProgressStore } from '../store/progressStore'
import ImportanceBadge from '../components/ImportanceBadge'
import DifficultyBadge from '../components/DifficultyBadge'
import type { Question } from '../types'

const DIFFICULTY_ORDER = ['严重难点', '一般难点', '掌握边缘', '已掌握']
const IMPORTANCE_ORDER = ['重中之重', '次重点', '一般重点', '补充考点']

function sortQuestions(qs: Question[]) {
  return [...qs].sort((a, b) => {
    const d = DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty)
    if (d !== 0) return d
    return IMPORTANCE_ORDER.indexOf(a.importance) - IMPORTANCE_ORDER.indexOf(b.importance)
  })
}

// ── 单道题卡片 ────────────────────────────────────────────
interface QuestionCardProps {
  q: Question
  passLabel: 'first' | 'second' | 'repeat'
  onRedo: () => void
}

function QuestionCard({ q, passLabel, onRedo }: QuestionCardProps) {
  const isSevere = q.difficulty === '严重难点'
  return (
    <div className={`bg-white rounded-xl border px-4 py-3.5 flex flex-col gap-2
      ${isSevere ? 'border-red-200' : 'border-gray-100'}`}
    >
      {/* 题目文字 */}
      <p className="text-sm text-gray-800 leading-snug line-clamp-2">{q.question}</p>

      {/* 底部：标签 + 正确率 + 操作 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <ImportanceBadge level={q.importance} size="sm" />
          <DifficultyBadge level={q.difficulty} />
          {passLabel === 'repeat' && (
            <span className="text-[10px] text-red-500 font-medium">
              正确率 {Math.round(q.correctRate * 100)}%
            </span>
          )}
        </div>
        <button
          onClick={onRedo}
          className={`flex-none text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
            ${isSevere
              ? 'bg-red-50 text-red-600 border border-red-200 active:bg-red-100'
              : 'bg-blue-50 text-blue-600 border border-blue-100 active:bg-blue-100'
            }`}
        >
          {passLabel === 'first' ? '去刷' : '重做'}
        </button>
      </div>
    </div>
  )
}

// ── 分组标题 ────────────────────────────────────────────
interface SectionHeaderProps {
  pass: 1 | 2 | 3
  count: number
  isEmpty: boolean
}

function SectionHeader({ pass, count, isEmpty }: SectionHeaderProps) {
  const CONFIG = {
    1: {
      dot: 'bg-gray-400',
      label: '第一遍',
      sub: '还没刷过，先过一遍',
      badge: 'bg-gray-100 text-gray-500',
    },
    2: {
      dot: 'bg-blue-500',
      label: '第二遍',
      sub: '已刷过，待巩固',
      badge: 'bg-blue-50 text-blue-600',
    },
    3: {
      dot: 'bg-red-500',
      label: '第三遍及以后',
      sub: '错题本 · 反复练到掌握为止',
      badge: 'bg-red-50 text-red-600',
    },
  }
  const c = CONFIG[pass]
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-2">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full flex-none ${c.dot}`} />
        <div>
          <span className="text-sm font-semibold text-gray-800">{c.label}</span>
          <span className="text-xs text-gray-400 ml-2">{c.sub}</span>
        </div>
      </div>
      {isEmpty
        ? <span className="text-xs text-green-600 font-medium">✓ 已清零</span>
        : <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{count} 题</span>
      }
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────
export default function ReviewPage() {
  const navigate = useNavigate()
  const { questions } = useQuestionStore()
  const { records, getErrorQuestions } = useProgressStore()

  const { firstPass, secondPass, repeatPass, totalError } = useMemo(() => {
    const attemptedIds = new Set(records.map(r => r.questionId))
    const errorIds = new Set(getErrorQuestions())

    // 第一遍：从未做过
    const firstPass = sortQuestions(
      questions.filter(q => !attemptedIds.has(q.id))
    )
    // 第三遍及以后：做过 + 当前仍是错题
    const repeatPass = sortQuestions(
      questions.filter(q => errorIds.has(q.id))
    )
    // 第二遍：做过 + 不在错题本 + 还未完全掌握
    const secondPass = sortQuestions(
      questions.filter(q =>
        attemptedIds.has(q.id) &&
        !errorIds.has(q.id) &&
        q.difficulty !== '已掌握'
      )
    )

    return {
      firstPass,
      secondPass,
      repeatPass,
      totalError: errorIds.size,
    }
  }, [questions, records, getErrorQuestions])

  const totalQuestions = questions.length
  const masteredCount = questions.filter(q => q.difficulty === '已掌握').length
  const masteredPct = Math.round((masteredCount / totalQuestions) * 100)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">

      {/* 顶部总览 */}
      <div className="bg-white border-b border-gray-100 px-4 pt-5 pb-4">
        <h1 className="text-base font-bold text-gray-900 mb-1">难点复习</h1>
        <p className="text-xs text-gray-400 mb-3">按三遍学习法组织 · 清零所有格子即通关</p>

        {/* 进度总览条 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${masteredPct}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap flex-none">
            已掌握 {masteredCount}/{totalQuestions}
          </span>
        </div>

        {/* 三格状态 */}
        <div className="flex gap-2 mt-3">
          {[
            { label: '待首刷', count: firstPass.length, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
            { label: '待巩固', count: secondPass.length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { label: '错题本', count: repeatPass.length, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          ].map(item => (
            <div key={item.label} className={`flex-1 rounded-xl border px-3 py-2.5 text-center ${item.bg}`}>
              <p className={`text-lg font-bold ${item.color}`}>{item.count}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {/* 全部掌握状态 */}
        {totalError === 0 && masteredCount === totalQuestions && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
            <p className="text-sm font-semibold text-green-700">🎉 本章全部掌握！</p>
            <p className="text-xs text-green-500 mt-0.5">错题本已清零，继续保持</p>
          </div>
        )}
      </div>

      {/* ── 第三遍及以后：错题本（最高优先级，放最前） ── */}
      <SectionHeader pass={3} count={repeatPass.length} isEmpty={repeatPass.length === 0} />
      {repeatPass.length === 0 ? (
        <div className="mx-4 bg-white rounded-xl border border-gray-100 px-4 py-5 text-center">
          <p className="text-sm text-gray-400">暂无错题 · 继续保持 💪</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-2.5">
          {repeatPass.map(q => (
            <QuestionCard key={q.id} q={q} passLabel="repeat" onRedo={() => navigate('/quiz')} />
          ))}
        </div>
      )}

      {/* ── 第二遍：待巩固 ── */}
      <SectionHeader pass={2} count={secondPass.length} isEmpty={secondPass.length === 0} />
      {secondPass.length === 0 ? (
        <div className="mx-4 bg-white rounded-xl border border-gray-100 px-4 py-5 text-center">
          <p className="text-sm text-gray-400">暂无待巩固题目</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-2.5">
          {secondPass.map(q => (
            <QuestionCard key={q.id} q={q} passLabel="second" onRedo={() => navigate('/quiz')} />
          ))}
        </div>
      )}

      {/* ── 第一遍：待首刷 ── */}
      <SectionHeader pass={1} count={firstPass.length} isEmpty={firstPass.length === 0} />
      {firstPass.length === 0 ? (
        <div className="mx-4 bg-white rounded-xl border border-gray-100 px-4 py-5 text-center">
          <p className="text-sm text-gray-400">所有题目已首刷完成 ✓</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-2.5">
          {firstPass.map(q => (
            <QuestionCard key={q.id} q={q} passLabel="first" onRedo={() => navigate('/quiz')} />
          ))}
        </div>
      )}

    </div>
  )
}
