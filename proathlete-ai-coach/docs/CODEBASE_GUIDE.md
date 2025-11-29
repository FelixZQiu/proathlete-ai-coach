# 项目工程实现说明 (Codebase Guide)

本项目是一个基于 React 的纯前端单页应用 (SPA)，展示了如何利用大语言模型 (LLM) 构建垂直领域的 AI 应用。

## 1. 技术栈概览

*   **React 18**: 用于构建用户界面的 JavaScript 库。
*   **Vite**: 极速的前端构建工具，替代传统的 Webpack。
*   **TypeScript**: JavaScript 的超集，提供静态类型检查，减少 bug。
*   **Google Gemini API**: 项目的核心“大脑”，负责生成和迭代训练计划。
*   **Tailwind CSS**: 实用优先的 CSS 框架，通过类名快速编写样式。

## 2. 项目目录结构详解

```
proathlete-ai-coach/
├── components/             # 存放 React UI 组件
│   ├── Dashboard.tsx       # 主仪表盘：展示训练计划和打卡界面
│   ├── Onboarding.tsx      # 引导页：初次使用时的档案录入表单
│   └── Settings.tsx        # 设置弹窗：配置 API Key 和模型
├── services/               # 业务逻辑与外部服务调用
│   └── geminiService.ts    # 封装与 Google Gemini API 的交互逻辑
├── App.tsx                 # 根组件：管理全局状态和路由逻辑
├── index.tsx               # 入口文件：将 React 应用挂载到 HTML
├── types.ts                # TypeScript 类型定义：定义数据结构
├── constants.ts            # 全局常量：如运动列表、模型选项
├── .env.local              # 环境变量文件（不上传 Git）：存放 API Key
└── package.json            # 项目配置文件：依赖列表和启动脚本
```

## 3. 关键模块说明

### 3.1 数据结构设计 (`types.ts`)

在阅读代码前，建议先看 `types.ts`。我们定义了几个核心接口：

*   **`UserProfile`**: 用户的身体数据（身高、体重、伤病）和运动表现。
*   **`TrainingPlan`**: AI 生成的训练计划，包含 `days`（每日计划）和 `exercises`（动作）。
*   **`DailyFeedback`**: 用户每日的打卡数据（RPE、疼痛、完成度），这是 AI 迭代计划的依据。

### 3.2 核心逻辑 (`services/geminiService.ts`)

这是项目最核心的部分，包含两个主要函数：

1.  **`generateInitialPlan` (生成初始计划)**
    *   **输入**: 用户档案 (`UserProfile`)
    *   **Prompt**: 扮演体能教练，根据用户数据生成 7 天微周期计划。
    *   **输出**: 强制要求模型返回 JSON 格式，直接解析为 `TrainingPlan` 对象。

2.  **`iteratePlan` (迭代计划)**
    *   **输入**: 上周计划 + 一周的反馈数据 (`feedbacks`)
    *   **Prompt**: 分析用户的 RPE (主观疲劳度) 和疼痛数据。
        *   如果 RPE 过高或有疼痛 -> 降阶 (Deload)
        *   如果 RPE 低且完成度高 -> 渐进超负荷 (Progressive Overload)
    *   **输出**: 生成新一周的计划。

**设计亮点**: 我们使用了 **JSON Schema** 来约束 AI 的输出，确保无论 AI 怎么“思考”，最终返回的一定是程序可读的结构化数据，从而避免了复杂的文本解析。

### 3.3 状态管理 (`App.tsx`)

本项目没有使用 Redux 等复杂的状态库，而是利用 React 的 `useState` 和 `useEffect` 配合 `localStorage` 实现了简单的持久化。

*   **初始化**: 应用启动时，`useEffect` 会从浏览器本地存储读取 `athlete_profile` 和 `athlete_plan`。
*   **更新**: 当用户填写反馈或生成新计划时，状态更新并自动同步写入 `localStorage`。

### 3.4 交互流程

1.  **无档案状态**: 渲染 `<Onboarding />` 组件，收集用户数据。
2.  **有档案无计划**: 调用 `geminiService.generateInitialPlan`。
3.  **有计划状态**: 渲染 `<Dashboard />`，展示本周日程。用户点击某一天可录入反馈。
4.  **周期结束**: 收集满反馈后，用户点击 "Iterate Plan"，调用 `iteratePlan` 生成下周计划。

## 4. 给开发者的建议

1.  **如何修改提示词 (Prompt)**?
    *   打开 `services/geminiService.ts`。
    *   找到 `prompt` 变量。你可以尝试修改系统指令，比如让它“更严厉”或“专注于康复训练”。

2.  **如何增加新的运动项目**?
    *   打开 `types.ts`，在 `Sport` 枚举中添加新项目。
    *   打开 `components/Onboarding.tsx`，确保表单下拉框能选到它。

3.  **如何调试**?
    *   使用 Chrome 开发者工具的 "Application" -> "Local Storage" 标签页，可以查看和清除本地保存的数据。
    *   在 `geminiService.ts` 中添加 `console.log(jsonText)` 可以查看 AI 返回的原始数据，排查 JSON 解析错误。

## 5. 总结

这个项目的核心理念是 **"Prompt Engineering as Code"**。我们不需要写复杂的算法来安排训练，而是把复杂的逻辑“外包”给大模型，通过精心设计的 Prompt 和结构化的数据定义，让 AI 成为业务逻辑的一部分。
