import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'
import type { ErrorReason, BatchLevel } from '../types'

const BATCH_LABEL: Record<BatchLevel, { label: string; colorCls: string }> = {
  1: { label: '★★ 重中之重', colorCls: 'bg-red-100 text-red-700' },
  2: { label: '★ 次重点',    colorCls: 'bg-orange-100 text-orange-700' },
  3: { label: '一般考点',    colorCls: 'bg-blue-100 text-blue-700' },
  4: { label: '补充考点',    colorCls: 'bg-gray-100 text-gray-600' },
}

const ERROR_REASONS: ErrorReason[] = ['概念混淆', '审题失误', '记忆错误', '计算错误', '其他']
const REASON_LABEL: Record<ErrorReason, string> = {
  '概念混淆': '看不懂题目',
  '审题失误': '误选了',
  '记忆错误': '记忆有误',
  '计算错误': '计算错误',
  '其他': '其他原因',
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const selectedAnswer = searchParams.get('selected')
  const backMode = searchParams.get('mode') ?? 'foundation'
  const backBatch = searchParams.get('batch')

  const { questions, getCellState } = useQuestionStore()
  const q = questions.find(q => q.id === id)

  const [errorReason, setErrorReason] = useState<ErrorReason | null>(null)
  const [feedbackDone, setFeedbackDone] = useState(false)

  if (!q) return <div className="p-8 text-gray-400">题目未找到</div>

  const cell = getCellState(q.id)
  const isCorrect = selectedAnswer === q.answer
  const batchCfg = BATCH_LABEL[q.batchLevel]
  const isDifficult = q.difficulty === '严重难点' || q.difficulty === '一般难点'

  const handleBack = () => navigate(-1)
  const handleNext = () => {
    const base = `/quiz?mode=${backMode}${backBatch ? `&batch=${backBatch}` : ''}`
    navigate(base)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部 */}
      <header className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={handleBack} className="text-gray-400 text-xl">←</button>
        <div>
          <div className="text-sm font-medium text-gray-700">解析</div>
          {q.topic && <div className="text-xs text-gray-400 mt-0.5">考点：{q.topic}</div>}
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* 题目回顾 */}
        <div className="bg-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${batchCfg.colorCls}`}>
              {batchCfg.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${q.difficulty === '严重难点' ? 'bg-red-100 text-red-700' :
                q.difficulty === '一般难点' ? 'bg-orange-100 text-orange-700' :
                q.difficulty === '掌握边缘' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'}`}
            >
              {q.difficulty === '严重难点' ? '🔥' : q.difficulty === '一般难点' ? '⚠️' : q.difficulty === '掌握边缘' ? '💡' : '✅'} {q.difficulty}
            </span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">{q.question}</p>

          {/* 选项对比 */}
          <div className="mt-3 space-y-2">
            {(['A', 'B', 'C', 'D'] as const).map(key => {
              const isUserChoice = key === selectedAnswer
              const isCorrectAns = key === q.answer
              let cls = 'border-gray-200 bg-white text-gray-500'
              if (isCorrectAns) cls = 'border-green-400 bg-green-50 text-green-700'
              else if (isUserChoice && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-700'

              return (
                <div key={key} className={`px-3 py-2 rounded-xl border text-xs ${cls}`}>
                  <span className="font-bold mr-1.5">{key}.</span>
                  {q.options[key]}
                  {isCorrectAns && <span className="ml-2 font-bold">✓ 正确答案</span>}
                  {isUserChoice && !isCorrect && <span className="ml-2 font-bold">✗ 你的选择</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* 格子消灭进度 */}
        <div className={`rounded-xl px-4 py-3 flex items-center justify-between
          ${cell.status === 'red' ? 'bg-red-50 border border-red-100' :
            cell.status === 'green' ? 'bg-green-50 border border-green-100' :
            'bg-gray-50 border border-gray-100'}`}
        >
          <div className="text-sm font-medium">
            {cell.status === 'green' ? '✅ 格子已变绿' :
             cell.status === 'red' ? `🔴 红格子 · 消灭进度 ${cell.correctStreak}/3` :
             '⬜ 首次作答'}
          </div>
          {cell.status === 'red' && (
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full border-2 ${
                    i < cell.correctStreak ? 'bg-green-400 border-green-400' : 'bg-white border-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 一般解析 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-sm font-bold text-gray-900 mb-3">📝 解析</div>
          <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
          <button className="mt-3 text-xs text-blue-500 border border-blue-200 rounded-lg px-3 py-1.5 flex items-center gap-1">
            📖 打开教材原文
          </button>
        </div>

        {/* 难点专区（严重/一般难点专属） */}
        {isDifficult && (
          <div className={`rounded-2xl p-5 shadow-sm
            ${q.difficulty === '严重难点' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}
          >
            <div className={`text-sm font-bold mb-3
              ${q.difficulty === '严重难点' ? 'text-red-800' : 'text-orange-800'}`}
            >
              {q.difficulty === '严重难点' ? '🔥 严重难点深度解析' : '⚠️ 一般难点深度解析'}
            </div>
            {q.deepExplanation ? (
              <p className="text-sm leading-relaxed text-gray-700">{q.deepExplanation}</p>
            ) : (
              <div className="bg-white/60 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🎬</div>
                <div className="text-sm text-gray-600 font-medium">深度解析视频</div>
                <div className="text-xs text-gray-400 mt-1">讲透核心难点，即将上线</div>
              </div>
            )}
          </div>
        )}

        {/* 错因反馈栏（非严重/一般难点才显示） */}
        {!isDifficult && !isCorrect && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-bold text-gray-900 mb-3">这道题哪里不明白？</div>
            {!feedbackDone ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {ERROR_REASONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setErrorReason(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors
                        ${errorReason === r
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                    >
                      {REASON_LABEL[r]}
                    </button>
                  ))}
                </div>
                {errorReason && (
                  <button
                    onClick={() => setFeedbackDone(true)}
                    className="mt-3 w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl"
                  >
                    提交反馈 ✓
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-green-600">✅ 已记录，感谢反馈！</p>
            )}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 safe-area-pb">
        <div className="max-w-md mx-auto space-y-2">
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-2xl active:scale-95 transition-transform"
          >
            已理解，下一题 →
          </button>
          <button
            onClick={() => navigate(`/quiz?mode=${backMode}${backBatch ? `&batch=${backBatch}` : ''}&questionId=${q.id}`)}
            className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-2xl active:scale-95 transition-transform"
          >
            重做这道题
          </button>
        </div>
      </div>
    </div>
  )
}
