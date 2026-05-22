import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'
import type { Question, BatchLevel } from '../types'

const BATCH_LABEL: Record<BatchLevel, { label: string; colorCls: string }> = {
  1: { label: '★★ 重中之重', colorCls: 'bg-red-100 text-red-700' },
  2: { label: '★ 次重点',    colorCls: 'bg-orange-100 text-orange-700' },
  3: { label: '一般考点',    colorCls: 'bg-blue-100 text-blue-700' },
  4: { label: '补充考点',    colorCls: 'bg-gray-100 text-gray-600' },
}

const DIFFICULTY_ICON: Record<string, string> = {
  '严重难点': '🔥',
  '一般难点': '⚠️',
  '掌握边缘': '💡',
  '已掌握': '✅',
}

type AnswerState = 'idle' | 'correct' | 'wrong'

export default function QuizPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = (searchParams.get('mode') ?? 'foundation') as 'foundation' | 'sprint'
  const batchParam = searchParams.get('batch')
  const focusId = searchParams.get('questionId')

  const { getQueueByMode, getQueueByBatch, getCellState, answerQuestion } = useQuestionStore()

  // 构建题目队列
  const queue: Question[] = batchParam
    ? getQueueByBatch(Number(batchParam) as BatchLevel)
    : getQueueByMode(mode)

  const startIdx = focusId ? Math.max(0, queue.findIndex(q => q.id === focusId)) : 0
  const [idx, setIdx] = useState(startIdx)
  const [selected, setSelected] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [confirmed, setConfirmed] = useState(false)

  const q = queue[idx]

  useEffect(() => {
    setSelected(null)
    setAnswerState('idle')
    setConfirmed(false)
  }, [idx])

  if (!q) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <div className="text-xl font-bold text-gray-900 mb-2">本批次练习完成！</div>
        <div className="text-gray-500 text-sm mb-8">所有题目已练习一遍</div>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-2xl"
        >
          返回
        </button>
      </div>
    )
  }

  const cell = getCellState(q.id)
  const batchCfg = BATCH_LABEL[q.batchLevel]

  const handleConfirm = () => {
    if (!selected || confirmed) return
    const correct = answerQuestion(q.id, selected)
    setAnswerState(correct ? 'correct' : 'wrong')
    setConfirmed(true)
  }

  const handleNext = () => {
    if (idx < queue.length - 1) setIdx(i => i + 1)
    else navigate(-1)
  }

  const handleViewAnalysis = () => {
    navigate(`/analysis/${q.id}?selected=${selected}&back=quiz&mode=${mode}${batchParam ? `&batch=${batchParam}` : ''}`)
  }

  const optionBg = (key: string) => {
    if (!confirmed) {
      return selected === key
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-200 bg-white text-gray-800'
    }
    if (key === q.answer) return 'border-green-500 bg-green-50 text-green-700'
    if (key === selected && selected !== q.answer) return 'border-red-500 bg-red-50 text-red-700'
    return 'border-gray-200 bg-white text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white px-4 pt-12 pb-3 shadow-sm flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-xl w-8">←</button>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700">
            {mode === 'sprint' && batchParam
              ? BATCH_LABEL[Number(batchParam) as BatchLevel]?.label
              : '第一章 · 打基础'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            第 {idx + 1} / {queue.length} 题
          </div>
        </div>
        <button
          onClick={() => navigate('/grid')}
          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm"
        >
          🔲
        </button>
      </header>

      {/* 进度条 */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-1 bg-blue-500 transition-all"
          style={{ width: `${((idx + 1) / queue.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full">
        {/* 题目卡 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          {/* 标签行 */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {mode === 'sprint' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${batchCfg.colorCls}`}>
                {batchCfg.label}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {DIFFICULTY_ICON[q.difficulty]} {q.difficulty}
            </span>
            {cell.status === 'red' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                🔴 错题 · {cell.correctStreak}/3
              </span>
            )}
          </div>

          {/* 考察角度 */}
          {q.topic && (
            <div className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5 mb-3 font-medium">
              考点：{q.topic}
            </div>
          )}

          {/* 题目文本 */}
          <p className="text-base leading-relaxed text-gray-900 font-medium">{q.question}</p>
        </div>

        {/* 选项 */}
        <div className="space-y-3 mb-4">
          {(['A', 'B', 'C', 'D'] as const).map(key => (
            <button
              key={key}
              onClick={() => !confirmed && setSelected(key)}
              disabled={confirmed}
              className={`w-full min-h-[44px] text-left px-4 py-3 rounded-2xl border-2 transition-colors
                ${optionBg(key)}`}
            >
              <span className="font-bold mr-2">{key}.</span>
              {q.options[key]}
            </button>
          ))}
        </div>

        {/* 答对后显示简要正确提示 */}
        {confirmed && answerState === 'correct' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-green-700 font-medium">✅ 回答正确！</p>
            <p className="text-xs text-green-600 mt-1 leading-relaxed">
              {cell.correctStreak > 0
                ? `消灭进度 ${cell.correctStreak}/3 ← 还需 ${3 - cell.correctStreak} 次才变绿`
                : q.explanation.slice(0, 80) + '…'
              }
            </p>
          </div>
        )}

        {/* 答错后提示 */}
        {confirmed && answerState === 'wrong' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-700 font-medium">
              ✗ 答错了 · 正确答案是 {q.answer}
            </p>
            <p className="text-xs text-red-500 mt-1">
              🔴 格子变红，需连续答对 3 次才能消灭
            </p>
          </div>
        )}
      </div>

      {/* 底部操作区 */}
      <div className="bg-white border-t border-gray-100 px-4 py-4 safe-area-pb">
        <div className="max-w-md mx-auto space-y-2">
          {!confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className={`w-full py-3.5 rounded-2xl font-semibold text-base transition-colors
                ${selected
                  ? 'bg-blue-600 text-white active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              确认答案
            </button>
          ) : answerState === 'wrong' ? (
            <>
              <button
                onClick={handleViewAnalysis}
                className="w-full py-3.5 rounded-2xl bg-red-500 text-white font-semibold active:scale-95 transition-transform"
              >
                查看解析 →
              </button>
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-medium active:scale-95 transition-transform"
              >
                先跳过，下一题
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold active:scale-95 transition-transform"
              >
                下一题 →
              </button>
              <button
                onClick={handleViewAnalysis}
                className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-medium active:scale-95 transition-transform"
              >
                查看解析
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
