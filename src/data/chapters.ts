import type { ImportanceLevel } from '../types'

export interface ChapterInfo {
  id: number
  name: string
  expectedScore: number   // 期望得分（满分75分全卷分配）
  totalByImportance: Record<ImportanceLevel, number>
}

export const CHAPTERS: ChapterInfo[] = [
  {
    id: 1,
    name: '风险概论',
    expectedScore: 9,
    totalByImportance: { '重中之重': 32, '次重点': 45, '一般重点': 8, '补充考点': 12 },
  },
  {
    id: 2,
    name: '保险合同',
    expectedScore: 12,
    totalByImportance: { '重中之重': 40, '次重点': 50, '一般重点': 15, '补充考点': 10 },
  },
  {
    id: 3,
    name: '人寿保险',
    expectedScore: 11,
    totalByImportance: { '重中之重': 35, '次重点': 42, '一般重点': 12, '补充考点': 8 },
  },
  {
    id: 4,
    name: '一般保险',
    expectedScore: 10,
    totalByImportance: { '重中之重': 30, '次重点': 38, '一般重点': 10, '补充考点': 6 },
  },
  {
    id: 5,
    name: '再保险',
    expectedScore: 8,
    totalByImportance: { '重中之重': 22, '次重点': 30, '一般重点': 8, '补充考点': 5 },
  },
  {
    id: 6,
    name: '保险监管',
    expectedScore: 13,
    totalByImportance: { '重中之重': 42, '次重点': 55, '一般重点': 18, '补充考点': 12 },
  },
  {
    id: 7,
    name: '保险中介',
    expectedScore: 12,
    totalByImportance: { '重中之重': 38, '次重点': 48, '一般重点': 14, '补充考点': 9 },
  },
]

export const IMPORTANCE_ORDER: ImportanceLevel[] = ['重中之重', '次重点', '一般重点', '补充考点']
