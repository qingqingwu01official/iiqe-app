export type ImportanceLevel = '重中之重' | '次重点' | '一般重点' | '补充考点'
export type DifficultyLevel = '严重难点' | '一般难点' | '掌握边缘' | '已掌握'
export type ErrorReason = '概念混淆' | '审题失误' | '记忆错误' | '计算错误' | '其他'
export type CellStatus = 'gray' | 'red' | 'green'
export type QuizMode = 'foundation' | 'sprint'

/** batchLevel: 1=重中之重 2=次重点 3=一般重点 4=补充考点 */
export type BatchLevel = 1 | 2 | 3 | 4

export interface Question {
  id: string
  chapter: number
  importance: ImportanceLevel
  batchLevel: BatchLevel
  difficulty: DifficultyLevel
  correctRate: number
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string
  deepExplanation?: string
  topic?: string            // 考察角度（知识点标签）
}

/** 格子状态：消灭红格子机制 */
export interface CellState {
  status: CellStatus
  errorCount: number        // 累计答错次数
  correctStreak: number     // 变红后累计答对次数（0→3 变绿）
}

export interface PracticeRecord {
  questionId: string
  isCorrect: boolean
  errorReason?: ErrorReason
  timestamp: number
}

export interface QuestionMastery {
  questionId: string
  attempts: number
  correctCount: number
  currentDifficulty: DifficultyLevel
  lastPracticed?: number
}
