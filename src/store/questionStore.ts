import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, DifficultyLevel } from '../types'
import { chapter1Questions } from '../data/chapter1'

/**
 * 根据累计正确率实时计算难度等级。
 * 阈值设计依据：≤60% 是考生普遍卡壳的分水岭（严重难点），
 * >90% 视为已稳定掌握。每次答题后调用，驱动难点复习页的分层展示。
 */
function calcDifficulty(correctRate: number): DifficultyLevel {
  if (correctRate <= 0.60) return '严重难点'
  if (correctRate <= 0.70) return '一般难点'
  if (correctRate <= 0.90) return '掌握边缘'
  return '已掌握'
}

interface QuestionState {
  questions: Question[]
  currentIndex: number
  // 当前答题会话
  sessionAnswers: Record<string, string>   // questionId → 选择的选项
  sessionResults: Record<string, boolean>  // questionId → 是否正确

  // Actions
  answerQuestion: (questionId: string, selected: string) => boolean
  nextQuestion: () => void
  resetSession: () => void
  getCurrentQuestion: () => Question | null
  getQueueByImportance: () => Question[]
}

export const useQuestionStore = create<QuestionState>()(
  persist(
    (set, get) => ({
      questions: chapter1Questions,
      currentIndex: 0,
      sessionAnswers: {},
      sessionResults: {},

      answerQuestion: (questionId, selected) => {
        const q = get().questions.find(q => q.id === questionId)
        if (!q) return false
        const isCorrect = selected === q.answer

        // 正确率更新：答对 +5%，答错 -8%（非对称设计：犯错惩罚大于奖励，
        // 避免靠运气刷分掩盖真实薄弱点）
        set(state => ({
          sessionAnswers: { ...state.sessionAnswers, [questionId]: selected },
          sessionResults: { ...state.sessionResults, [questionId]: isCorrect },
          questions: state.questions.map(question => {
            if (question.id !== questionId) return question
            const newRate = isCorrect
              ? Math.min(1, question.correctRate + 0.05)
              : Math.max(0, question.correctRate - 0.08)
            return {
              ...question,
              correctRate: newRate,
              difficulty: calcDifficulty(newRate),
            }
          }),
        }))
        return isCorrect
      },

      nextQuestion: () => {
        set(state => ({
          currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
        }))
      },

      resetSession: () => {
        set({ currentIndex: 0, sessionAnswers: {}, sessionResults: {} })
      },

      getCurrentQuestion: () => {
        const { questions, currentIndex } = get()
        return questions[currentIndex] ?? null
      },

      // 按重要度排序的刷题队列
      getQueueByImportance: () => {
        const order = ['重中之重', '次重点', '一般重点', '补充考点']
        return [...get().questions].sort(
          (a, b) => order.indexOf(a.importance) - order.indexOf(b.importance)
        )
      },
    }),
    { name: 'iiqe-questions' }
  )
)
