import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { questions, getRedCells, getGreenCells, getBatchStats } = useQuestionStore()

  const total = questions.length
  const redCells = getRedCells()
  const greenCells = getGreenCells()
  const doneCount = Object.values(useQuestionStore.getState().cells).filter(
    c => c.status !== 'gray'
  ).length
  const batchStats = getBatchStats()

  const ch1Done = doneCount
  const ch1Pct = total > 0 ? Math.round((ch1Done / total) * 100) : 0
  const batch1Stats = batchStats[1]

  // 今日做题数（简单模拟：本次会话内没法精确统计，展示总做题数）
  const todayCount = doneCount
  const recentAccuracy = doneCount > 0
    ? Math.round((greenCells.length / doneCount) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm">
        <div>
          <div className="text-xs text-gray-400 font-medium">IIQE 卷一备考</div>
          <div className="text-lg font-bold text-gray-900 mt-0.5">备考主页</div>
        </div>
        {/* 眼镜猴吉祥物（占位） */}
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-2xl select-none">
          🦉
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">

        {/* 整体进度卡 */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-80">整体备考进度</span>
            <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">第一章 MVP</span>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <span className="text-3xl font-bold">{ch1Done}</span>
              <span className="text-sm opacity-70"> / {total} 道</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-300 inline-block" />
                <span className="text-sm font-semibold text-red-200">
                  🔴 红格子 {redCells.length} 个待消灭
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-300 inline-block" />
                <span className="text-sm text-green-200">✓ 已掌握 {greenCells.length} 个</span>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${ch1Pct}%` }}
            />
          </div>
          <div className="text-xs opacity-60 mt-1">已完成 {ch1Pct}%</div>
        </div>

        {/* 快速继续 */}
        <button
          onClick={() => navigate('/quiz?mode=foundation')}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
              ▶️
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">继续上次练习</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {doneCount > 0 ? `上次做到第 ${doneCount} 题` : '从第一题开始'}
              </div>
            </div>
          </div>
          <span className="text-gray-300 text-lg">→</span>
        </button>

        {/* 两个模式入口 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 打基础模式 */}
          <button
            onClick={() => navigate('/foundation')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-95 transition-transform"
          >
            <div className="text-2xl mb-2">📖</div>
            <div className="font-bold text-gray-900 text-sm">打基础</div>
            <div className="text-xs text-gray-400 mt-1 leading-relaxed">
              按知识顺序出题<br />
              第一章 {ch1Pct}%
            </div>
            <div className="mt-2 bg-blue-50 rounded-full h-1.5">
              <div
                className="bg-blue-500 rounded-full h-1.5"
                style={{ width: `${ch1Pct}%` }}
              />
            </div>
          </button>

          {/* 考前冲刺 */}
          <button
            onClick={() => navigate('/sprint')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-95 transition-transform"
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-bold text-gray-900 text-sm">考前冲刺</div>
            <div className="text-xs text-gray-400 mt-1 leading-relaxed">
              按重难点算法排序<br />
              红格子 {redCells.length} 个
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-medium">
                ★★ {batch1Stats.total} 道
              </span>
            </div>
          </button>
        </div>

        {/* 今日数据 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm font-semibold text-gray-700 mb-3">今日数据</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{todayCount}</div>
              <div className="text-xs text-gray-400 mt-0.5">已做题</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{recentAccuracy}%</div>
              <div className="text-xs text-gray-400 mt-0.5">正确率</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{redCells.length}</div>
              <div className="text-xs text-gray-400 mt-0.5">红格子</div>
            </div>
          </div>
        </div>

        {/* 重中之重完成度 */}
        {batch1Stats.total > 0 && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-red-800">★★ 重中之重进度</span>
              <span className="text-xs text-red-500">
                {batch1Stats.green}/{batch1Stats.total} 已掌握
              </span>
            </div>
            <div className="bg-red-100 rounded-full h-2">
              <div
                className="bg-red-500 rounded-full h-2 transition-all"
                style={{ width: `${Math.round((batch1Stats.green / batch1Stats.total) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-red-600 mt-2">
              {batch1Stats.red > 0
                ? `⚡ 还有 ${batch1Stats.red} 个红格子待消灭，拿下这批即可通过！`
                : batch1Stats.green === batch1Stats.total
                ? '✅ 重中之重全部掌握！建议冲次重点。'
                : '💪 继续保持，先拿下重中之重！'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
