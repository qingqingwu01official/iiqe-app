import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PracticeRecord, ErrorReason } from '../types'
import { chapter1Questions } from '../data/chapter1'

interface ProgressState {
  records: PracticeRecord[]
  // 通过准备度（0-100）
  readinessScore: number
  // Actions
  addRecord: (questionId: string, isCorrect: boolean, errorReason?: ErrorReason) => void
  calcReadiness: () => number
  getErrorQuestions: () => string[]
  getChapterProgress: (chapter: number) => { done: number; total: number; mastered: number }
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      records: [],
      readinessScore: 0,

      addRecord: (questionId, isCorrect, errorReason) => {
        const record: PracticeRecord = {
          questionId,
          isCorrect,
          errorReason,
          timestamp: Date.now(),
        }
        set(state => {
          const newRecords = [...state.records, record]
          return { records: newRecords }
        })
        // 重算准备度
        const score = get().calcReadiness()
        set({ readinessScore: score })
      },

      calcReadiness: () => {
        const { records } = get()
        if (records.length === 0) return 0

        // 准备度 = 覆盖率(60%) + 近期正确率(40%)
        // 覆盖率：只统计重中之重+次重点，因为它们占考试得分约75%，
        //         其他考点不刷也不会大幅影响通过率。
        const criticalQuestions = chapter1Questions.filter(
          q => q.importance === '重中之重' || q.importance === '次重点'
        )
        const attemptedIds = new Set(records.map(r => r.questionId))
        const attemptedCritical = criticalQuestions.filter(q => attemptedIds.has(q.id))
        const coverageRate = attemptedCritical.length / criticalQuestions.length

        // 近期正确率：取最近20条，反映当前真实水平而非历史累计
        const recent = records.slice(-20)
        const recentAccuracy = recent.length > 0
          ? recent.filter(r => r.isCorrect).length / recent.length
          : 0

        return Math.round(coverageRate * 0.6 * 100 + recentAccuracy * 0.4 * 100)
      },

      getErrorQuestions: () => {
        // 错题判定规则：以"最近一次作答"为准。
        // 按时间倒序扫描：先碰到"答对"→移出错题本；先碰到"答错"→加入错题本。
        // 这样"上次答对"的题不会出现在错题本，避免已掌握题目反复打扰复习节奏。
        const { records } = get()
        const errorSet = new Set<string>()
        const correctSet = new Set<string>()
        const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp)
        sorted.forEach(r => {
          if (!correctSet.has(r.questionId) && !r.isCorrect) {
            errorSet.add(r.questionId)
          } else if (r.isCorrect) {
            errorSet.delete(r.questionId)
            correctSet.add(r.questionId)
          }
        })
        return [...errorSet]
      },

      getChapterProgress: (chapter) => {
        const questions = chapter1Questions.filter(q => q.chapter === chapter)
        const { records } = get()
        const attemptedIds = new Set(records.map(r => r.questionId))
        const done = questions.filter(q => attemptedIds.has(q.id)).length
        const mastered = questions.filter(q => q.difficulty === '已掌握').length
        return { done, total: questions.length, mastered }
      },
    }),
    { name: 'iiqe-progress' }
  )
)
