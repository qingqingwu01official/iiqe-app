export type ImportanceLevel = '重中之重' | '次重点' | '一般重点' | '补充考点'
export type DifficultyLevel = '严重难点' | '一般难点' | '掌握边缘' | '已掌握'
export type ErrorReason = '概念混淆' | '审题失误' | '记忆错误' | '计算错误' | '其他'

export interface Question {
  id: string
  chapter: number
  importance: ImportanceLevel
  difficulty: DifficultyLevel
  correctRate: number        // 0-1，实时更新
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string
  deepExplanation?: string   // 严重难点专用深度解析
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
