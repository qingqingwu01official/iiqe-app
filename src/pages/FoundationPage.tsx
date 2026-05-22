import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'

const chapters = [
  { id: 1, name: '风险与保险基础', total: 10 },
  { id: 2, name: '保险合同法律', total: 78, locked: true },
  { id: 3, name: '人寿保险', total: 65, locked: true },
  { id: 4, name: '一般保险', total: 55, locked: true },
  { id: 5, name: '保险监管', total: 42, locked: true },
  { id: 6, name: '强制性保险', total: 38, locked: true },
  { id: 7, name: '保险业务员守则', total: 30, locked: true },
]

export default function FoundationPage() {
  const navigate = useNavigate()
  const { questions, cells } = useQuestionStore()

  const getDoneCount = (chapter: number) => {
    const chapterQs = questions.filter(q => q.chapter === chapter)
    return chapterQs.filter(q => cells[q.id]?.status !== 'gray' && cells[q.id] !== undefined).length
  }

  const getStatus = (_: number, done: number, total: number, locked?: boolean) => {
    if (locked) return { label: '敬请期待', cls: 'text-gray-400 bg-gray-50' }
    if (done === 0) return { label: '未开始', cls: 'text-gray-400 bg-gray-50' }
    if (done >= total) return { label: '已完成', cls: 'text-green-600 bg-green-50' }
    return { label: '进行中', cls: 'text-blue-600 bg-blue-50' }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-xl">←</button>
        <div>
          <div className="text-lg font-bold text-gray-900">📖 打基础模式</div>
          <div className="text-xs text-gray-400 mt-0.5">按知识顺序出题，稳扎稳打</div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-3 max-w-md mx-auto">
        {/* 说明卡 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-800 leading-relaxed">
            📚 适合没看过书或正在第一、二遍学习的考生，按知识顺序出题，不打乱节奏。
          </p>
        </div>

        {chapters.map(ch => {
          const done = ch.locked ? 0 : getDoneCount(ch.id)
          const pct = ch.total > 0 ? Math.round((done / ch.total) * 100) : 0
          const status = getStatus(ch.id, done, ch.total, ch.locked)

          return (
            <button
              key={ch.id}
              onClick={() => !ch.locked && navigate(`/quiz?mode=foundation&chapter=${ch.id}`)}
              disabled={ch.locked}
              className={`w-full bg-white rounded-2xl p-4 border border-gray-100 text-left shadow-sm
                ${ch.locked ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                    ${ch.locked ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                    {ch.id}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      第{ch.id}章 · {ch.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {ch.locked ? '即将开放' : `${done} / ${ch.total} 题`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                    {status.label}
                  </span>
                  {!ch.locked && <span className="text-gray-300">→</span>}
                </div>
              </div>

              {!ch.locked && (
                <div className="mt-3 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 rounded-full h-1.5 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </button>
          )
        })}

        {/* 错题本入口 */}
        <button
          onClick={() => navigate('/errors')}
          className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📕</span>
            <span className="font-medium text-gray-700">错题本</span>
          </div>
          <span className="text-gray-300">→</span>
        </button>
      </div>
    </div>
  )
}
