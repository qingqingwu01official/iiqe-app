import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'
import { useProgressStore } from '../store/progressStore'
import ImportanceBadge from '../components/ImportanceBadge'
import DifficultyBadge, { SevereBanner } from '../components/DifficultyBadge'
import type { ErrorReason } from '../types'

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const
const ERROR_REASONS: ErrorReason[] = ['概念混淆', '审题失误', '记忆错误', '其他']
const IMPORTANCE_ORDER = ['重中之重', '次重点', '一般重点', '补充考点']

type Phase = 'answering' | 'result' | 'done'

export default function QuizPage() {
  const navigate = useNavigate()
  const { questions, answerQuestion } = useQuestionStore()
  const { addRecord } = useProgressStore()

  // 固定队列顺序（按重要度），但实时读取题目数据（correctRate 等会动态更新）
  const [queueIds] = useState(() =>
    [...questions]
      .sort((a, b) => IMPORTANCE_ORDER.indexOf(a.importance) - IMPORTANCE_ORDER.indexOf(b.importance))
      .map(q => q.id)
  )

  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [selected, setSelected] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [errorReason, setErrorReason] = useState<ErrorReason | undefined>(undefined)
  const [showDeep, setShowDeep] = useState(false)

  const question = questions.find(q => q.id === queueIds[idx])!
  const isSevere = question?.difficulty === '严重难点'

  const handleSelect = (option: string) => {
    if (phase !== 'answering') return
    const correct = answerQuestion(question.id, option)
    setSelected(option)
    setIsCorrect(correct)
    // 严重难点答错 → 默认展开深度解析
    setShowDeep(isSevere && !correct)
    setPhase('result')
  }

  const handleNext = () => {
    // 保存练习记录（含错因）
    addRecord(question.id, isCorrect!, errorReason)

    if (idx + 1 < queueIds.length) {
      setIdx(i => i + 1)
      setPhase('answering')
      setSelected(null)
      setIsCorrect(null)
      setErrorReason(undefined)
      setShowDeep(false)
    } else {
      setPhase('done')
    }
  }

  // ── 完成页 ────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">本轮完成！</h2>
        <p className="text-gray-500 text-sm mb-8">已刷完本章全部 {queueIds.length} 道题</p>
        <button
          onClick={() => navigate('/')}
          className="w-full max-w-xs py-3.5 bg-blue-600 text-white font-semibold rounded-xl"
        >
          返回备考地图
        </button>
      </div>
    )
  }

  // ── 刷题主体 ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* 顶部：进度 + 标签 */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs text-gray-400 font-medium">第1章 · {idx + 1} / {queueIds.length}</span>
          <div className="flex items-center gap-1.5">
            <ImportanceBadge level={question.importance} size="sm" />
            <DifficultyBadge level={question.difficulty} />
          </div>
        </div>
        {/* 进度条 */}
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${((idx + 1) / queueIds.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目 */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-base font-medium text-gray-900 leading-relaxed">{question.question}</p>
      </div>

      {/* 选项 */}
      <div className="px-4 flex flex-col gap-2.5">
        {OPTION_KEYS.map(key => {
          const val = question.options[key as keyof typeof question.options]
          const isAnswer = key === question.answer
          const isChosen = selected === key

          let cardCls = 'bg-white border-gray-200 text-gray-800'
          let dotCls = 'border-gray-300 text-gray-500'

          if (phase === 'result') {
            if (isAnswer) {
              cardCls = 'bg-green-50 border-green-400 text-green-800'
              dotCls = 'bg-green-500 border-green-500 text-white'
            } else if (isChosen) {
              cardCls = 'bg-red-50 border-red-300 text-red-700'
              dotCls = 'bg-red-500 border-red-500 text-white'
            } else {
              cardCls = 'bg-white border-gray-100 text-gray-400'
              dotCls = 'border-gray-200 text-gray-300'
            }
          }

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={phase === 'result'}
              className={`flex items-start gap-3 w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                ${cardCls} ${phase === 'answering' ? 'active:scale-[0.98] hover:border-blue-300 hover:bg-blue-50/40' : ''}`}
            >
              <span className={`flex-none w-6 h-6 rounded-full border-2 text-xs font-bold flex items-center justify-center mt-0.5 transition-colors ${dotCls}`}>
                {key}
              </span>
              <span className="text-sm leading-relaxed">{val}</span>
            </button>
          )
        })}
      </div>

      {/* ── 解析区（答题后展开）4-10 + 4-11 ── */}
      {phase === 'result' && (
        <div className="mt-5 mx-4 mb-8 flex flex-col gap-3">

          {/* 对错结果头 */}
          <div className={`rounded-xl px-4 py-3.5 flex items-center gap-3
            ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <span className="text-2xl flex-none">{isCorrect ? '✅' : '❌'}</span>
            <div>
              <p className={`font-semibold text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '回答正确！' : `回答错误 · 正确答案是 ${question.answer}`}
              </p>
              <p className={`text-xs mt-0.5 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                全局正确率 {Math.round(question.correctRate * 100)}%
              </p>
            </div>
          </div>

          {/* 4-11：严重难点横幅 */}
          {isSevere && <SevereBanner />}

          {/* 4-10：普通解析 */}
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">解析</p>
            <p className="text-sm text-gray-700 leading-relaxed">{question.explanation}</p>
          </div>

          {/* 4-11：深度解析（严重难点 · 可展开） */}
          {isSevere && question.deepExplanation && (
            <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
              <button
                onClick={() => setShowDeep(v => !v)}
                className="flex items-center justify-between w-full px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔍</span>
                  <p className="text-xs font-semibold text-red-600">深度解析 · 知识点溯源</p>
                </div>
                <span className="text-red-400 text-xs font-medium">{showDeep ? '▲ 收起' : '▼ 展开'}</span>
              </button>
              {showDeep && (
                <div className="px-4 pb-4 pt-0">
                  <div className="h-px bg-red-100 mb-3" />
                  <p className="text-sm text-red-800 leading-relaxed whitespace-pre-line">
                    {question.deepExplanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4-10：错因标记（答错时可选） */}
          {!isCorrect && (
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-3.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">我错在哪里？（选填）</p>
              <div className="flex flex-wrap gap-2">
                {ERROR_REASONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setErrorReason(r === errorReason ? undefined : r)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150
                      ${errorReason === r
                        ? 'bg-orange-500 border-orange-500 text-white font-medium'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 继续按钮 */}
          <button
            onClick={handleNext}
            className="w-full py-4 bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {idx + 1 < queueIds.length ? '继续下一题 →' : '完成本轮 🎉'}
          </button>

        </div>
      )}
    </div>
  )
}
