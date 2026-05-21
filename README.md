# IIQE 卷一备考 App

> 看学做改会 · 以重点题库为核心，帮助考生最快速通过 IIQE 卷一考试。

---

## 快速启动

**环境要求：** Node.js ≥ 18

```bash
# 1. 安装依赖
npm install

# 2. 本地开发
npm run dev
# 打开 http://localhost:5173

# 3. 构建生产包
npm run build

# 4. 预览生产包
npm run preview
```

---

## 线上地址

| 环境 | 地址 |
|---|---|
| Production | https://iiqe-app.vercel.app |
| GitHub | https://github.com/qingqingwu01official/iiqe-app |

---

## 项目结构

```
src/
├── types/          # TypeScript 类型定义（Question, PracticeRecord 等）
├── data/
│   ├── chapter1.ts # 第1章题库 Mock 数据（10题，含 deepExplanation）
│   └── chapters.ts # 7章元数据（章名、期望得分、重要度分布）
├── store/
│   ├── questionStore.ts  # 题目状态 + 正确率更新算法
│   └── progressStore.ts  # 练习记录 + 准备度计算 + 错题判定
├── components/
│   ├── ImportanceBadge.tsx  # 重要度标签（重中之重/次重点/一般重点/补充考点）
│   ├── DifficultyBadge.tsx  # 难度标签 + 严重难点横幅
│   ├── ProgressRing.tsx     # 圆形准备度指示器
│   └── BottomNav.tsx        # 底部 Tab 导航
└── pages/
    ├── MapPage.tsx      # 【看】备考地图 / 首页
    ├── QuizPage.tsx     # 【做】刷题页 + 解析区 + 严重难点深度解析
    ├── ReviewPage.tsx   # 【改】难点复习（三遍学习法分层）
    ├── ProgressPage.tsx # 【会】通过准备度（圆环 + 7章进度）
    └── AnalysisPage.tsx # 【改】错因分析（错因分布 + 薄弱点）
```

---

## 核心功能

| 页面 | 功能 |
|---|---|
| 备考地图 | 7章状态总览，今日建议，准备度快看 |
| 刷题页 | 按重要度排队，即时对错反馈，错因标记 |
| 解析区 | 普通解析 + 严重难点深度解析（答错自动展开）|
| 难点复习 | 三遍学习法：第一遍→第二遍→第三遍错题本 |
| 通过准备度 | 圆环仪表盘，7章覆盖进度，今日建议 |
| 错因分析 | 错因分布条，薄弱点自动识别 |

---

## 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | React 19 + TypeScript | 类型安全，组件化 |
| 构建 | Vite | 秒级热更新 |
| 样式 | Tailwind CSS | 原子类，设计系统统一 |
| 状态 | Zustand + persist | 3行建 store，数据自动持久化 |
| 路由 | React Router v7 | 标准移动端多页路由 |
| 部署 | Vercel | 零配置，push 即上线 |

---

## 准备度算法说明

```
准备度 = 覆盖率(60%) + 近期正确率(40%)

覆盖率 = 已答"重中之重+次重点"题数 / 该类题总数
近期正确率 = 最近20次答题的正确率

状态阈值：
  ≥80 → 有望通过
  ≥60 → 接近过线
  ≥30 → 打好基础
   <30 → 刚刚起步
```

---

## 遗留与待扩展

- 第 2–7 章题库待录入（当前仅第1章10题 Mock）
- 无用户账号系统，数据存 localStorage（换设备会清空）
- 无真实后端，题库更新需重新部署
- 详见 `260521_软件工程表_v2.xlsx` → 遗留问题清单
