import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, DifficultyLevel, CellState, CellStatus, BatchLevel } from '../types'
import { chapter1Questions } from '../data/chapter1'

/**
 * 难度等级阈值：答对 +5%，答错 -8%（非对称，防止靠猜题掩盖薄弱点）
 */
function calcDifficulty(correctRate: number): DifficultyLevel {
  if (correctRate <= 0.60) return '严重难点'
  if (correctRate <= 0.70) return '一般难点'
  if (correctRate <= 0.90) return '掌握边缘'
  return '已掌握'
}

/**
 * 消灭红格子机制：
 * - 答错 → 立刻变红，streak 归零
 * - 灰格子答对 → 直接变绿
 * - 红格子累计答对 3 次 → 变绿
 * - 绿格子再次答错 → 重新变红，streak 归零
 */
function updateCellState(cell: CellState, isCorrect: boolean): CellState {
  if (!isCorrect) {
    return { status: 'red', errorCount: cell.errorCount + 1, correctStreak: 0 }
  }
  if (cell.status === 'gray') {
    return { status: 'green', errorCount: 0, correctStreak: 0 }
  }
  if (cell.status === 'red') {
    const newStreak = cell.correctStreak + 1
    if (newStreak >= 3) {
      return { status: 'green', errorCount: cell.errorCount, correctStreak: 0 }
    }
    return { ...cell, correctStreak: newStreak }
  }
  // already green
  return cell
}

const defaultCell = (): CellState => ({ status: 'gray', errorCount: 0, correctStreak: 0 })

interface QuestionState {
  questions: Question[]
  // 格子状态：questionId → CellState
  cells: Record<string, CellState>

  // Actions
  answerQuestion: (questionId: string, selected: string) => boolean
  getCellState: (questionId: string) => CellState
  getRedCells: () => string[]
  getGreenCells: () => string[]
  getQueueByMode: (mode: 'foundation' | 'sprint') => Question[]
  getQueueByBatch: (batch: BatchLevel) => Question[]
  getBatchStats: () => Record<BatchLevel, { total: number; red: number; green: number; gray: number }>
  getCellStatusColor: (status: CellStatus) => string
  resetAll: () => void
}

export const useQuestionStore = create<QuestionState>()(
  persist(
    (set, get) => ({
      questions: chapter1Questions,
      cells: {},

      answerQuestion: (questionId, selected) => {
        const q = get().questions.find(q => q.id === questionId)
        if (!q) return false
        const isCorrect = selected === q.answer

        const currentCell = get().cells[questionId] ?? defaultCell()
        const newCell = updateCellState(currentCell, isCorrect)

        // 正确率更新：答对 +5%，答错 -8%
        const newRate = isCorrect
          ? Math.min(1, q.correctRate + 0.05)
          : Math.max(0, q.correctRate - 0.08)

        set(state => ({
          cells: { ...state.cells, [questionId]: newCell },
          questions: state.questions.map(question =>
            question.id !== questionId ? question : {
              ...question,
              correctRate: newRate,
              difficulty: calcDifficulty(newRate),
            }
          ),
        }))
        return isCorrect
      },

      getCellState: (questionId) => get().cells[questionId] ?? defaultCell(),

      getRedCells: () => {
        const { cells } = get()
        return Object.entries(cells)
          .filter(([, c]) => c.status === 'red')
          .map(([id]) => id)
      },

      getGreenCells: () => {
        const { cells } = get()
        return Object.entries(cells)
          .filter(([, c]) => c.status === 'green')
          .map(([id]) => id)
      },

      // 打基础模式：按章节顺序
      // 考前冲刺模式：按重要度（batchLevel）排序
      getQueueByMode: (mode) => {
        const { questions } = get()
        if (mode === 'foundation') {
          return [...questions].sort((a, b) => a.chapter - b.chapter)
        }
        return [...questions].sort((a, b) => {
          if (a.batchLevel !== b.batchLevel) return a.batchLevel - b.batchLevel
          // 红格子优先
          const cellA = get().cells[a.id]?.status ?? 'gray'
          const cellB = get().cells[b.id]?.status ?? 'gray'
          const priority = { red: 0, gray: 1, green: 2 }
          return priority[cellA] - priority[cellB]
        })
      },

      getQueueByBatch: (batch) => {
        const { questions } = get()
        return [...questions]
          .filter(q => q.batchLevel === batch)
          .sort((a, b) => {
            const cellA = get().cells[a.id]?.status ?? 'gray'
            const cellB = get().cells[b.id]?.status ?? 'gray'
            const priority = { red: 0, gray: 1, green: 2 }
            return priority[cellA] - priority[cellB]
          })
      },

      getBatchStats: () => {
        const { questions, cells } = get()
        const result = { 1: { total: 0, red: 0, green: 0, gray: 0 },
                         2: { total: 0, red: 0, green: 0, gray: 0 },
                         3: { total: 0, red: 0, green: 0, gray: 0 },
                         4: { total: 0, red: 0, green: 0, gray: 0 } } as Record<BatchLevel, { total: number; red: number; green: number; gray: number }>
        questions.forEach(q => {
          const b = q.batchLevel
          const status = cells[q.id]?.status ?? 'gray'
          result[b].total++
          result[b][status]++
        })
        return result
      },

      getCellStatusColor: (status) => {
        if (status === 'green') return '#4CAF50'
        if (status === 'red') return '#EF5350'
        return '#BDBDBD'
      },

      resetAll: () => set({ cells: {} }),
    }),
    { name: 'iiqe-questions-v2' }
  )
)
