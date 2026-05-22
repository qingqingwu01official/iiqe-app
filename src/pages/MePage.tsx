import { useNavigate } from 'react-router-dom'
import { useQuestionStore } from '../store/questionStore'

export default function MePage() {
  const navigate = useNavigate()
  const { questions, getRedCells, getGreenCells, resetAll } = useQuestionStore()

  const total = questions.length
  const redCount = getRedCells().length
  const greenCount = getGreenCells().length
  const grayCount = total - redCount - greenCount

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-3xl">🦉</div>
          <div>
            <div className="font-bold text-gray-900">我的备考</div>
            <div className="text-xs text-gray-400 mt-0.5">IIQE 卷一</div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* 备考状态总结 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm font-bold text-gray-800 mb-4">📊 备考状态</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto mb-1.5" />
              <div className="text-lg font-bold text-gray-600">{grayCount}</div>
              <div className="text-xs text-gray-400">未做</div>
            </div>
            <div>
              <div className="w-8 h-8 bg-red-400 rounded-lg mx-auto mb-1.5" />
              <div className="text-lg font-bold text-red-500">{redCount}</div>
              <div className="text-xs text-gray-400">红格子</div>
            </div>
            <div>
              <div className="w-8 h-8 bg-green-400 rounded-lg mx-auto mb-1.5" />
              <div className="text-lg font-bold text-green-600">{greenCount}</div>
              <div className="text-xs text-gray-400">已掌握</div>
            </div>
          </div>
          <div className="mt-4 bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 rounded-full h-2 transition-all"
              style={{ width: `${total > 0 ? (greenCount / total) * 100 : 0}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            整体掌握率 {total > 0 ? Math.round((greenCount / total) * 100) : 0}%
          </div>
        </div>

        {/* 快速跳转 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {[
            { icon: '🔲', label: '格子总览', to: '/grid' },
            { icon: '📕', label: '错题本', to: '/errors' },
            { icon: '📖', label: '打基础模式', to: '/foundation' },
            { icon: '⚡', label: '考前冲刺模式', to: '/sprint' },
          ].map(({ icon, label, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors active:scale-98"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <span className="ml-auto text-gray-300">→</span>
            </button>
          ))}
        </div>

        {/* 重置数据 */}
        <button
          onClick={() => {
            if (window.confirm('确认重置所有答题记录吗？此操作不可撤销。')) {
              resetAll()
              navigate('/')
            }
          }}
          className="w-full py-3 bg-gray-100 text-gray-500 text-sm font-medium rounded-2xl active:scale-95 transition-transform"
        >
          重置答题记录
        </button>
      </div>
    </div>
  )
}
