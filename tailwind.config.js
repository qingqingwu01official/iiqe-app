/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 重要度颜色
        importance: {
          critical: '#DC2626',   // 重中之重 - 红
          major:    '#D97706',   // 次重点   - 橙
          normal:   '#2563EB',   // 一般重点 - 蓝
          extra:    '#6B7280',   // 补充考点 - 灰
        },
        // 难度颜色
        difficulty: {
          severe:   '#DC2626',   // 严重难点 - 红
          moderate: '#D97706',   // 一般难点 - 橙
          edge:     '#CA8A04',   // 掌握边缘 - 黄
          mastered: '#16A34A',   // 已掌握   - 绿
        },
      },
    },
  },
  plugins: [],
}
